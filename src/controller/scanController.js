const { AIService } = require('../services/aiServices');
const NodeCache = require('node-cache');
const { setStatus, getStatus } = require('./indexStatusStore');
const { logger } = require('../utils/logger');
const Sentry = require('../utils/instrument');
const { logEvent } = require('../controller/analyticsController');
const { fdkExtension } = require('../fdkConfig/fdkConfig');

const CACHE_TTL = 1800; // 30 minutes
const productCache = new NodeCache({ stdTTL: CACHE_TTL });
const aiService = new AIService();

const requestInfo = req => {
  try {
    const { application_id, company_id } = req.query || null;
    if (application_id && company_id) {
      return { application_id, company_id };
    }

    const appDataHeader = req.headers['x-application-data'];
    if (appDataHeader) {
      try {
        const appData =
          typeof appDataHeader === 'string' ? JSON.parse(appDataHeader) : appDataHeader;

        return {
          application_id: appData?._id,
          company_id: appData?.company_id,
        };
      } catch (e) {
        logger.error('Failed to parse x-application-data', { error: e });
      }
    }
    return null;
  } catch (error) {
    logger.error('Error in requestInfo', { error });
    Sentry.captureException(error);
    return null;
  }
};

/**
 * Fetches all products with pagination support.
 */
const fetchProducts = async (platformClient, applicationId) => {
  const pageSize = 50;
  let pageNo = 1;
  let allProducts = [];
  const fetchPage = async page => {
    return applicationId
      ? await platformClient
          .application(applicationId)
          .catalog.getAppProducts({ pageNo: page, pageSize })
      : await platformClient.catalog.getProducts({ pageNo: page, pageSize });
  };

  const firstResponse = await fetchPage(pageNo);
  const totalPages = firstResponse?.page?.totalPages || 1;
  allProducts.push(...(firstResponse.items || []));

  for (let i = 2; i <= totalPages; i++) {
    const response = await fetchPage(i);
    allProducts.push(...(response.items || []));
  }
  logger.info('Fetched all products', { productCount: allProducts.length });
  return allProducts;
};

/**
 * @desc Starts indexing all products asynchronously.
 */
