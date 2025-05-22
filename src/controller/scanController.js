const { AIService } = require('../services/aiServices');
const aiService = new AIService();
const NodeCache = require('node-cache');

/**
 * Product Indexing Endpoint
 * Indexes all products for a company
 */
exports.initProductIndexing = async (req, res) => {
  try {
    const { platformClient } = req;
    const { company_id, application_id } = req.query;

    let products = [];
    if (application_id) {
      const response = await platformClient.application(application_id).catalog.getAppProducts();
      products = response.items || [];
    } else {
      const response = await platformClient.catalog.getProducts();
      products = response.items || [];
    }

    if (products.length === 0) {
      return res.status(400).json({ error: 'No products found to index' });
    }

    const result = aiService.indexProducts(products, company_id);

    return res.json({
      success: true,
      message: `Successfully indexed ${result.indexedCount} products`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Index Single Product Endpoint
 * Indexes a specific product by ID
 */
exports.indexSingleProduct = async (req, res) => {
  try {
    const { platformClient } = req;
    const { company_id } = req;
    const { productId } = req.params;

    // logger.info(`Indexing single product ${productId} for company ${company_id}`);

    // Fetch the product details
    const product = await platformClient.catalog.getProductById({
      id: productId,
    });

    if (!product) {
      // logger.warn(`Product not found: ${productId}`);
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const result = await aiService.indexSingleProduct(product, company_id);

    return res.json({
      success: true,
      productId,
      result,
    });
  } catch (error) {
    // logger.error(`Single product indexing failed: ${error.message}`, {
    //   error: error.stack,
    //   productId: req.params.productId,
    // });
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Image Search Endpoint
 * Searches for products using an uploaded image
 */
// exports.searchByImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image uploaded' });
//     }

//     const { platformClient } = req;
//     const { company_id, application_id } = req.query;

//     console.time('total');

//     // Step 1: Parallel AI call and product fetch
//     const aiPromise = aiService.searchByImage(req.file.buffer, company_id);
//     const productsPromise = platformClient.application(application_id).catalog.getAppProducts();

//     const [aiResult, response] = await Promise.all([aiPromise, productsPromise]);
//     const { matches, metadata } = aiResult;

//     if (!matches || matches.length === 0) {
//       return res.json({ success: true, results: [], metadata });
//     }

//     const allProducts = response?.items || [];

//     // Step 2: Build product map
//     const productMap = new Map();
//     for (const product of allProducts) {
//       if (product.slug) {
//         productMap.set(product.slug, product);
//       }
//     }

//     // Step 3: Enrich and deduplicate results
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

//     console.timeEnd('total');

//     return res.json({ success: true, results: enrichedResults, metadata });
//   } catch (error) {
//     console.error('Error in image search:', error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

const productCache = new NodeCache({ stdTTL: 1800 }); // cache TTL: 30 minutes

exports.searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { platformClient } = req;
    const { company_id, application_id } = req.query;

    // Step 1: Prepare cache key
    const cacheKey = `app-products-${application_id}`;

    // Step 2: Parallel: AI search + Product fetch (with cache)
    const aiPromise = aiService.searchByImage(req.file.buffer, company_id);
    const productsPromise = (async () => {
      let cachedProducts = productCache.get(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
      const response = await platformClient.application(application_id).catalog.getAppProducts();
      const items = response?.items || [];
      productCache.set(cacheKey, items);
      return items;
    })();

    const [aiResult, allProducts] = await Promise.all([aiPromise, productsPromise]);
    const { matches, metadata } = aiResult;

    if (!matches || matches.length === 0) {
      return res.json({ success: true, results: [], metadata });
    }

    // Step 3: Build product map
    const productMap = new Map();
    for (const product of allProducts) {
      if (product.slug) {
        productMap.set(product.slug, product);
      }
    }

    // Step 4: Enrich and deduplicate results
    const seenSlugs = new Set();
    const enrichedResults = [];

    for (const match of matches) {
      if (seenSlugs.has(match.slug)) continue;
      seenSlugs.add(match.slug);

      const product = productMap.get(match.slug);
      if (!product) continue;

      enrichedResults.push({
        name: match.name || product.name,
        slug: match.slug,
        image: match.image,
        text: match.text,
        description: product.description || '',
        short_description: product.short_description || '',
        category: product.category_slug || '',
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

    return res.json({ success: true, results: enrichedResults, metadata });
  } catch (error) {
    console.error('Error in image search:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// exports.searchByImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image uploaded' });
//     }

//     const { platformClient } = req;
//     const { company_id, application_id } = req.query;

//     const cacheKey = `app-products:${application_id}`;

//     // Step 1: Parallel image AI + product cache
//     const aiPromise = aiService.searchByImage(req.file.buffer, company_id);
//     const productsPromise = (async () => {
//       const cached = await redis.get(cacheKey);
//       if (cached) {
//         return JSON.parse(cached);
//       }

//       const response = await platformClient.application(application_id).catalog.getAppProducts();
//       const items = response?.items || [];
//       await redis.set(cacheKey, JSON.stringify(items), 'EX', 1800); // TTL: 30 mins
//       return items;
//     })();

//     const [aiResult, allProducts] = await Promise.all([aiPromise, productsPromise]);
//     const { matches, metadata } = aiResult;

//     if (!matches || matches.length === 0) {
//       return res.json({ success: true, results: [], metadata });
//     }

//     // Step 2: Build product map
//     const productMap = new Map();
//     for (const product of allProducts) {
//       if (product.slug) {
//         productMap.set(product.slug, product);
//       }
//     }

//     // Step 3: Enrich results
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

/**
 * System Status Endpoint
 * Returns the current status of the AI service
 */
exports.checkSystemStatus = async (req, res) => {
  try {
    const health = aiService.checkHealth();

    return res.json({
      success: true,
      aiService: health,
      isIndexed: aiService.isIndexed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
