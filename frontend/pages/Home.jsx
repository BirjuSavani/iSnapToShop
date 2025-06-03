// import axios from 'axios';
// import { useEffect, useRef, useState } from 'react';
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
//   const [state, setState] = useState({
//     isLoading: false,
//     searchResults: [],
//     previewImage: null,
//     error: null,
//     uploadProgress: 0,
//     isActive: false,
//     isInitializing: false,
//     statusMessage: '',
//     apiStatusLoading: true,
//   });

//   const fileInputRef = useRef(null);
//   const { application_id, company_id } = useParams();

//   // useEffect(() => {
//   //   setShowPopup(true);
//   // }, []);

//   useEffect(() => {
//     if (!state.apiStatusLoading && !state.isActive) {
//       setShowPopup(true);
//     } else {
//       setShowPopup(false);
//     }
//   }, [state.apiStatusLoading, state.isActive]);

//   // Fetch initial status from both localStorage and API
//   useEffect(() => {
//     let isMounted = true;

//     const fetchInitialStatus = async () => {
//       try {
//         const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

//         if (isMounted && response.data?.status === 'success') {
//           const record = response.data.data.result.data.find(item => item._id === application_id);

//           if (record) {
//             setState(prev => ({
//               ...prev,
//               isActive: record.active === 'true',
//               apiStatusLoading: false,
//             }));
//           } else {
//             // Create new record with default inactive status
//             await updateStatusOnServer(false);
//             setState(prev => ({
//               ...prev,
//               isActive: false,
//               apiStatusLoading: false,
//             }));
//           }
//         }
//       } catch (error) {
//         console.error('Failed to fetch API status:', error);
//         if (isMounted) {
//           setState(prev => ({
//             ...prev,
//             apiStatusLoading: false,
//             error: 'Failed to initialize status',
//           }));
//         }
//       }
//     };

//     fetchInitialStatus();

//     return () => {
//       isMounted = false;
//     };
//   }, [application_id]);

//   // Update both localStorage and API when status changes
//   useEffect(() => {
//     if (!state.apiStatusLoading) {
//       localStorage.setItem('isActive', state.isActive);
//       updateStatusOnServer(state.isActive).catch(error => {
//         console.error('Failed to update API status:', error);
//       });
//     }
//   }, [state.isActive, state.apiStatusLoading]);

//   const updateStatusOnServer = async activeStatus => {
//     try {
//       // First get the record by application_id
//       const getResponse = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

//       if (getResponse.data?.status === 'success') {
//         const record = getResponse.data.data.result.data.find(item => item._id === application_id);

//         if (!record) {
//           // If no record exists, create a new one
//           const createResponse = await axios.post(STATUS_API_URL, {
//             _id: application_id,
//             url: window.location.href,
//             title: `iSnapToShop - ${application_id}`,
//             active: activeStatus.toString(),
//           });
//           return createResponse.data.id;
//         }

//         // Update existing record
//         const updateData = {
//           id: record.id, // Use the record's id from the GET response
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

//   const pollIndexStatus = async () => {
//     const POLL_INTERVAL = 3000;
//     const MAX_TIMEOUT = 60000;
//     const start = Date.now();

//     while (Date.now() - start < MAX_TIMEOUT) {
//       try {
//         const res = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/index-status'), {
//           headers: { 'x-company-id': company_id },
//           params: { application_id },
//         });

//         if (res.data?.status === 'ready') {
//           setState(prev => ({
//             ...prev,
//             isInitializing: false,
//             isActive: true,
//             statusMessage: 'Product index is ready.',
//           }));
//           return;
//         }

//         await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
//       } catch (err) {
//         console.error('Polling failed:', err);
//         setState(prev => ({
//           ...prev,
//           isInitializing: false,
//           isActive: false,
//           error: 'Failed to check index status.',
//         }));
//         return;
//       }
//     }

//     setState(prev => ({
//       ...prev,
//       isInitializing: false,
//       isActive: false,
//       error: 'Initialization timed out.',
//     }));
//   };

//   const toggleActiveStatus = async () => {
//     try {
//       setState(prev => ({
//         ...prev,
//         isInitializing: true,
//         error: null,
//       }));

//       if (state.isActive) {
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
//           error: null,
//           previewImage: null,
//           searchResults: [],
//         }));
//       } else {
//         // Activating (start init-index)
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
//             await new Promise(r => setTimeout(r, interval));
//           }
//           throw new Error('Indexing did not complete in time.');
//         };

//         await pollStatus();

