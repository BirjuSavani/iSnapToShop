const { setupFdk } = require('@gofynd/fdk-extension-javascript/express');
const { SQLiteStorage } = require('@gofynd/fdk-extension-javascript/express/storage');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const { logger } = require('../utils/logger');

const sqliteInstance = new sqlite3.Database('session_storage.db');

/**
 * Initialize the FDK extension with configuration and webhook handlers
 */
const fdkExtension = setupFdk({
  api_key: process.env.EXTENSION_API_KEY,
  api_secret: process.env.EXTENSION_API_SECRET,
  base_url: process.env.EXTENSION_BASE_URL,
  cluster: process.env.FP_API_DOMAIN,
  callbacks: {
    auth: async req => {
      const companyId = req.extension?.company_id || req.query.company_id;
      const applicationId = req.extension?.application_id || req.query.application_id;

      await req.extension.storage.set("company_id", companyId);
      await req.extension.storage.set("app_id", applicationId);

      if (applicationId) {
        return `${req.extension.base_url}/company/${companyId}/application/${applicationId}`;
      } else {
        return `${req.extension.base_url}/company/${companyId}`;
      }
    },
    uninstall: async req => {
      // Add cleanup logic here if necessary
      logger.info("Uninstall callback triggered.");
    },
  },
  storage: new SQLiteStorage(sqliteInstance, "example-fynd-platform-extension"),
  access_mode: "offline",
  // debug: true,
  webhook_config: {
    api_path: "/api/webhook-events",
    notification_email: "useremail@example.com",
    event_map: {
      "company/product/create": { handler: handleProductCreateV3, version: "3" },
      "company/product/update": { handler: handleProductUpdateV3, version: "3" },
    },
  },
});

logger.info(
  `FDK Extension initialized with base URL: ${fdkExtension.extension.configData.base_url}`
);

logger.info("OAuth Redirect Check", {
  baseUrl: fdkExtension.extension.configData.base_url,
  redirectUri: `${fdkExtension.extension.configData.base_url}/fp/auth`,
  fpDomain: fdkExtension.extension.configData.cluster,
  fpClientId: fdkExtension.extension.configData.api_key,
  fpClientSecret: fdkExtension.extension.configData.api_secret,
});

const extensionId = fdkExtension.extension.api_key;

/**
 * Returns a platform client for the given company_id.
 * NOTE: Company ID argument is currently unused — consider using it if necessary.
 */
const getPlatformClientAsync = async company_id => {
  const ptClient = await fdkExtension.getPlatformClient(9095);
  return ptClient;
};

/**
 * Helper to send product indexing request to AI service
 */
async function sendProductToAIService(companyId, product) {
  const baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
  const apiKey = process.env.AI_SERVICE_KEY;

  if (!apiKey) {
    logger.error('Missing AI_SERVICE_KEY in environment variables');
    return;
  }

  const requestPayload = {
    products: [product],
    application_id: String(companyId),
  };

  try {
    const response = await axios.post(`${baseUrl}/embeddings_store`, requestPayload, {
      headers: { 'X-API-KEY': apiKey },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Request timed out (socket issue)');
    } else if (error.response) {
      logger.error('AI service returned error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error('No response received from AI service');
    } else {
      logger.error('Unexpected error:', error.message);
    }
    logger.error('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Webhook handler for 'company/product/create' v3
 */
async function handleProductCreateV3(eventName, companyIdObj, applicationId, payload) {
  const actualCompanyId = companyIdObj?.company_id;
  const product = companyIdObj?.payload?.product;

  logger.info(
    `Received ${eventName} webhook for company ${actualCompanyId} application ${applicationId}`
  );

  if (!actualCompanyId || !product) {
    logger.warn('Missing company_id or product data in webhook payload');
    return;
  }

  try {
    const result = await sendProductToAIService(actualCompanyId, product);
    logger.info('Product indexing successful:', {
      productId: product.uid,
      details: result,
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Request timed out (socket issue)');
    } else if (error.response) {
      logger.error('AI service returned error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error('No response received from AI service');
    } else {
      logger.error('Unexpected error:', error.message);
    }
    logger.error('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Webhook handler for 'company/product/update' v3
 */
async function handleProductUpdateV3(eventName, companyIdObj, applicationId, payload) {
  const actualCompanyId = companyIdObj?.company_id;
  const product = companyIdObj?.payload?.product;

  logger.info(
    `Received ${eventName} webhook for company ${actualCompanyId} application ${applicationId}`
  );

  if (!actualCompanyId || !product) {
    logger.warn('Missing company_id or product data in webhook payload');
    return;
  }

  try {
    const result = await sendProductToAIService(actualCompanyId, product);
    logger.info('Embedding store response:', result);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Request timed out (socket issue)');
    } else if (error.response) {
      logger.error('AI service returned error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      logger.error('No response received from AI service');
    } else {
      logger.error('Unexpected error:', error.message);
    }
    logger.error('Stack trace:', error.stack);
    throw error;
  }
}

module.exports = { fdkExtension, extensionId, getPlatformClientAsync };
