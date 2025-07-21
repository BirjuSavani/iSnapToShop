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

    if (!attached_path || !proxy_url) {
      throw new Error('Attached path or proxy URL is missing in env');
    }

    try {
      // 1️⃣ Try to add proxy path
      const result = await platformClient.application(application_id).partner.addProxyPath({
        extensionId,
        body: { attached_path, proxy_url },
      });

      logger.info('✅ Proxy path added successfully', {
        application_id,
        attached_path,
        proxy_url,
      });

      return result;
    } catch (err) {
      const errorMessage = err.message || err?.response?.data?.error || '';

      // 2️⃣ If "Already Present", delete and retry
      if (errorMessage === 'Already Present') {
        logger.warn('⚠️ Proxy already exists. Removing and re-adding...', {
          application_id,
          attached_path,
        });

        // Remove old proxy path
        await platformClient.application(application_id).partner.removeProxyPath({
          extensionId,
          attachedPath: attached_path,
        });

        logger.info('✅ Existing proxy path removed. Retrying add...');

        // Retry adding proxy path
        const retryResult = await platformClient.application(application_id).partner.addProxyPath({
          extensionId,
          body: { attached_path, proxy_url },
        });

        logger.info('✅ Proxy path re-added successfully after removal', {
          application_id,
          attached_path,
        });

        return retryResult;
      }

      // 3️⃣ Rethrow other errors
      throw err;
    }
  } catch (error) {
    logger.warn('❌ Failed to ensure proxy path:', error.message);
    return null;
  }
};

// A helper to safely extract an error message from various possible locations.

// const getErrorMessage = (error) => {
//   if (!error) return 'An unknown error occurred.';
//   return error.message || error?.response?.data?.error || 'An unknown error occurred.';
// };

// // Define constants for "magic strings" to avoid typos and improve clarity.
// const ALREADY_PRESENT_ERROR = 'Already Present';

// /**
//  * Ensures that the proxy path for a given application is correctly set up.
//  * If the proxy path already exists, it considers the operation successful and takes no further action.
//  *
//  * @param {object} params - The function parameters.
//  * @param {string} params.company_id - The ID of the company.
//  * @param {string} params.application_id - The ID of the application.
//  * @returns {Promise<object|null>} The result from the platform API on new creation, 
//  *                                 a success object if it already existed, or null on failure.
//  */
// exports.ensureProxyPath = async ({ company_id, application_id }) => {
//   // 1. Centralized variable definitions
//   const extensionId = fdkExtension.extension.configData.api_key;
//   const attachedPath = process.env.ATTACHED_PATH;
//   const proxyUrl = process.env.EXTENSION_BASE_URL;

//   try {
//     // 2. Fail-fast with clear guard clauses at the beginning
//     if (!application_id) {
//       throw new Error('Application ID is required.');
//     }
//     if (!attachedPath || !proxyUrl) {
//       throw new Error('ATTACHED_PATH or EXTENSION_BASE_URL is missing from environment variables.');
//     }

//     const platformClient = await fdkExtension.getPlatformClient(company_id);
//     if (!platformClient) {
//       throw new Error('Failed to initialize Platform Client.');
//     }

//     // 3. Cache the API client and config for readability (DRY)
//     const partnerApi = platformClient.application(application_id).partner;
//     const proxyConfig = {
//       extensionId,
//       body: {
//         attached_path: attachedPath,
//         proxy_url: proxyUrl,
//       },
//     };

//     try {
//       // 4. Single, clear attempt to add the proxy
//       logger.info('Attempting to add proxy path...', { application_id, attachedPath });
//       const result = await partnerApi.addProxyPath(proxyConfig);
//       logger.info('Proxy path added successfully.', { application_id, attachedPath });
//       return result;

//     } catch (error) {
//       // --- MODIFICATION HERE ---
//       // 5. If "Already Present" error, treat it as a success and exit gracefully.
//       if (getErrorMessage(error) === ALREADY_PRESENT_ERROR) {
//         logger.info('Proxy path already exists. No action needed.', {
//           application_id,
//           attachedPath,
//         });
//         // Return a consistent success-like object so the calling function knows it's OK.
//         return { success: true, message: 'Proxy path already existed.' };
//       }
      
//       // 6. Re-throw any other unexpected errors to be caught by the outer block
//       throw error;
//     }
//   } catch (error) {
//     // 7. Centralized final error logging for all unexpected failures
//     logger.error('Failed to ensure proxy path.', {
//       message: getErrorMessage(error),
//       application_id,
//       company_id,
//     });
//     return null; // Return null to indicate failure
//   }
// };