exports.initProductIndexing = async (req, res) => {
  const { platformClient } = req;
  const { company_id, application_id } = req.query;
  
  try {
    const products = await fetchProducts(platformClient, application_id);

    if (!products.length) {
      logger.warn('No products found to index', { application_id, company_id });
      return res.status(400).json({ error: 'No products found to index' });
    }

    setStatus(application_id, 'in-progress');

    aiService
      .indexProducts(products, company_id, application_id)
      .then(() => {
        setStatus(application_id, 'completed');
        logger.info('Indexing completed', { application_id, company_id });
      })
      .catch(err => {
        setStatus(application_id, 'failed');
        logger.error('Indexing failed', { error: err, application_id, company_id });
      });

    logger.info('Indexing started in background', {
      productCount: products.length,
      application_id,
      company_id,
    });

    res.json({ success: true, message: 'Indexing started in background' });
  } catch (error) {
    logger.error('Error in initProductIndexing', { error, application_id, company_id });
    Sentry.captureException('Error in initProductIndexing function', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Returns indexing status.
 */
exports.getIndexStatus = (req, res) => {
  const status = getStatus(req.query.application_id);
  logger.info('Fetched index status', { application_id: req.query.application_id, status });
  res.json({ status });
};

/**
 * @desc Indexes a single product by ID or slug.
 */
exports.indexSingleProduct = async (productData, companyId, platformClient) => {
  try {
    const id = productData.slug || productData.id;
    if (!id) throw new Error('Product ID or slug is required');

    const product = await platformClient.catalog.getProduct({ id });
    if (!product) throw new Error('Product not found');

    await aiService.indexSingleProduct(product, companyId);

    logger.info('Single product indexed', { id, companyId });
    return { success: true, result: { products: product } };
  } catch (error) {
    logger.error('Error indexing single product', { error, companyId });
    Sentry.captureException('Error in indexSingleProduct function', error);
    throw error;
  }
};

/**
 * @desc Search for products using uploaded image.
 * configuration.config.companyId
 */
exports.searchByImage = async (req, res) => {
  const { platformClient } = req;
  const info = requestInfo(req);
  if (!info) {
    return res.status(400).json({ error: 'Missing or invalid application/company ID' });
  }

  const { application_id, company_id } = info;

  try {
    if (!req.file) {
      logger.warn('No image uploaded for search');
      return res.status(400).json({ error: 'No image uploaded' });
    }

    logger.info('Received image search request', { company_id, application_id });

    const [aiResult, allProducts] = await Promise.all([
      aiService.searchByImage(req.file.buffer, company_id),
      (async () => {
        // const cached = productCache.get(cacheKey);
        // if (cached) {
        //   logger.debug('Using cached product list', { company_id });
        //   return cached;
        // }
        const items = await fetchProducts(platformClient, application_id);
        // productCache.set(cacheKey, items);
        return items;
      })(),
    ]);

    const { matches = [], metadata } = aiResult;
    if (!matches.length) {
      logger.info('No matches found', { application_id });
      return res.json({ success: true, results: [], metadata });
    }

    const productMap = new Map(allProducts.map(p => [p.slug, p]));
    const enrichedResults = [];

    const seenSlugs = new Set();
    for (const match of matches) {
      const slug = match.slug;
      if (!slug || seenSlugs.has(slug)) continue;

      const product = productMap.get(slug);
      if (!product) continue;

      seenSlugs.add(slug);

      enrichedResults.push({
        name: match.name || product.name,
        slug,
        image: match.image,
        text: match.text,
        description: product.description || '',
        short_description: product.short_description || '',
        category: product.category_slug || '',
        brand: product.brand || '',
        media: product.media || [],
        sizes: (product.all_sizes || []).map(size => ({
          size: size.size,
          price: {
            marked: size.price?.marked || {},
            effective: size.price?.effective || {},
          },
          sellable: size.sellable,
        })),
      });
    }

    // Always log the image search attempt
    await logEvent({
      applicationId: application_id,
      companyId: company_id,
      type: matches.length ? 'image_search' : 'image_not_found',
      query: matches.length
        ? JSON.stringify(matches[0])
        : JSON.stringify({ message: 'No matches found' }),
    });

    logger.info('Returning image search results', { count: enrichedResults.length });
    res.json({ success: true, results: enrichedResults, metadata });
  } catch (error) {
    logger.error('Error in searchByImage', { error, company_id, application_id });
    Sentry.captureException('Error in searchByImage function', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchByImageUsingStoreFront = async (req, res) => {
  const info = requestInfo(req);
  if (!info) {
    return res.status(400).json({ error: 'Missing or invalid application/company ID' });
  }

  const { application_id, company_id } = info;

  const ptClient = await fdkExtension.getPlatformClient(company_id);
  req.platformClient = ptClient;
  const { platformClient } = req;

  try {
    if (!req.file) {
      logger.warn('No image uploaded for search');

      await logEvent({
        applicationId: application_id,
        companyId: company_id,
        type: 'image_not_found',
        query: JSON.stringify({ message: 'No image uploaded' }),
      });

      return res.status(400).json({ error: 'No image uploaded' });
    }

    logger.info('Received image search request', { company_id, application_id });

    const [aiResult, allProducts] = await Promise.all([
      (async () => {
        try {
          return await aiService.searchByImage(req.file.buffer, company_id);
        } catch (err) {
          logger.error('AI service failed', { error: err.message });
          await logEvent({
            applicationId: application_id,
            companyId: company_id,
            type: 'image_not_found',
            query: JSON.stringify({ message: 'No matches found' }),
          });    
          throw new Error(`AI service error: ${err.response?.status || 500} - ${err.message}`);
        }
      })(),
      (async () => {
        const items = await fetchProducts(platformClient, application_id);
        return items;
      })(),
    ]);

    const { matches = [], metadata } = aiResult;
    if (!matches.length) {
      logger.info('No matches found', { application_id });
      return res.json({ success: true, results: [], metadata });
    }

    const productMap = new Map(allProducts.map(p => [p.slug, p]));
    const enrichedResults = [];

    const seenSlugs = new Set();
    for (const match of matches) {
      const slug = match.slug;
      if (!slug || seenSlugs.has(slug)) continue;

      const product = productMap.get(slug);
      if (!product) continue;

      seenSlugs.add(slug);

      enrichedResults.push({
        name: match.name || product.name,
        slug,
        image: match.image,
        text: match.text,
        description: product.description || '',
        short_description: product.short_description || '',
        category: product.category_slug || '',
        brand: product.brand || '',
        media: product.media || [],
        sizes: (product.all_sizes || []).map(size => ({
          size: size.size,
          price: {
            marked: size.price?.marked || {},
            effective: size.price?.effective || {},
          },
          sellable: size.sellable,
        })),
      });
    }

    // Always log the image search attempt
    await logEvent({
      applicationId: application_id,
      companyId: company_id,
      type: enrichedResults.length ? 'image_search' : 'image_not_found',
      query: matches.length
        ? JSON.stringify(matches[0])
        : JSON.stringify({ message: 'No matches found' }),
    });

    logger.info('Returning image search results', { count: enrichedResults.length });
    res.json({ success: true, results: enrichedResults, metadata });
  } catch (error) {
    logger.error('Error in searchByImage', { error, company_id, application_id });
    Sentry.captureException('Error in searchByImage function', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


/**
 * @desc Check system and AI service health status.
 */
exports.checkSystemStatus = async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    logger.info('System health checked', { health });
    res.json({
      success: true,
      aiService: health,
      isIndexed: aiService.isIndexed,
    });
  } catch (error) {
    logger.error('Error checking system status', { error });
    Sentry.captureException('Error in checkSystemStatus function', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Remove the existing product index.
 */
exports.removeIndex = async (req, res) => {
  const { company_id, application_id } = req.query;

  if (!company_id || !application_id) {
    logger.warn('Missing identifiers for removeIndex');
    return res.status(400).json({ error: 'Company ID and Application ID are required' });
  }

  try {
    await aiService.removeIndex(application_id);
    logger.info('Index removed', { company_id, application_id });

    res.json({
      success: true,
      message: `Index removed for company ${company_id}, application ${application_id}`,
    });
  } catch (error) {
    logger.error('Error in removeIndex', { error, company_id, application_id });
    Sentry.captureException('Error in removeIndex function', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Generate prompts to image
 */
exports.generatePromptsToImage = async (req, res) => {
  const { platformClient } = req;
  const { prompt } = req.body;

  const info = requestInfo(req);
  if (!info) {
    return res.status(400).json({ error: 'Missing or invalid application/company ID' });
  }

  const { application_id, company_id } = info;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Missing prompt in request body' });
  }

  try {
    const { filePath, fileName } = await aiService.generatePromptsToImage(prompt);

    if (!filePath) {
      return res.status(500).json({ success: false, error: 'Image generation failed' });
    }

    const imageUrl = `${
      process.env.PUBLIC_BASE_URL || 'http://localhost:49974'
    }/generated/${fileName}`;

    // Log the successful image generation event
    await logEvent({
      applicationId: application_id,
      companyId: company_id,
      type: 'prompt_image_generation',
      query: JSON.stringify({ prompt, imageUrl }),
    });

    logger.info('Generated image URL', { imageUrl });
    return res.json({ success: true, imageUrl });
  } catch (error) {
    logger.error('Error in generatePromptsToImage', { error });
    Sentry.captureException('Error in generatePromptsToImage function', error);

    // Optional: log a failed generation event
    await logEvent({
      applicationId: application_id,
      companyId: company_id,
      type: 'prompt_image_failed',
      query: JSON.stringify({ prompt, error: error.message }),
    });

    res.status(500).json({ success: false, error: 'Server error during image generation' });
  }
};