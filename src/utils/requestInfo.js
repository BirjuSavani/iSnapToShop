// exports.requestInfo = req => {
//   try {
//     const { application_id, company_id } = req.query;
//     if (application_id && company_id) {
//       req.application_id = application_id;
//       req.company_id = company_id;
//       return {
//         application_id,
//         company_id,
//       };
//     } else {
//       let appData = JSON.parse(req.headers['x-application-data']);
//       return {
//         application_id: appData._id,
//         company_id: appData.company_id,
//       };
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