//         setState(prev => ({
//           ...prev,
//           isActive: true,
//           isInitializing: false,
//           error: null,
//           searchResults: [],
//         }));
//       }
//     } catch (error) {
//       setState(prev => ({
//         ...prev,
//         isInitializing: false,
//         error:
//           error.response?.data?.error ||
//           (state.isActive
//             ? 'Failed to deactivate product index'
//             : 'Failed to activate product index'),
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

//   const productProfileImage = media => {
//     if (!media || !media.length) return DEFAULT_NO_IMAGE;
//     const profileImg = media.find(m => m.type === 'image');
//     return profileImg?.url || DEFAULT_NO_IMAGE;
//   };

//   const status = isActive
//     ? { text: 'Active', className: 'active' }
//     : isInitializing || apiStatusLoading
//     ? { text: 'Activating...', className: 'activating' }
//     : { text: 'Inactive', className: 'inactive' };

//   return (
//     <div className='scan-container'>
//       <header className='app-header'>
//         <h1 className='title'>iSnapToShop</h1>
//         <p className='subtitle'>Upload product images to find matches</p>
//       </header>

//       <div className='two-column-layout'>
//         <div className='left-column'>
//           <div className='status-card'>
//             <h3>System Controls</h3>
//             <div className='toggle-container'>
//               <label className='toggle-label'>
//                 <span className='status-label'>
//                   Product Index Status:
//                   <span
//                     className='info-tooltip'
//                     data-tooltip='Product Index Status determines if the system will process uploaded product images. Turn it off to disable analysis.'
//                   >
//                     <svg className='info-icon' viewBox='0 0 24 24'>
//                       <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' />
//                     </svg>
//                   </span>
//                 </span>
//                 <div className='toggle-switch'>
//                   <input
//                     type='checkbox'
//                     checked={isActive}
//                     onChange={toggleActiveStatus}
//                     disabled={isInitializing || apiStatusLoading}
//                   />
//                   <span className='slider round'></span>
//                 </div>
//                 <span className={`toggle-status ${status.className}`}>
//                   {status.text}
//                   {(isInitializing || apiStatusLoading) && <span className='loading-dots'></span>}
//                 </span>
//               </label>
//               {(isInitializing || apiStatusLoading) && (
//                 <div className='initializing-message'>
//                   <div className='spinner small'></div>
//                   {statusMessage || 'Initializing, please wait...'}
//                 </div>
//               )}
//             </div>

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
//                 onClick={triggerFileInput}
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

//               {!isActive && (
//                 <p className='helper-text'>Activate Product Index to enable image uploads</p>
//               )}
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
//                     {product.price && <p className='price'>₹{product.price.marked}</p>}
//                   </div>
//                 </div>
//               ))}
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
//       {showPopup && (
//         <div className='popup-overlay'>
//           <div className='popup-box'>
//             <h2 style={{ color: '#010228' }}>Welcome to iSnapToShop!</h2>
//             <p className='popup-message'>
//               Please ensure <span className='highlight'>product indexing is active</span>
//               <span
//                 className='toggle-switch animated-toggle'
//                 aria-label='Active toggle'
//                 role='switch'
//                 aria-checked='true'
//               >
//                 <span className='toggle-track'>
//                   <span className='toggle-thumb' />
//                 </span>
//               </span>{' '}
//               before uploading an image.
//             </p>
//             <button onClick={() => setShowPopup(false)} className='popup-close-button'>
//               Got it
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';
import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
import './style/home.css';

const EXAMPLE_MAIN_URL = window.location.origin;
const STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/c2c57f87-9aaf-4cd0-b739-17448198b12c';
const GET_STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/5e71a083-579e-4d69-b997-6e9789cc294c';
const UPDATE_STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/86be8314-f7af-44f1-919f-2b10a413bf48';

