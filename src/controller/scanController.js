const { AIService } = require('../services/aiServices');
const NodeCache = require('node-cache');
const { setStatus, getStatus } = require('./indexStatusStore');
const { logger } = require('../utils/logger');

const CACHE_TTL = 1800; // 30 minutes
const productCache = new NodeCache({ stdTTL: CACHE_TTL });
const aiService = new AIService();

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
    throw error;
  }
};

/**
 * @desc Search for products using uploaded image.
 * configuration.config.companyId
 */
exports.searchByImage = async (req, res) => {
  const { platformClient } = req;
  const { application_id } = req.query;
  // const company_id = platformClient.configuration.config.companyId;
  const { company_id } = req.query;
  // const cacheKey = `app-products-${company_id}`;

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

    logger.info('Returning image search results', { count: enrichedResults.length });
    res.json({ success: true, results: enrichedResults, metadata });
  } catch (error) {
    logger.error('Error in searchByImage', { error, company_id, application_id });
    res.status(500).json({ success: false, error: error.message });
  }
};

// exports.searchByImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image uploaded' });
//     }

//     const { platformClient } = req;
//     const { application_id } = req.query;
//     const company_id = platformClient.configuration.config.companyId;

//     // Step 1: Prepare cache key
//     const cacheKey = `app-products-${company_id}`;

//     // Step 2: Parallel: AI search + Product fetch (with cache)
//     const aiPromise = await aiService.searchByImage(req.file.buffer, company_id);
//     const productsPromise = (async () => {
//       let cachedProducts = productCache.get(cacheKey);
//       if (cachedProducts) {
//         return cachedProducts;
//       }
//       const response = await platformClient.application(application_id).catalog.getAppProducts();
//       const items = response?.items || [];
//       productCache.set(cacheKey, items);
//       return items;
//     })();

//     const [aiResult, allProducts] = await Promise.all([aiPromise, productsPromise]);
//     const { matches, metadata } = aiResult;

//     if (!matches || matches.length === 0) {
//       return res.json({ success: true, results: [], metadata });
//     }

//     // Step 3: Build product map
//     const productMap = new Map();
//     for (const product of allProducts) {
//       if (product.slug) {
//         productMap.set(product.slug, product);
//       }
//     }

//     // Step 4: Enrich and deduplicate results
//     const seenSlugs = new Set();
//     const enrichedResults = [];

//     for (const match of matches) {
//       if (seenSlugs.has(match.slug)) continue;
//       seenSlugs.add(match.slug);

//       const product = productMap.get(match.slug);
//       if (!product) continue;

//       enrichedResults.push({
//         name: match.name || product.name,
//         slug: match.slug,
//         image: match.image,
//         text: match.text,
//         description: product.description || '',
//         short_description: product.short_description || '',
//         category: product.category_slug || '',
//         media: product.media || [],
//         sizes: (product.all_sizes || []).map(size => ({
//           size: size.size,
//           price: {
//             marked: size.price?.marked || {},
//             effective: size.price?.effective || {},
//           },
//           sellable: size.sellable,
//         })),
//       });
//     }

//     return res.json({ success: true, results: enrichedResults, metadata });
//   } catch (error) {
//     console.error('Error in image search:', error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

// /**
//  * @desc Search for products using uploaded image.
//  * configuration.config.companyId
//  */
// exports.searchByImage = async (req, res) => {
//   const { platformClient } = req;
//   const { application_id } = req.query;
//   const company_id = platformClient.configuration.config.companyId;

//   try {
//     if (!req.file) {
//       logger.warn('No image uploaded for search');
//       return res.status(400).json({ error: 'No image uploaded' });
//     }

//     logger.info('Received image search request', { company_id, application_id });

//     const aiResult = await aiService.searchByImage(req.file.buffer, company_id);
//     const { matches = [], metadata } = aiResult;
//     // console.log(aiResult,'aiResult');
//     if (!matches.length) {
//       logger.info('No matches found', { application_id });
//       return res.json({ success: true, results: [], metadata });
//     }

//     // Deduplicate matches by slug while preserving order
//     const uniqueMatches = [];
//     const seenSlugs = new Set();

//     for (const match of matches) {
//       const slug = match.slug;
//       if (!slug || seenSlugs.has(slug)) continue;

//       seenSlugs.add(slug);
//       uniqueMatches.push(match);
//     }

//     logger.info('Returning image search results', {
//       originalCount: matches.length,
//       uniqueCount: uniqueMatches.length,
//     });

//     res.json({
//       success: true,
//       results: uniqueMatches,
//       metadata,
//     });
//   } catch (error) {
//     logger.error('Error in searchByImage', { error, company_id, application_id });
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

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
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Generate prompts to image
 */
// exports.generatePromptsToImage = async (req, res) => {
//   const { platformClient } = req;
//   const { prompt } = req.body;
//   try {
//     const aiResult = await aiService.generatePromptsToImage(prompt);
//     res.json({ success: true, results: aiResult });
//   } catch (error) {
//     logger.error('Error in generatePromptsToImage', { error, company_id, application_id });
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.generatePromptsToImage = async (req, res) => {
  const { platformClient } = req;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Missing prompt in request body' });
  }

  try {
    const { filePath, fileName } = await aiService.generatePromptsToImage(prompt);

    if (!filePath) {
      return res.status(500).json({ success: false, error: 'Image generation failed' });
    }

    const imageUrl = `${
      process.env.PUBLIC_BASE_URL || 'http://localhost:46474'
    }/generated/${fileName}`;

    logger.info('Generated image URL', { imageUrl });
    // Respond with image URL so frontend can display it
    return res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error in generatePromptsToImage', error);
    res.status(500).json({ success: false, error: 'Server error during image generation' });
  }
};
