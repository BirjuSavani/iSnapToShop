const { fdkExtension } = require('../fdkConfig/fdkConfig');

exports.addProxyPath = async (req, res) => {
  const requestId = req.requestId || 'unknown';

  try {
    console.log('Adding proxy path', { requestId });

    const { platformClient } = req;
    const { application_id, attached_path, proxy_url } = req.body;
    
    if (!platformClient) {
      console.error('Platform client not available', { requestId });
      return res.status(401).json({ message: 'Platform client is not available' });
    }

    if (!application_id) {
      console.warn('Missing application_id in request', { requestId });
      return res.status(400).json({ message: 'Application ID is required' });
    }
    if (!attached_path) {
      console.warn('Missing attached_path in request', { requestId });
      return res.status(400).json({ message: 'Attached path is required' });
    }
    if (!proxy_url) {
      console.warn('Missing proxy_url in request', { requestId });
      return res.status(400).json({ message: 'Proxy URL is required' });
    }

    // Get the extension ID from your FDK extension
    const extensionId = fdkExtension.extension.configData.api_key;

    // Call the Partner API to add a proxy path
    const data = await platformClient.application(application_id).partner.addProxyPath({
      extensionId,
      body: {
        attached_path,
        proxy_url,
      },
    });
    console.log(data, 'proxy data');

    console.log('Proxy path added successfully', { requestId });

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error adding proxy path', { requestId, error: error });
    return res.status(500).json({ message: 'Failed to add proxy path', error: error.message });
  }
};

// Delete a proxy path
exports.removeProxyPath = async (req, res) => {
  const requestId = req.requestId || 'unknown';

  try {
    console.log('Removing proxy path', { requestId });

    const { platformClient } = req;
    const { application_id } = req.params;
    const { attachedPath } = req.body;

    if (!platformClient) {
      console.error('Platform client not available', { requestId });
      return res.status(401).json({ message: 'Platform client is not available' });
    }

    // Get the extension ID from your FDK extension
    const extensionId = fdkExtension.extension.configData.api_key;

    // Call the Partner API to remove a proxy path
    const data = await platformClient.application(application_id).partner.removeProxyPath({
      extensionId,
      attachedPath,
    });

    console.log('Proxy path removed successfully', { requestId });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error removing proxy path', { requestId, error: error });
    return res.status(500).json({ message: 'Failed to remove proxy path', error: error.message });
  }
};
