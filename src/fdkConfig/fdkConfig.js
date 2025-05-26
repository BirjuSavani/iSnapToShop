const { setupFdk } = require('@gofynd/fdk-extension-javascript/express');
const { SQLiteStorage } = require('@gofynd/fdk-extension-javascript/express/storage');
const sqlite3 = require('sqlite3').verbose();

const sqliteInstance = new sqlite3.Database('session_storage.db');

const fdkExtension = setupFdk({
  api_key: process.env.EXTENSION_API_KEY,
  api_secret: process.env.EXTENSION_API_SECRET,
  base_url: process.env.EXTENSION_BASE_URL,
  cluster: process.env.FP_API_DOMAIN,
  callbacks: {
    auth: async (req, res) => {
      const companyId = req.extension?.company_id || req.query.company_id;
      const applicationId = req.extension?.application_id || req.query.application_id;

      // Save companyId in storage
      await req.extension.storage.set('company_id', companyId);
      await req.extension.storage.set('app_id', applicationId);

      if (req.query.application_id) {
        return `${req.extension.base_url}/company/${req.query.company_id}/application/${req.query.application_id}`;
      } else {
        return `${req.extension.base_url}/company/${req.query.company_id}`;
      }
    },
    uninstall: async req => {
      // Cleanup logic here
    },
  },
  storage: new SQLiteStorage(sqliteInstance, 'example-fynd-platform-extension'),
  access_mode: 'offline',
  webhook_config: {
    api_path: '/api/webhook-events',
    notification_email: 'useremail@example.com',
    event_map: {
      'company/product/create': {
        handler: handleProductCreateV3,
        version: '3',
      },
    },
  },
});

console.log(
  `FDK Extension initialized with base URL: ${fdkExtension.extension.configData.base_url}`
);

const extensionId = fdkExtension.extension.api_key;

const getPlatformClientAsync = async function (company_id) {
  const ptClient = await fdkExtension.getPlatformClient("9095");
  return ptClient;
};

async function handleProductCreateV3(event_name, company_id, application_id, payload) {
  try {
    console.log(`Received ${event_name} webhook for company ${company_id}`);

    // // Destructure the payload according to the documentation
    // const { contains, event, payload: productData } = payload;

    // console.log('Contains keys:', contains);
    // console.log('Event details:', event);
    // console.log('Product data:', productData);

    // // Example: Accessing product information
    // if (productData) {
    //   console.log('Product ID:', productData.uid || productData.id);
    //   console.log('Product Name:', productData.name);
    //   console.log('Brand:', productData.brand);
    //   // Add more fields as needed
    // }

    // Add your business logic here
    // Example: Process the product data, update database, trigger other services, etc.
  } catch (error) {
    console.error('Error handling product create webhook:', error);
    // Implement your error handling logic
  }
}

module.exports = { fdkExtension, extensionId, getPlatformClientAsync };
