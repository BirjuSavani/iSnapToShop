const { fdkExtension } = require('../fdkConfig/fdkConfig');
const { logger } = require('../utils/logger');

/**
 * Add a new proxy path for the given application.
 */
exports.addProxyPath = async (req, res) => {
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
    return res.status(500).json({
      message: 'Failed to remove proxy path',
      error: error.message,
    });
  }
};
