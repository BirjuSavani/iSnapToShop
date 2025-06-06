// // import axios from 'axios';
// // import { useEffect, useRef, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import urlJoin from 'url-join';
// // import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
// // import './style/home.css';

// // const EXAMPLE_MAIN_URL = window.location.origin;
// // const STATUS_API_URL =
// //   'https://asia-south1.workflow.boltic.app/c2c57f87-9aaf-4cd0-b739-17448198b12c';
// // const GET_STATUS_API_URL =
// //   'https://asia-south1.workflow.boltic.app/5e71a083-579e-4d69-b997-6e9789cc294c';
// // const UPDATE_STATUS_API_URL =
// //   'https://asia-south1.workflow.boltic.app/86be8314-f7af-44f1-919f-2b10a413bf48';

// // export const Home = () => {
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [state, setState] = useState({
// //     isLoading: false,
// //     searchResults: [],
// //     previewImage: null,
// //     error: null,
// //     uploadProgress: 0,
// //     isActive: false,
// //     isInitializing: false,
// //     statusMessage: '',
// //     apiStatusLoading: true,
// //   });

// //   const fileInputRef = useRef(null);
// //   const { application_id, company_id } = useParams();

// //   // useEffect(() => {
// //   //   setShowPopup(true);
// //   // }, []);

// //   useEffect(() => {
// //     if (!state.apiStatusLoading && !state.isActive) {
// //       setShowPopup(true);
// //     } else {
// //       setShowPopup(false);
// //     }
// //   }, [state.apiStatusLoading, state.isActive]);

// //   // Fetch initial status from both localStorage and API
// //   useEffect(() => {
// //     let isMounted = true;

// //     const fetchInitialStatus = async () => {
// //       try {
// //         const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

// //         if (isMounted && response.data?.status === 'success') {
// //           const record = response.data.data.result.data.find(item => item._id === application_id);

// //           if (record) {
// //             setState(prev => ({
// //               ...prev,
// //               isActive: record.active === 'true',
// //               apiStatusLoading: false,
// //             }));
// //           } else {
// //             // Create new record with default inactive status
// //             await updateStatusOnServer(false);
// //             setState(prev => ({
// //               ...prev,
// //               isActive: false,
// //               apiStatusLoading: false,
// //             }));
// //           }
// //         }
// //       } catch (error) {
// //         console.error('Failed to fetch API status:', error);
// //         if (isMounted) {
// //           setState(prev => ({
// //             ...prev,
// //             apiStatusLoading: false,
// //             error: 'Failed to initialize status',
// //           }));
// //         }
// //       }
// //     };

// //     fetchInitialStatus();

// //     return () => {
// //       isMounted = false;
// //     };
// //   }, [application_id]);

// //   // Update both localStorage and API when status changes
// //   useEffect(() => {
// //     if (!state.apiStatusLoading) {
// //       localStorage.setItem('isActive', state.isActive);
// //       updateStatusOnServer(state.isActive).catch(error => {
// //         console.error('Failed to update API status:', error);
// //       });
// //     }
// //   }, [state.isActive, state.apiStatusLoading]);

// //   const updateStatusOnServer = async activeStatus => {
// //     try {
// //       // First get the record by application_id
// //       const getResponse = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

// //       if (getResponse.data?.status === 'success') {
// //         const record = getResponse.data.data.result.data.find(item => item._id === application_id);

// //         if (!record) {
// //           // If no record exists, create a new one
// //           const createResponse = await axios.post(STATUS_API_URL, {
// //             _id: application_id,
// //             url: window.location.href,
// //             title: `iSnapToShop - ${application_id}`,
// //             active: activeStatus.toString(),
// //           });
// //           return createResponse.data.id;
// //         }

// //         // Update existing record
// //         const updateData = {
// //           id: record.id, // Use the record's id from the GET response
// //           _id: application_id,
// //           url: window.location.href,
// //           title: `iSnapToShop - ${application_id}`,
// //           active: activeStatus.toString(),
// //         };

// //         const updateResponse = await axios.put(UPDATE_STATUS_API_URL, updateData);
// //         return updateResponse.data.id;
// //       }
// //     } catch (error) {
// //       console.error('Status update failed:', error);
// //       throw error;
// //     }
// //   };

// //   const pollIndexStatus = async () => {
// //     const POLL_INTERVAL = 3000;
// //     const MAX_TIMEOUT = 60000;
// //     const start = Date.now();

// //     while (Date.now() - start < MAX_TIMEOUT) {
// //       try {
// //         const res = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/index-status'), {
// //           headers: { 'x-company-id': company_id },
// //           params: { application_id },
// //         });

// //         if (res.data?.status === 'ready') {
// //           setState(prev => ({
// //             ...prev,
// //             isInitializing: false,
// //             isActive: true,
// //             statusMessage: 'Product index is ready.',
// //           }));
// //           return;
// //         }

// //         await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
// //       } catch (err) {
// //         console.error('Polling failed:', err);
// //         setState(prev => ({
// //           ...prev,
// //           isInitializing: false,
// //           isActive: false,
// //           error: 'Failed to check index status.',
// //         }));
// //         return;
// //       }
// //     }

// //     setState(prev => ({
// //       ...prev,
// //       isInitializing: false,
// //       isActive: false,
// //       error: 'Initialization timed out.',
// //     }));
// //   };

// //   const toggleActiveStatus = async () => {
// //     try {
// //       setState(prev => ({
// //         ...prev,
// //         isInitializing: true,
// //         error: null,
// //       }));

// //       if (state.isActive) {
// //         // Deactivating
// //         await axios.post(
// //           urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/remove-index'),
// //           {},
// //           {
// //             headers: { 'x-company-id': company_id },
// //             params: { application_id, company_id },
// //           }
// //         );
// //         setState(prev => ({
// //           ...prev,
// //           isActive: false,
// //           isInitializing: false,
// //           error: null,
// //           previewImage: null,
// //           searchResults: [],
// //         }));
// //       } else {
// //         // Activating (start init-index)
// //         await axios.post(
// //           urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/init-index'),
// //           {},
// //           {
// //             headers: { 'x-company-id': company_id },
// //             params: { application_id, company_id },
// //           }
// //         );

// //         // Polling logic
// //         const pollStatus = async () => {
// //           const maxRetries = 20;
// //           const interval = 3000;
// //           for (let i = 0; i < maxRetries; i++) {
// //             const res = await axios.get(
// //               urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/index-status'),
// //               {
// //                 headers: { 'x-company-id': company_id },
// //                 params: { application_id, company_id },
// //               }
// //             );
// //             if (res.data.status.status === 'completed') {
// //               return true;
// //             }
// //             await new Promise(r => setTimeout(r, interval));
// //           }
// //           throw new Error('Indexing did not complete in time.');
// //         };

// //         await pollStatus();

// //         setState(prev => ({
// //           ...prev,
// //           isActive: true,
// //           isInitializing: false,
// //           error: null,
// //           searchResults: [],
// //         }));
// //       }
// //     } catch (error) {
// //       setState(prev => ({
// //         ...prev,
// //         isInitializing: false,
// //         error:
// //           error.response?.data?.error ||
// //           (state.isActive
// //             ? 'Failed to deactivate product index'
// //             : 'Failed to activate product index'),
// //       }));
// //     }
// //   };

// //   const handleImageUpload = async e => {
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     setState(prev => ({
// //       ...prev,
// //       isLoading: true,
// //       error: null,
// //       uploadProgress: 0,
// //       searchResults: [],
// //     }));

// //     try {
// //       const reader = new FileReader();
// //       reader.onload = e => {
// //         setState(prev => ({ ...prev, previewImage: e.target.result }));
// //       };
// //       reader.readAsDataURL(file);

// //       const formData = new FormData();
// //       formData.append('image', file);

// //       const response = await axios.post(
// //         urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/search-by-image'),
// //         formData,
// //         {
// //           headers: {
// //             'Content-Type': 'multipart/form-data',
// //             'x-company-id': company_id,
// //           },
// //           params: { application_id, company_id },
// //           onUploadProgress: progressEvent => {
// //             const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
// //             setState(prev => ({ ...prev, uploadProgress: progress }));
// //           },
// //         }
// //       );

// //       setState(prev => ({
// //         ...prev,
// //         isLoading: false,
// //         searchResults: response.data.results || [],
// //         uploadProgress: 100,
// //       }));
// //     } catch (error) {
// //       setState(prev => ({
// //         ...prev,
// //         isLoading: false,
// //         error: error.response?.data?.error || 'Failed to search products',
// //       }));
// //     }
// //   };

// //   const triggerFileInput = () => {
// //     fileInputRef.current.click();
// //   };

// //   const {
// //     isLoading,
// //     searchResults,
// //     previewImage,
// //     error,
// //     uploadProgress,
// //     isActive,
// //     isInitializing,
// //     statusMessage,
// //     apiStatusLoading,
// //   } = state;

// //   const productProfileImage = media => {
// //     if (!media || !media.length) return DEFAULT_NO_IMAGE;
// //     const profileImg = media.find(m => m.type === 'image');
// //     return profileImg?.url || DEFAULT_NO_IMAGE;
// //   };

// //   const status = isActive
// //     ? { text: 'Active', className: 'active' }
// //     : isInitializing || apiStatusLoading
// //     ? { text: 'Activating...', className: 'activating' }
// //     : { text: 'Inactive', className: 'inactive' };

// //   return (
// //     <div className='scan-container'>
// //       <header className='app-header'>
// //         <h1 className='title'>iSnapToShop</h1>
// //         <p className='subtitle'>Upload product images to find matches</p>
// //       </header>

// //       <div className='two-column-layout'>
// //         <div className='left-column'>
// //           <div className='status-card'>
// //             <h3>System Controls</h3>
// //             <div className='toggle-container'>
// //               <label className='toggle-label'>
// //                 <span className='status-label'>
// //                   Product Index Status:
// //                   <span
// //                     className='info-tooltip'
// //                     data-tooltip='Product Index Status determines if the system will process uploaded product images. Turn it off to disable analysis.'
// //                   >
// //                     <svg className='info-icon' viewBox='0 0 24 24'>
// //                       <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' />
// //                     </svg>
// //                   </span>
// //                 </span>
// //                 <div className='toggle-switch'>
// //                   <input
// //                     type='checkbox'
// //                     checked={isActive}
// //                     onChange={toggleActiveStatus}
// //                     disabled={isInitializing || apiStatusLoading}
// //                   />
// //                   <span className='slider round'></span>
// //                 </div>
// //                 <span className={`toggle-status ${status.className}`}>
// //                   {status.text}
// //                   {(isInitializing || apiStatusLoading) && <span className='loading-dots'></span>}
// //                 </span>
// //               </label>
// //               {(isInitializing || apiStatusLoading) && (
// //                 <div className='initializing-message'>
// //                   <div className='spinner small'></div>
// //                   {statusMessage || 'Initializing, please wait...'}
// //                 </div>
// //               )}
// //             </div>

// //             <div className='upload-controls'>
// //               <input
// //                 type='file'
// //                 ref={fileInputRef}
// //                 onChange={handleImageUpload}
// //                 accept='image/*'
// //                 style={{ display: 'none' }}
// //                 disabled={isLoading || !isActive}
// //               />

// //               <button
// //                 className={`upload-button ${isLoading ? 'loading' : ''} ${
// //                   !isActive ? 'disabled' : ''
// //                 }`}
// //                 onClick={triggerFileInput}
// //                 disabled={isLoading || !isActive}
// //               >
// //                 {isLoading ? (
// //                   <>
// //                     <span className='spinner'></span>
// //                     Analyzing Image...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <svg className='upload-icon' viewBox='0 0 24 24'>
// //                       <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
// //                     </svg>
// //                     Upload Product Image
// //                   </>
// //                 )}
// //               </button>

// //               {!isActive && (
// //                 <p className='helper-text'>Activate Product Index to enable image uploads</p>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         <div className='right-column'>
// //           {previewImage ? (
// //             <div className='image-preview-container'>
// //               <div className='image-preview animated-image'>
// //                 <img src={previewImage} alt='Preview' />
// //                 {isLoading && (
// //                   <div className='processing-overlay'>
// //                     <div className='processing-text'>
// //                       <div className='spinner'></div>
// //                       Analyzing your image...
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           ) : (
// //             <div className='empty-preview'>
// //               <svg className='placeholder-icon' viewBox='0 0 24 24'>
// //                 <path d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z' />
// //               </svg>
// //               <p>Image preview will appear here</p>
// //             </div>
// //           )}

// //           {error && (
// //             <div className='error-message'>
// //               <svg className='error-icon' viewBox='0 0 24 24'>
// //                 <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
// //               </svg>
// //               {error}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       <div className='results-section'>
// //         {searchResults.length > 0 ? (
// //           <>
// //             <h2 className='results-title'>Matching Products ({searchResults.length})</h2>
// //             <div className='product-grid'>
// //               {searchResults.map(product => (
// //                 <div className='product-card' key={product._id}>
// //                   <div className='product-image'>
// //                     <img
// //                       src={productProfileImage(product.media)}
// //                       alt={product.name}
// //                       loading='lazy'
// //                     />
// //                   </div>
// //                   <div className='product-details'>
// //                     <h3>{product.name}</h3>
// //                     {product.brand && <p className='brand'>{product.brand.name}</p>}
// //                     {product.price && <p className='price'>₹{product.price.marked}</p>}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </>
// //         ) : (
// //           previewImage &&
// //           !isLoading && (
// //             <div className='no-results'>
// //               <svg className='no-results-icon' viewBox='0 0 24 24'>
// //                 <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
// //               </svg>
// //               No matching products found. Try with a different image.
// //             </div>
// //           )
// //         )}
// //       </div>
// //       {showPopup && (
// //         <div className='popup-overlay'>
// //           <div className='popup-box'>
// //             <h2 style={{ color: '#010228' }}>Welcome to iSnapToShop!</h2>
// //             <p className='popup-message'>
// //               Please ensure <span className='highlight'>product indexing is active</span>
// //               <span
// //                 className='toggle-switch animated-toggle'
// //                 aria-label='Active toggle'
// //                 role='switch'
// //                 aria-checked='true'
// //               >
// //                 <span className='toggle-track'>
// //                   <span className='toggle-thumb' />
// //                 </span>
// //               </span>{' '}
// //               before uploading an image.
// //             </p>
// //             <button onClick={() => setShowPopup(false)} className='popup-close-button'>
// //               Got it
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// import axios from 'axios';
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import urlJoin from 'url-join';
// import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
// import './style/home.css';

// const EXAMPLE_MAIN_URL = window.location.origin;
// const STATUS_API_URL =
//   'https://asia-south1.workflow.boltic.app/c2c57f87-9aaf-4cd0-b739-17448198b12c';
// const GET_STATUS_API_URL =
//   'https://asia-south1.workflow.boltic.app/5e71a083-579e-4d69-b997-6e9789cc294c';
// const UPDATE_STATUS_API_URL =
//   'https://asia-south1.workflow.boltic.app/86be8314-f7af-44f1-919f-2b10a413bf48';

// export const Home = () => {
//   const [showPopup, setShowPopup] = useState(false);
//   const [showActivationPopup, setShowActivationPopup] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [promptText, setPromptText] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);

//   const [state, setState] = useState({
//     isLoading: false,
//     searchResults: [],
//     previewImage: null,
//     error: null,
//     uploadProgress: 0,
//     isActive: false,
//     isInitializing: true, // Start with true to show activation process
//     statusMessage: 'Preparing your shopping assistant...',
//     apiStatusLoading: true,
//     firstTimeVisit: true, // Track first time visit
//   });

//   const fileInputRef = useRef(null);
//   const { application_id, company_id } = useParams();

//   useEffect(() => {
//     if (state.isInitializing && !state.isActive) {
//       setShowActivationPopup(true);
//     } else {
//       setShowActivationPopup(false);
//     }
//   }, [state.isInitializing, state.isActive]);

//   useEffect(() => {
//     if (!state.apiStatusLoading && !state.isActive && state.firstTimeVisit) {
//       setShowPopup(true);
//     } else {
//       setShowPopup(false);
//     }
//   }, [state.apiStatusLoading, state.isActive, state.firstTimeVisit]);

//   // Fetch initial status and activate if needed
//   useEffect(() => {
//     let isMounted = true;

//     const fetchInitialStatus = async () => {
//       try {
//         const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

//         if (isMounted && response.data?.status === 'success') {
//           const record = response.data.data.result.data.find(item => item._id === application_id);

//           if (record) {
//             if (record.active === 'true') {
//               // Already active
//               setState(prev => ({
//                 ...prev,
//                 isActive: true,
//                 isInitializing: false,
//                 apiStatusLoading: false,
//                 firstTimeVisit: false,
//                 statusMessage: 'Ready to search products!',
//               }));
//             } else {
//               // Need to activate
//               await toggleActiveStatus(true);
//               await updateStatusOnServer(true);
//             }
//           } else {
//             // New record - activate by default
//             await toggleActiveStatus(true);
//             await updateStatusOnServer(true);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to fetch API status:', error);
//         if (isMounted) {
//           setState(prev => ({
//             ...prev,
//             apiStatusLoading: false,
//             isInitializing: false,
//             error: 'Failed to initialize shopping assistant',
//             firstTimeVisit: false,
//           }));
//         }
//       }
//     };

//     // fetchInitialStatus();

//     // ✅ Call fetch only if not already active
//     if (!state.isActive) {
//       fetchInitialStatus();
//     } else {
//       setState(prev => ({
//         ...prev,
//         isInitializing: false,
//         apiStatusLoading: false,
//         statusMessage: 'Ready to search products!',
//         firstTimeVisit: false,
//       }));
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [application_id, state.isActive]);

//   const updateStatusOnServer = async activeStatus => {
//     try {
//       const getResponse = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

//       if (getResponse.data?.status === 'success') {
//         const record = getResponse.data.data.result.data.find(item => item._id === application_id);

//         if (!record) {
//           const createResponse = await axios.post(STATUS_API_URL, {
//             _id: application_id,
//             url: window.location.href,
//             title: `iSnapToShop - ${application_id}`,
//             active: activeStatus.toString(),
//           });
//           return createResponse.data.id;
//         }

//         const updateData = {
//           id: record.id,
//           _id: application_id,
//           url: window.location.href,
//           title: `iSnapToShop - ${application_id}`,
//           active: activeStatus.toString(),
//         };

//         const updateResponse = await axios.put(UPDATE_STATUS_API_URL, updateData);
//         return updateResponse.data.id;
//       }
//     } catch (error) {
//       console.error('Status update failed:', error);
//       throw error;
//     }
//   };

//   const toggleActiveStatus = async (isAutoActivate = false) => {
//     try {
//       if (state.isActive && isAutoActivate) return;
//       setState(prev => ({
//         ...prev,
//         isInitializing: true,
//         error: null,
//         statusMessage: isAutoActivate
//           ? 'Setting up your shopping assistant...'
//           : 'Updating your settings...',
//       }));

//       if (state.isActive && !isAutoActivate) {
//         // Deactivating
//         await axios.post(
//           urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/remove-index'),
//           {},
//           {
//             headers: { 'x-company-id': company_id },
//             params: { application_id, company_id },
//           }
//         );
//         setState(prev => ({
//           ...prev,
//           isActive: false,
//           isInitializing: false,
//           firstTimeVisit: false,
//           error: null,
//           previewImage: null,
//           searchResults: [],
//           statusMessage: 'Shopping assistant is inactive',
//         }));
//       } else {
//         // Activating
//         await axios.post(
//           urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/init-index'),
//           {},
//           {
//             headers: { 'x-company-id': company_id },
//             params: { application_id, company_id },
//           }
//         );

//         // Polling logic
//         const pollStatus = async () => {
//           const maxRetries = 20;
//           const interval = 3000;
//           for (let i = 0; i < maxRetries; i++) {
//             const res = await axios.get(
//               urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/index-status'),
//               {
//                 headers: { 'x-company-id': company_id },
//                 params: { application_id, company_id },
//               }
//             );
//             if (res.data.status.status === 'completed') {
//               return true;
//             }
//             setState(prev => ({
//               ...prev,
//               statusMessage:
//                 i < 5 ? 'Getting your product catalog ready...' : 'Almost done! Just a moment...',
//             }));
//             await new Promise(r => setTimeout(r, interval));
//           }
//           throw new Error('Something went wrong during setup. Please try again.');
//         };

//         await pollStatus();

//         setState(prev => ({
//           ...prev,
//           isActive: true,
//           isInitializing: false,
//           firstTimeVisit: false,
//           error: null,
//           searchResults: [],
//           statusMessage: 'Ready to search products!',
//         }));
//       }
//     } catch (error) {
//       setState(prev => ({
//         ...prev,
//         isInitializing: false,
//         firstTimeVisit: false,
//         error:
//           error.response?.data?.error ||
//           (state.isActive
//             ? 'Failed to pause shopping assistant'
//             : 'Failed to start shopping assistant'),
//         statusMessage: 'Something went wrong. Please try again.',
//       }));
//     }
//   };

//   const handleImageUpload = async e => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setState(prev => ({
//       ...prev,
//       isLoading: true,
//       error: null,
//       uploadProgress: 0,
//       searchResults: [],
//     }));

//     try {
//       const reader = new FileReader();
//       reader.onload = e => {
//         setState(prev => ({ ...prev, previewImage: e.target.result }));
//       };
//       reader.readAsDataURL(file);

//       const formData = new FormData();
//       formData.append('image', file);

//       const response = await axios.post(
//         urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/search-by-image'),
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'x-company-id': company_id,
//           },
//           params: { application_id, company_id },
//           onUploadProgress: progressEvent => {
//             const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setState(prev => ({ ...prev, uploadProgress: progress }));
//           },
//         }
//       );

//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         searchResults: response.data.results || [],
//         uploadProgress: 100,
//       }));
//     } catch (error) {
//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         error: error.response?.data?.error || 'Failed to search products',
//       }));
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const productProfileImage = media => {
//     if (!media || !media.length) return DEFAULT_NO_IMAGE;
//     const profileImg = media.find(m => m.type === 'image');
//     return profileImg?.url || DEFAULT_NO_IMAGE;
//   };

//   const generateImageFromPrompt = async function (prompt) {
//     try {
//       setIsGenerating(true);
//       const response = await axios.post(
//         urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/generate-prompts-to-image'),
//         { prompt },
//         {
//           headers: { 'x-company-id': company_id },
//           params: { application_id, company_id },
//         }
//       );

//       const data = response.data;
//       if (data.success && data.imageUrl) {
//         // Fetch image blob from imageUrl
//         const imageResponse = await axios.get(data.imageUrl, { responseType: 'blob' });
//         const imageBlob = imageResponse.data;

//         const file = new File([imageBlob], 'generated-image.png', {
//           type: imageBlob.type || 'image/png',
//         });

//         // Preview
//         const reader = new FileReader();
//         reader.onload = e => {
//           setState(prev => ({ ...prev, previewImage: e.target.result }));
//         };
//         reader.readAsDataURL(file);

//         const formData = new FormData();
//         formData.append('image', file);

//         setState(prev => ({
//           ...prev,
//           isLoading: true,
//           error: null,
//           uploadProgress: 0,
//           searchResults: [],
//         }));

//         const searchResponse = await axios.post(
//           urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/search-by-image'),
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//               'x-company-id': company_id,
//             },
//             params: { application_id, company_id },
//             onUploadProgress: progressEvent => {
//               const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//               setState(prev => ({ ...prev, uploadProgress: progress }));
//             },
//           }
//         );

//         setState(prev => ({
//           ...prev,
//           isLoading: false,
//           searchResults: searchResponse.data.results || [],
//           uploadProgress: 100,
//         }));
//         setPromptText('');
//         setIsGenerating(false);
//         setShowImageModal(false);
//       } else {
//         throw new Error('Image generation failed or imageUrl missing');
//       }
//     } catch (err) {
//       console.error('Error generating/searching image:', err);
//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         error: 'Failed to generate or search image',
//       }));
//     }
//   };

//   const {
//     isLoading,
//     searchResults,
//     previewImage,
//     error,
//     uploadProgress,
//     isActive,
//     isInitializing,
//     statusMessage,
//     apiStatusLoading,
//   } = state;

//   return (
//     <div className='scan-container'>
//       {/* Image Modal */}
//       {showImageModal && (
//         <div className='upload-modal-overlay'>
//           <div className='upload-modal-content'>
//             <h2>Upload or Generate Product Image</h2>

//             <div className='upload-modal-section'>
//               <label>Upload Image</label>
//               <input
//                 style={{ width: '94%' }}
//                 type='file'
//                 onChange={e => {
//                   handleImageUpload(e);
//                   setShowImageModal(false);
//                 }}
//                 accept='image/*'
//               />
//             </div>
//             <h4 style={{ textAlign: 'center', marginBottom: '0px' }}>OR</h4>
//             {/* <div className="upload-modal-section">
//               <label>Generate Image via Prompt</label>
//               <input
//                 type="text"
//                 style={{ width: "94%" }}
//                 placeholder="Describe your product"
//                 value={promptText}
//                 onChange={e => setPromptText(e.target.value)}
//               />
//               <button
//                 onClick={() => generateImageFromPrompt(promptText)}
//                 className="generate-button"
//               >
//                 Generate & Use Image
//               </button>
//             </div> */}
//             <div className='upload-modal-section'>
//               <label>Generate Image via Prompt</label>
//               <input
//                 type='text'
//                 style={{ width: '94%' }}
//                 placeholder='Describe your product'
//                 value={promptText}
//                 onChange={e => setPromptText(e.target.value)}
//                 disabled={isGenerating} // Optional: disable input during generation
//               />
//               <button
//                 onClick={() => generateImageFromPrompt(promptText)}
//                 className='generate-button'
//                 disabled={isGenerating || !promptText} // Disable if generating or no prompt
//               >
//                 {isGenerating ? (
//                   <div
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '8px',
//                     }}
//                   >
//                     <span
//                       className='spinner'
//                       style={{
//                         display: 'inline-block',
//                         width: '16px',
//                         height: '16px',
//                         border: '2px solid rgba(255, 255, 255, 0.3)',
//                         borderTopColor: 'white',
//                         borderRadius: '50%',
//                         animation: 'spin 1s linear infinite',
//                       }}
//                     ></span>
//                     <span>Generating...</span>
//                   </div>
//                 ) : (
//                   'Generate & Use Image'
//                 )}
//               </button>
//             </div>
//             <button
//               className='close-button'
//               onClick={() => {
//                 setShowImageModal(false);
//                 setPromptText('');
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Header */}
//       <header className='app-header'>
//         <h1 className='title'>iSnapToShop</h1>
//         <p className='subtitle'>Upload product images to find matches</p>
//       </header>

//       <div className='two-column-layout'>
//         <div className='left-column'>
//           <div className='status-card'>
//             <h3>System Controls</h3>
//             <div className='upload-controls'>
//               <input
//                 type='file'
//                 ref={fileInputRef}
//                 onChange={handleImageUpload}
//                 accept='image/*'
//                 style={{ display: 'none' }}
//                 disabled={isLoading || !isActive}
//               />

//               <button
//                 className={`upload-button ${isLoading ? 'loading' : ''} ${
//                   !isActive ? 'disabled' : ''
//                 }`}
//                 onClick={() => setShowImageModal(true)}
//                 disabled={isLoading || !isActive}
//               >
//                 {isLoading ? (
//                   <>
//                     <span className='spinner'></span>
//                     Analyzing Image...
//                   </>
//                 ) : (
//                   <>
//                     <svg className='upload-icon' viewBox='0 0 24 24'>
//                       <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
//                     </svg>
//                     Upload Product Image
//                   </>
//                 )}
//               </button>

//               {!isActive && <p className='helper-text'>Shopping assistant is getting ready...</p>}
//             </div>
//           </div>
//         </div>

//         <div className='right-column'>
//           {previewImage ? (
//             <div className='image-preview-container'>
//               <div className='image-preview animated-image'>
//                 <img src={previewImage} alt='Preview' />
//                 {isLoading && (
//                   <div className='processing-overlay'>
//                     <div className='processing-text'>
//                       <div className='spinner'></div>
//                       Analyzing your image...
//                       {uploadProgress > 0 && (
//                         <div className='progress-text'>{uploadProgress}% complete</div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className='empty-preview'>
//               <svg className='placeholder-icon' viewBox='0 0 24 24'>
//                 <path d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z' />
//               </svg>
//               <p>Image preview will appear here</p>
//             </div>
//           )}

//           {error && (
//             <div className='error-message'>
//               <svg className='error-icon' viewBox='0 0 24 24'>
//                 <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
//               </svg>
//               {error}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='results-section'>
//         {searchResults.length > 0 ? (
//           <>
//             <h2 className='results-title'>Matching Products ({searchResults.length})</h2>
//             <div className='product-grid'>
//               {searchResults.map(product => (
//                 <div className='product-card' key={product._id}>
//                   <div className='product-image'>
//                     <img
//                       src={productProfileImage(product.media)}
//                       alt={product.name}
//                       loading='lazy'
//                     />
//                   </div>
//                   <div className='product-details'>
//                     <h3>{product.name}</h3>
//                     {product.brand && <p className='brand'>{product.brand.name}</p>}
//                     {product.sizes && product.sizes.length > 0 && (
//                       <p className='price'>₹{product.sizes[0].price.effective.min}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}{' '}
//             </div>
//           </>
//         ) : (
//           previewImage &&
//           !isLoading && (
//             <div className='no-results'>
//               <svg className='no-results-icon' viewBox='0 0 24 24'>
//                 <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
//               </svg>
//               No matching products found. Try with a different image.
//             </div>
//           )
//         )}
//       </div>

//       {/* Activation Popup */}
//       {showActivationPopup && (
//         <div className='popup-overlay'>
//           <div className='popup-box activation-popup' style={{ textAlign: 'center' }}>
//             <h2 style={{ color: '#010228', marginTop: '1rem' }}>Getting Things Ready</h2>
//             <p className='popup-message'>{statusMessage}</p>
//             <div
//               className='progress-container'
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 gap: '1rem',
//                 margin: '1.5rem 0',
//               }}
//             >
//               <div className='spinner-container'>
//                 <div className='spinner'></div>
//               </div>
//               <div className='progress-text'>This may take a few moments...</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* First-Time Popup */}
//       {showPopup && (
//         <div className='popup-overlay'>
//           <div className='popup-box'>
//             <h2 style={{ color: '#010228' }}>Welcome to iSnapToShop!</h2>
//             <p className='popup-message'>
//               Your shopping assistant is ready to help you find products. Just upload an image to
//               get started!
//             </p>
//             <button
//               onClick={() => {
//                 setShowPopup(false);
//                 setState(prev => ({ ...prev, firstTimeVisit: false }));
//               }}
//               className='popup-close-button'
//             >
//               Start Shopping
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';
import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
import './style/home.css';

Chart.register(...registerables);

const EXAMPLE_MAIN_URL = window.location.origin;
const STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/c2c57f87-9aaf-4cd0-b739-17448198b12c';
const GET_STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/5e71a083-579e-4d69-b997-6e9789cc294c';
const UPDATE_STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/86be8314-f7af-44f1-919f-2b10a413bf48';

export const Home = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showPopup, setShowPopup] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalSearches: 1243,
    successfulMatches: 892,
    matchRate: 71.8,
    popularProducts: [],
    searchTrends: [],
    deviceBreakdown: [],
  });
  const [searchTrendsChart, setSearchTrendsChart] = useState({
    labels: [],
    datasets: [],
  });

  const [state, setState] = useState({
    isLoading: false,
    searchResults: [],
    previewImage: null,
    error: null,
    uploadProgress: 0,
    isActive: false,
    isInitializing: true,
    statusMessage: 'Preparing your shopping assistant...',
    apiStatusLoading: true,
    firstTimeVisit: true,
  });

  const fileInputRef = useRef(null);
  const { application_id, company_id } = useParams();

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(
        `${EXAMPLE_MAIN_URL}/api/analytics/report?applicationId=672ddc7346bed2c768faf043&startDate=05-06-2025&endDate=08-06-2025`
      );
      const data = await response.json();

      let totalSearches = 0;
      let successfulMatches = 0;

      data.report.forEach(item => {
        if (item._id === 'image_search') totalSearches += item.count;
        if (item._id === 'image_search') successfulMatches += item.count; // You may want a different field if defined
      });

      setAnalyticsData({
        totalSearches,
        successfulMatches,
        matchRate: parseFloat(data.matchRate),
        popularProducts: [], // You'll fill this when API provides it
        searchTrends: data.searchTrends,
        deviceBreakdown: [], // Optional; if data available
      });

      // Optional: If you're also setting up charts
      setSearchTrendsChart({
        labels: data.searchTrends.map(item => item.date),
        datasets: [
          {
            label: 'Searches',
            data: data.searchTrends.map(item => item.count),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.4,
          },
        ],
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      const timer = setTimeout(() => {
        // setAnalyticsData({
        //   totalSearches: 1243,
        //   successfulMatches: 892,
        //   matchRate: 71.8,
        //   popularProducts: [
        //     { name: 'Nike Air Max', searches: 215 },
        //     { name: 'Adidas Ultraboost', searches: 187 },
        //     { name: 'Apple Watch Series 7', searches: 156 },
        //     { name: 'Samsung Galaxy S22', searches: 132 },
        //     { name: 'Bose QuietComfort 45', searches: 98 },
        //   ],
        //   searchTrends: [
        //     { day: 'Mon', searches: 120 },
        //     { day: 'Tue', searches: 145 },
        //     { day: 'Wed', searches: 132 },
        //     { day: 'Thu', searches: 168 },
        //     { day: 'Fri', searches: 210 },
        //     { day: 'Sat', searches: 245 },
        //     { day: 'Sun', searches: 223 },
        //   ],
        //   deviceBreakdown: [
        //     { device: 'Mobile', percentage: 68 },
        //     { device: 'Desktop', percentage: 25 },
        //     { device: 'Tablet', percentage: 7 },
        //   ],
        // });
        fetchAnalyticsData();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    if (state.isInitializing && !state.isActive) {
      setShowActivationPopup(true);
    } else {
      setShowActivationPopup(false);
    }
  }, [state.isInitializing, state.isActive]);

  useEffect(() => {
    if (!state.apiStatusLoading && !state.isActive && state.firstTimeVisit) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [state.apiStatusLoading, state.isActive, state.firstTimeVisit]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

        if (isMounted && response.data?.status === 'success') {
          const record = response.data.data.result.data.find(item => item._id === application_id);

          if (record) {
            if (record.active === 'true') {
              setState(prev => ({
                ...prev,
                isActive: true,
                isInitializing: false,
                apiStatusLoading: false,
                firstTimeVisit: false,
                statusMessage: 'Ready to search products!',
              }));
            } else {
              await toggleActiveStatus(true);
              await updateStatusOnServer(true);
            }
          } else {
            await toggleActiveStatus(true);
            await updateStatusOnServer(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch API status:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            apiStatusLoading: false,
            isInitializing: false,
            error: 'Failed to initialize shopping assistant',
            firstTimeVisit: false,
          }));
        }
      }
    };

    if (!state.isActive) {
      fetchInitialStatus();
    } else {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        apiStatusLoading: false,
        statusMessage: 'Ready to search products!',
        firstTimeVisit: false,
      }));
    }

    return () => {
      isMounted = false;
    };
  }, [application_id, state.isActive]);

  const updateStatusOnServer = async activeStatus => {
    try {
      const getResponse = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

      if (getResponse.data?.status === 'success') {
        const record = getResponse.data.data.result.data.find(item => item._id === application_id);

        if (!record) {
          const createResponse = await axios.post(STATUS_API_URL, {
            _id: application_id,
            url: window.location.href,
            title: `iSnapToShop - ${application_id}`,
            active: activeStatus.toString(),
          });
          return createResponse.data.id;
        }

        const updateData = {
          id: record.id,
          _id: application_id,
          url: window.location.href,
          title: `iSnapToShop - ${application_id}`,
          active: activeStatus.toString(),
        };

        const updateResponse = await axios.put(UPDATE_STATUS_API_URL, updateData);
        return updateResponse.data.id;
      }
    } catch (error) {
      console.error('Status update failed:', error);
      throw error;
    }
  };

  const toggleActiveStatus = async (isAutoActivate = false) => {
    try {
      if (state.isActive && isAutoActivate) return;
      setState(prev => ({
        ...prev,
        isInitializing: true,
        error: null,
        statusMessage: isAutoActivate
          ? 'Setting up your shopping assistant...'
          : 'Updating your settings...',
      }));

      if (state.isActive && !isAutoActivate) {
        await axios.post(
          urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/remove-index'),
          {},
          {
            headers: { 'x-company-id': company_id },
            params: { application_id, company_id },
          }
        );
        setState(prev => ({
          ...prev,
          isActive: false,
          isInitializing: false,
          firstTimeVisit: false,
          error: null,
          previewImage: null,
          searchResults: [],
          statusMessage: 'Shopping assistant is inactive',
        }));
      } else {
        await axios.post(
          urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/init-index'),
          {},
          {
            headers: { 'x-company-id': company_id },
            params: { application_id, company_id },
          }
        );

        const pollStatus = async () => {
          const maxRetries = 20;
          const interval = 3000;
          for (let i = 0; i < maxRetries; i++) {
            const res = await axios.get(
              urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/index-status'),
              {
                headers: { 'x-company-id': company_id },
                params: { application_id, company_id },
              }
            );
            if (res.data.status.status === 'completed') {
              return true;
            }
            setState(prev => ({
              ...prev,
              statusMessage:
                i < 5 ? 'Getting your product catalog ready...' : 'Almost done! Just a moment...',
            }));
            await new Promise(r => setTimeout(r, interval));
          }
          throw new Error('Something went wrong during setup. Please try again.');
        };

        await pollStatus();

        setState(prev => ({
          ...prev,
          isActive: true,
          isInitializing: false,
          firstTimeVisit: false,
          error: null,
          searchResults: [],
          statusMessage: 'Ready to search products!',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitializing: false,
        firstTimeVisit: false,
        error:
          error.response?.data?.error ||
          (state.isActive
            ? 'Failed to pause shopping assistant'
            : 'Failed to start shopping assistant'),
        statusMessage: 'Something went wrong. Please try again.',
      }));
    }
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      uploadProgress: 0,
      searchResults: [],
    }));

    try {
      const reader = new FileReader();
      reader.onload = e => {
        setState(prev => ({ ...prev, previewImage: e.target.result }));
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/search-by-image'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-company-id': company_id,
          },
          params: { application_id, company_id },
          onUploadProgress: progressEvent => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setState(prev => ({ ...prev, uploadProgress: progress }));
          },
        }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: response.data.results || [],
        uploadProgress: 100,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.error || 'Failed to search products',
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const productProfileImage = media => {
    if (!media || !media.length) return DEFAULT_NO_IMAGE;
    const profileImg = media.find(m => m.type === 'image');
    return profileImg?.url || DEFAULT_NO_IMAGE;
  };

  const generateImageFromPrompt = async function (prompt) {
    try {
      setIsGenerating(true);
      const response = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/generate-prompts-to-image'),
        { prompt },
        {
          headers: { 'x-company-id': company_id },
          params: { application_id, company_id },
        }
      );

      const data = response.data;
      if (data.success && data.imageUrl) {
        const imageResponse = await axios.get(data.imageUrl, { responseType: 'blob' });
        const imageBlob = imageResponse.data;

        const file = new File([imageBlob], 'generated-image.png', {
          type: imageBlob.type || 'image/png',
        });

        const reader = new FileReader();
        reader.onload = e => {
          setState(prev => ({ ...prev, previewImage: e.target.result }));
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          uploadProgress: 0,
          searchResults: [],
        }));

        const searchResponse = await axios.post(
          urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/search-by-image'),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-company-id': company_id,
            },
            params: { application_id, company_id },
            onUploadProgress: progressEvent => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setState(prev => ({ ...prev, uploadProgress: progress }));
            },
          }
        );

        setState(prev => ({
          ...prev,
          isLoading: false,
          searchResults: searchResponse.data.results || [],
          uploadProgress: 100,
        }));
        setPromptText('');
        setIsGenerating(false);
        setShowImageModal(false);
      } else {
        throw new Error('Image generation failed or imageUrl missing');
      }
    } catch (err) {
      console.error('Error generating/searching image:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate or search image',
      }));
    }
  };

  // const searchTrendsChart = {
  //   labels: analyticsData.searchTrends.map(item => item.day),
  //   datasets: [
  //     {
  //       label: 'Daily Searches',
  //       data: analyticsData.searchTrends.map(item => item.searches),
  //       backgroundColor: 'rgba(54, 162, 235, 0.2)',
  //       borderColor: 'rgba(54, 162, 235, 1)',
  //       borderWidth: 2,
  //       tension: 0.3,
  //       fill: true,
  //     },
  //   ],
  // };

  const deviceBreakdownChart = {
    labels: analyticsData.deviceBreakdown.map(item => item.device),
    datasets: [
      {
        data: analyticsData.deviceBreakdown.map(item => item.percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const popularProductsChart = {
    labels: analyticsData.popularProducts.map(item => item.name),
    datasets: [
      {
        label: 'Search Count',
        data: analyticsData.popularProducts.map(item => item.searches),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const {
    isLoading,
    searchResults,
    previewImage,
    error,
    uploadProgress,
    isActive,
    isInitializing,
    statusMessage,
    apiStatusLoading,
  } = state;

  return (
    <div className='scan-container'>
      {showImageModal && (
        <div className='upload-modal-overlay'>
          <div className='upload-modal-content'>
            <h2>Upload or Generate Product Image</h2>
            <div className='upload-modal-section'>
              <label>Upload Image</label>
              <input
                style={{ width: '94%' }}
                type='file'
                onChange={e => {
                  handleImageUpload(e);
                  setShowImageModal(false);
                }}
                accept='image/*'
              />
            </div>
            <h4 style={{ textAlign: 'center', marginBottom: '0px' }}>OR</h4>
            <div className='upload-modal-section'>
              <label>Generate Image via Prompt</label>
              <input
                type='text'
                style={{ width: '94%' }}
                placeholder='Describe your product'
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                disabled={isGenerating}
              />
              <button
                onClick={() => generateImageFromPrompt(promptText)}
                className='generate-button'
                disabled={isGenerating || !promptText}
              >
                {isGenerating ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      className='spinner'
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    ></span>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate & Use Image'
                )}
              </button>
            </div>
            <button
              className='close-button'
              onClick={() => {
                setShowImageModal(false);
                setPromptText('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <header className='app-header'>
        <div className='header-content'>
          <h1 className='title'>iSnapToShop Admin</h1>
          <p className='subtitle'>Visual Shopping Assistant Dashboard</p>
        </div>
        <div className='admin-tabs'>
          {/* <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <svg className='tab-icon' viewBox='0 0 24 24'>
              <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
            </svg>
            Product Search
          </button> */}
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <svg className='tab-icon' viewBox='0 0 24 24'>
              <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' />
            </svg>
            Analytics
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <svg className='tab-icon' viewBox='0 0 24 24'>
              <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
            </svg>
            Product Search
          </button>
        </div>
      </header>

      {activeTab === 'search' ? (
        <>
          <div className='two-column-layout'>
            <div className='left-column'>
              <div className='status-card'>
                <h3>System Controls</h3>
                <div className='upload-controls'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept='image/*'
                    style={{ display: 'none' }}
                    disabled={isLoading || !isActive}
                  />
                  <button
                    className={`upload-button ${isLoading ? 'loading' : ''} ${
                      !isActive ? 'disabled' : ''
                    }`}
                    onClick={() => setShowImageModal(true)}
                    disabled={isLoading || !isActive}
                  >
                    {isLoading ? (
                      <>
                        <span className='spinner'></span>
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <svg className='upload-icon' viewBox='0 0 24 24'>
                          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
                        </svg>
                        Upload Product Image
                      </>
                    )}
                  </button>
                  {!isActive && (
                    <p className='helper-text'>Shopping assistant is getting ready...</p>
                  )}
                </div>
              </div>
            </div>

            <div className='right-column'>
              {previewImage ? (
                <div className='image-preview-container'>
                  <div className='image-preview animated-image'>
                    <img src={previewImage} alt='Preview' />
                    {isLoading && (
                      <div className='processing-overlay'>
                        <div className='processing-text'>
                          <div className='spinner'></div>
                          Analyzing your image...
                          {uploadProgress > 0 && (
                            <div className='progress-text'>{uploadProgress}% complete</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='empty-preview'>
                  <svg className='placeholder-icon' viewBox='0 0 24 24'>
                    <path d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z' />
                  </svg>
                  <p>Image preview will appear here</p>
                </div>
              )}

              {error && (
                <div className='error-message'>
                  <svg className='error-icon' viewBox='0 0 24 24'>
                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className='results-section'>
            {searchResults.length > 0 ? (
              <>
                <h2 className='results-title'>Matching Products ({searchResults.length})</h2>
                <div className='product-grid'>
                  {searchResults.map(product => (
                    <div className='product-card' key={product._id}>
                      <div className='product-image'>
                        <img
                          src={productProfileImage(product.media)}
                          alt={product.name}
                          loading='lazy'
                        />
                      </div>
                      <div className='product-details'>
                        <h3>{product.name}</h3>
                        {product.brand && <p className='brand'>{product.brand.name}</p>}
                        {product.sizes && product.sizes.length > 0 && (
                          <p className='price'>₹{product.sizes[0].price.effective.min}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              previewImage &&
              !isLoading && (
                <div className='no-results'>
                  <svg className='no-results-icon' viewBox='0 0 24 24'>
                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
                  </svg>
                  No matching products found. Try with a different image.
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div className='analytics-dashboard'>
          <div className='metrics-grid'>
            <div className='metric-card'>
              <div className='metric-value'>{analyticsData.totalSearches}</div>
              <div className='metric-label'>Total Searches</div>
              <div className='metric-trend up'>↑ 12% from last week</div>
            </div>

            <div className='metric-card'>
              <div className='metric-value'>{analyticsData.successfulMatches}</div>
              <div className='metric-label'>Successful Matches</div>
              <div className='metric-trend up'>↑ 8% from last week</div>
            </div>

            <div className='metric-card'>
              <div className='metric-value'>{analyticsData.matchRate}%</div>
              <div className='metric-label'>Match Rate</div>
              <div className='metric-trend down'>↓ 2% from last week</div>
            </div>

            <div className='metric-card'>
              <div className='metric-value'>{Math.round(analyticsData.totalSearches / 7)}/day</div>
              <div className='metric-label'>Avg. Daily Searches</div>
              <div className='metric-trend up'>↑ 15% from last week</div>
            </div>
          </div>

          <div className='chart-row'>
            <div className='chart-card'>
              <h3>Search Trends (Last 7 Days)</h3>
              <div className='chart-container'>
                <Line
                  data={searchTrendsChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className='chart-card'>
              <h3>Device Breakdown</h3>
              <div className='chart-container'>
                <Pie
                  data={deviceBreakdownChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className='chart-row'>
            <div className='chart-card full-width'>
              <h3>Most Popular Products</h3>
              <div className='chart-container'>
                <Bar
                  data={popularProductsChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className='recent-searches'>
            <h3>Recent Search Activity</h3>
            <div className='search-table'>
              <div className='table-header'>
                <div className='table-cell'>Time</div>
                <div className='table-cell'>Image</div>
                <div className='table-cell'>Results</div>
                <div className='table-cell'>Device</div>
                <div className='table-cell'>Status</div>
              </div>
              <div className='table-row'>
                <div className='table-cell'>2 mins ago</div>
                <div className='table-cell'>
                  <div className='table-image-preview'>
                    <img src={DEFAULT_NO_IMAGE} alt='Search' />
                  </div>
                </div>
                <div className='table-cell'>8 matches</div>
                <div className='table-cell'>Mobile</div>
                <div className='table-cell success'>Successful</div>
              </div>
              <div className='table-row'>
                <div className='table-cell'>15 mins ago</div>
                <div className='table-cell'>
                  <div className='table-image-preview'>
                    <img src={DEFAULT_NO_IMAGE} alt='Search' />
                  </div>
                </div>
                <div className='table-cell'>0 matches</div>
                <div className='table-cell'>Desktop</div>
                <div className='table-cell warning'>No results</div>
              </div>
              <div className='table-row'>
                <div className='table-cell'>32 mins ago</div>
                <div className='table-cell'>
                  <div className='table-image-preview'>
                    <img src={DEFAULT_NO_IMAGE} alt='Search' />
                  </div>
                </div>
                <div className='table-cell'>12 matches</div>
                <div className='table-cell'>Mobile</div>
                <div className='table-cell success'>Successful</div>
              </div>
              <div className='table-row'>
                <div className='table-cell'>1 hour ago</div>
                <div className='table-cell'>
                  <div className='table-image-preview'>
                    <img src={DEFAULT_NO_IMAGE} alt='Search' />
                  </div>
                </div>
                <div className='table-cell'>3 matches</div>
                <div className='table-cell'>Tablet</div>
                <div className='table-cell success'>Successful</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActivationPopup && (
        <div className='popup-overlay'>
          <div className='popup-box activation-popup' style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#010228', marginTop: '1rem' }}>Getting Things Ready</h2>
            <p className='popup-message'>{statusMessage}</p>
            <div
              className='progress-container'
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                margin: '1.5rem 0',
              }}
            >
              <div className='spinner-container'>
                <div className='spinner'></div>
              </div>
              <div className='progress-text'>This may take a few moments...</div>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className='popup-overlay'>
          <div className='popup-box'>
            <h2 style={{ color: '#010228' }}>Welcome to iSnapToShop!</h2>
            <p className='popup-message'>
              Your shopping assistant is ready to help you find products. Just upload an image to
              get started!
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                setState(prev => ({ ...prev, firstTimeVisit: false }));
              }}
              className='popup-close-button'
            >
              Start Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
