const { setupFdk } = require('@gofynd/fdk-extension-javascript/express');
const { SQLiteStorage } = require('@gofynd/fdk-extension-javascript/express/storage');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

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
      'company/product/update': {
        handler: handleProductUpdateV3,
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
  const ptClient = await fdkExtension.getPlatformClient('9095');
  return ptClient;
};

// async function handleProductCreateV3(event_name, company_id, application_id, payload) {
//   try {
//     // Improved logging with JSON.stringify for objects
//     console.log(
//       `Received ${event_name} webhook for company ${company_id} application ${application_id}`
//     );
//     console.log('Product Create V3 payload:', JSON.stringify(payload, null, 2)); // Pretty-print the payload

//     // Alternative logging that handles circular references (common in webhook payloads)
//     console.log({
//       event: event_name,
//       companyId: company_id,
//       applicationId: application_id,
//       payload: companyId.payload.product, // Let console.log handle the object display
//     });

//     // If you want to inspect specific parts of the payload:
//     if (payload) {
//       console.log('Payload contains keys:', Object.keys(payload));

//       // Destructure the payload according to the documentation
//       const { contains, event, payload: productData } = payload;

//       console.log('Contains:', contains);
//       console.log('Event details:', event);
//       console.log('Product data:', productData);

//       if (productData) {
//         console.log('Product ID:', productData.uid || productData.id);
//         console.log('Product Name:', productData.name);
//         console.log('Brand:', productData.brand?.name || productData.brand);
//       }
//     }

//     // Add your business logic here
//   } catch (error) {
//     console.error('Error handling product create webhook:', error);
//     // Implement your error handling logic
//   }
// }

async function handleProductCreateV3(event_name, company_id, application_id, payload) {
  try {
    const actualCompanyId = company_id.company_id;
    const productData = company_id.payload?.product;

    // Improved logging
    console.log(
      `Received ${event_name} webhook for company ${actualCompanyId} application ${application_id}`
    );

    // Log the complete structure for debugging
    console.log(
      'Full webhook structure:',
      JSON.stringify(
        {
          event: event_name,
          companyData: company_id,
          applicationId: application_id,
          payload: payload, // This appears to be undefined in your case
        },
        null,
        2
      )
    );

    // Directly access the product data
    if (productData) {
      fs.writeFileSync('products.json', JSON.stringify({ products: productData }, null, 2));

      console.log('Product payload:', JSON.stringify(productData, null, 2));

      // Example of accessing product fields
      // console.log('Product details:', {
      //   id: productData.uid || productData.id,
      //   name: productData.name,
      //   brand: productData.brand?.name || productData.brand,
      //   // Add other fields you need
      // });

      // Your business logic here using productData
      // Example:
      // await processNewProduct({
      //   companyId: actualCompanyId,
      //   applicationId: application_id,
      //   product: productData
      // });
    } else {
      console.warn('No product data found in webhook payload');
    }
  } catch (error) {
    console.error('Error handling product create webhook:', {
      message: error.message,
      stack: error.stack,
      event: event_name,
      companyData: company_id,
      applicationId: application_id,
    });
  }
}

async function handleProductUpdateV3(event_name, company_id, application_id, payload) {
  try {
    const actualCompanyId = company_id.company_id;
    const productData = company_id.payload?.product;

    console.log(
      `Received ${event_name} webhook for company ${actualCompanyId} application ${application_id}`
    );

    // Log the complete structure for debugging
    console.log(
      'Full update webhook structure:',
      JSON.stringify(
        {
          event: event_name,
          companyData: company_id,
          applicationId: application_id,
          payload: payload,
        },
        null,
        2
      )
    );

    // Directly access the product data
    if (productData) {
      fs.writeFileSync('products-update.json', JSON.stringify({ products: productData }, null, 2));
      console.log('Product update payload:', JSON.stringify(productData, null, 2));

      // Example of accessing updated fields
      console.log('Updated product details:', {
        id: productData.uid || productData.id,
        name: productData.name,
        brand: productData.brand?.name || productData.brand,
        updated_at: productData.updated_at || productData.modified_on,
      });
    } else {
      console.warn('No product data found in update webhook payload');
    }
  } catch (error) {
    console.error('Error handling product update webhook:', {
      message: error.message,
      stack: error.stack,
      event: event_name,
      companyData: company_id,
      applicationId: application_id,
    });
  }
}


module.exports = { fdkExtension, extensionId, getPlatformClientAsync };
