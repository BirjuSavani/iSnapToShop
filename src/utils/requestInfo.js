// // // exports.requestInfo = req => {
// // //   try {
// // //     const { application_id, company_id } = req.query;
// // //     if (application_id && company_id) {
// // //       req.application_id = application_id;
// // //       req.company_id = company_id;
// // //       return {
// // //         application_id,
// // //         company_id,
// // //       };
// // //     } else {
// // //       let appData = JSON.parse(req.headers['x-application-data']);
// // //       return {
// // //         application_id: appData._id,
// // //         company_id: appData.company_id,
// // //       };
// // //     }
// // //   } catch (error) {
// // //     console.log(error);
// // //   }
// // // };
// // exports.requestInfo = req => {
// //   try {
// //     const { application_id, company_id } = req.query;
    
// //     // If both query parameters are present, use them
// //     if (application_id && company_id) {
// //       req.application_id = application_id;
// //       req.company_id = company_id;
// //       return {
// //         application_id,
// //         company_id,
// //       };
// //     } 
    
// //     // Otherwise, try to get data from headers
// //     const headerData = req.headers['x-application-data'];
    
// //     // Check if header exists
// //     if (!headerData) {
// //       throw new Error('Missing x-application-data header and query parameters');
// //     }
    
// //     // Parse the header data
// //     let appData;
// //     try {
// //       appData = JSON.parse(headerData);
// //     } catch (parseError) {
// //       throw new Error('Invalid JSON in x-application-data header');
// //     }
    
// //     // Validate that required fields exist
// //     if (!appData._id || !appData.company_id) {
// //       throw new Error('Missing required fields in application data');
// //     }
    
// //     return {
// //       application_id: appData._id,
// //       company_id: appData.company_id,
// //     };
    
// //   } catch (error) {
// //     console.error('Error in requestInfo:', error.message);
    
// //     // Return null or throw the error depending on your needs
// //     // Option 1: Return null (calling code needs to handle null)
// //     return null;
    
// //     // Option 2: Throw the error (uncomment if you want calling code to handle the exception)
// //     // throw error;
// //   }
// // };

// /**
//  * Utility function to extract application_id and company_id from request
//  * @param {Object} req - Express request object
//  * @returns {Object|null} - Object with application_id and company_id or null if not found
//  */
// const requestInfo = req => {
//   try {
//     const { application_id, company_id } = req.query;

//     if (application_id && company_id) {
//       console.log('Using query params for app/company ID');
//       req.application_id = application_id;
//       req.company_id = company_id;
//       return { application_id, company_id };
//     } else if (req.headers['x-application-data']) {
//       const appData = JSON.parse(req.headers['x-application-data']);
//       req.application_id = appData._id;
//       req.company_id = appData.company_id;
//       return {
//         application_id: appData._id,
//         company_id: appData.company_id,
//       };
//     } else {
//       console.warn('Missing x-application-data header');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error in requestInfo:', error.message);
//     return null;
//   }
// };

// module.exports = { requestInfo };