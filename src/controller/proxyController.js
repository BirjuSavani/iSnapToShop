const { fdkExtension } = require('../fdkConfig/fdkConfig');
const { logger } = require('../utils/logger');
const Sentry = require('../utils/instrument');

/**
 * Add a new proxy path for the given application.
 */
exports.addProxyPath = async (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const { platformClient } = req;
  const { application_id, attached_path, proxy_url } = req.body;

  try {
    logger.info('Adding proxy path', { requestId });

    // Validate platform client
    if (!platformClient) {
      logger.error('Platform client not available', { requestId });
      return res.status(401).json({ message: 'Platform client is not available' });
    }

    // Validate inputs
    if (!application_id) {
      logger.warn('Missing application_id in request', { requestId });
      return res.status(400).json({ message: 'Application ID is required' });
    }
    if (!attached_path) {
      logger.warn('Missing attached_path in request', { requestId });
      return res.status(400).json({ message: 'Attached path is required' });
    }
    if (!proxy_url) {
      logger.warn('Missing proxy_url in request', { requestId });
      return res.status(400).json({ message: 'Proxy URL is required' });
    }

    const extensionId = fdkExtension.extension.configData.api_key;

    // Call platform client to add proxy path
    const data = await platformClient.application(application_id).partner.addProxyPath({
      extensionId,
      body: { attached_path, proxy_url },
    });

    logger.info('Proxy path added successfully', {
      requestId,
      application_id,
      attached_path,
      proxy_url,
    });

    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error adding proxy path', {
      requestId,
      error: error.stack || error.message,
    });
    next();
    Sentry.captureException('Error in addProxyPath function', error);
    return res.status(500).json({
      message: 'Failed to add proxy path',
      error: error.message,
    });
  }
};

/**
 * Remove an existing proxy path for the given application.
 */
exports.removeProxyPath = async (req, res) => {
  const requestId = req.requestId || 'unknown';
  const { platformClient } = req;
  const { application_id } = req.params;
  const { attachedPath } = req.body;

  try {
    logger.info('Removing proxy path', { requestId });

    if (!platformClient) {
      logger.error('Platform client not available', { requestId });
      return res.status(401).json({ message: 'Platform client is not available' });
    }

    if (!application_id) {
      logger.warn('Missing application_id in request params', { requestId });
      return res.status(400).json({ message: 'Application ID is required' });
    }

    if (!attachedPath) {
      logger.warn('Missing attachedPath in request body', { requestId });
      return res.status(400).json({ message: 'Attached path is required' });
    }

    const extensionId = fdkExtension.extension.configData.api_key;

    // Call platform client to remove proxy path
    const data = await platformClient.application(application_id).partner.removeProxyPath({
      extensionId,
      attachedPath,
    });

    logger.info('Proxy path removed successfully', {
      requestId,
      application_id,
      attachedPath,
    });

    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error removing proxy path', {
      requestId,
      error: error.stack || error.message,
    });
    Sentry.captureException('Error in removeProxyPath function', error);
    return res.status(500).json({
      message: 'Failed to remove proxy path',
      error: error.message,
    });
  }
};

exports.ensureProxyPath = async ({ company_id, application_id }) => {
  try {
    const platformClient = await fdkExtension.getPlatformClient(company_id);

    if (!platformClient || !application_id) {
      throw new Error('Missing platform client or application ID');
    }

    const extensionId = fdkExtension.extension.configData.api_key;
    const attached_path = process.env.ATTACHED_PATH;
    const proxy_url = process.env.EXTENSION_BASE_URL;
    // const proxy_url = 'https://catalog-cloudy-lemon-provincial.trycloudflare.com';

    if (!attached_path || !proxy_url) {
      throw new Error('Attached path or proxy URL is missing in env');
    }

    const result = await platformClient.application(application_id).partner.addProxyPath({
      extensionId,
      body: { attached_path, proxy_url },
    });

    logger.info('✅ Proxy path created', {
      application_id,
      attached_path,
      proxy_url,
    });

    return result;
  } catch (error) {
    logger.warn('⚠️ Proxy creation failed (background):', error.message);
    return null; // Or you can throw if you want to surface it later
  }
};