export const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  const [state, setState] = useState({
    isLoading: false,
    searchResults: [],
    previewImage: null,
    error: null,
    uploadProgress: 0,
    isActive: false,
    isInitializing: true, // Start with true to show activation process
    statusMessage: 'Preparing your shopping assistant...',
    apiStatusLoading: true,
    firstTimeVisit: true, // Track first time visit
  });

  const fileInputRef = useRef(null);
  const { application_id, company_id } = useParams();

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

  // Fetch initial status and activate if needed
  useEffect(() => {
    let isMounted = true;

    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);

        if (isMounted && response.data?.status === 'success') {
          const record = response.data.data.result.data.find(item => item._id === application_id);

          if (record) {
            if (record.active === 'true') {
              // Already active
              setState(prev => ({
                ...prev,
                isActive: true,
                isInitializing: false,
                apiStatusLoading: false,
                firstTimeVisit: false,
                statusMessage: 'Ready to search products!',
              }));
            } else {
              // Need to activate
              await toggleActiveStatus(true);
            }
          } else {
            // New record - activate by default
            await toggleActiveStatus(true);
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

    fetchInitialStatus();

    return () => {
      isMounted = false;
    };
  }, [application_id]);

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
        // Deactivating
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
        // Activating
        await axios.post(
          urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/init-index'),
          {},
          {
            headers: { 'x-company-id': company_id },
            params: { application_id, company_id },
          }
        );

        // Polling logic
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
              statusMessage: i < 5
                ? 'Getting your product catalog ready...'
                : 'Almost done! Just a moment...',
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
        error: error.response?.data?.error ||
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

  const productProfileImage = image => {
    if (!image || !image.length) return DEFAULT_NO_IMAGE;
    const profileImg = image.find(m => m.type === 'image');
    return profileImg?.url || DEFAULT_NO_IMAGE;
  };
    
  // const generateImageFromPrompt = async function (prompt) {
  //   try {
  //     const response = await axios.post(
  //       urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/generate-prompts-to-image'),
  //       { prompt },
  //       {
  //         headers: { 'x-company-id': company_id },
  //         params: { application_id, company_id },
  //       }
  //     );

  //     const data = response.data;
  //     if (data.success && data.imageUrl) {
  //       console.log('Generated image URL:', data.imageUrl);

  //       // ✅ Just set the URL directly to previewImage state
  //       setState(prev => ({
  //         ...prev,
  //         previewImage: data.imageUrl,
  //       }));
  //       setShowImageModal(false);
  //     } else {
  //       throw new Error('Image generation failed');
  //     }
  //   } catch (err) {
  //     console.error('Error generating image:', err);
  //   }
  // };
  
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const generateImageFromPrompt = async function (prompt) {
    try {
      const response = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, '/api/platform/scan/generate-prompts-to-image'),
        { prompt },
        {
          headers: { 'x-company-id': company_id },
          params: { application_id, company_id },
        }
      );

      const data = response.data;
      if (data.success && data.imageBase64) {
        const file = base64ToFile(data.imageBase64, 'generated-image.png');

        // Preview
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

        setShowImageModal(false);
      } else {
        throw new Error('Image generation failed or imageBase64 missing');
      }
    } catch (err) {
      console.error('Error generating/searching image:', err);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to generate or search image' }));
    }
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
      {/* Image Modal */}
      {showImageModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal-content">
            <h2>Upload or Generate Product Image</h2>

            <div className="upload-modal-section">
              <label>Upload Image</label>
              <input
                style={{ width: "94%" }}
                type="file"
                onChange={e => {
                  handleImageUpload(e);
                  setShowImageModal(false);
                }}
                accept="image/*"
              />
            </div>
            <h4 style={{ textAlign: "center", marginBottom: "0px" }}>OR</h4>
            <div className="upload-modal-section">
              <label>Generate Image via Prompt</label>
              <input
                type="text"
                style={{ width: "94%" }}
                placeholder="Describe your product"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
              />
              <button
                onClick={() => generateImageFromPrompt(promptText)}
                className="generate-button"
              >
                Generate & Use Image
              </button>
            </div>
            <button
              className="close-button"
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

      {/* Main Header */}
      <header className='app-header'>
        <h1 className='title'>iSnapToShop</h1>
        <p className='subtitle'>Upload product images to find matches</p>
      </header>

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
                className={`upload-button ${isLoading ? 'loading' : ''} ${!isActive ? 'disabled' : ''
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
                      src={product.image}
                      alt={product.name}
                      loading='lazy'
                    />
                  </div>
                  <div className='product-details'>
                    <h3>{product.name}</h3>
                    {product.brand && <p className='brand'>{product.brand}</p>}
                    {product.price_effective && <p className='price'>{product.price_effective}</p>}
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

      {/* Activation Popup */}
      {showActivationPopup && (
        <div className='popup-overlay'>
          <div className='popup-box activation-popup'>
            <div className='activation-spinner'>
              <div className='spinner large'></div>
            </div>
            <h2 style={{ color: '#010228', marginTop: '1rem' }}>Getting Things Ready</h2>
            <p className='popup-message'>
              {statusMessage}
            </p>
            <div className='progress-text'>
              This may take a few moments...
            </div>
          </div>
        </div>
      )}

      {/* First-Time Popup */}
      {showPopup && (
        <div className='popup-overlay'>
          <div className='popup-box'>
            <h2 style={{ color: '#010228' }}>Welcome to iSnapToShop!</h2>
            <p className='popup-message'>
              Your shopping assistant is ready to help you find products.
              Just upload an image to get started!
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
