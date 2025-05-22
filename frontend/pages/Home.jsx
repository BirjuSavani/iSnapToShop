import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';
import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
import './style/home.css';

const EXAMPLE_MAIN_URL = window.location.origin;

export const Home = () => {
  const [state, setState] = useState({
    isLoading: false,
    isInitializing: false,
    checkingStatus: true,
    searchResults: [],
    previewImage: null,
    error: null,
    uploadProgress: 0,
    systemStatus: null,
    aiModelInfo: null,
  });

  const fileInputRef = useRef(null);
  const { application_id, company_id } = useParams();
  console.log('company_id:', company_id);
  console.log('application_id:', application_id);

  useEffect(() => {
    checkSystemStatus();
    app();
    if (application_id) {
      console.log('Initializing product index...');
      console.log('company_id:', company_id);
      console.log('application_id:', application_id);
      initializeProductIndex();

      console.log('Product index initialized.');
    }
  }, []);

  const app = async () => {
    const response = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/app'), {
      headers: { 'x-company-id': company_id },
      query: { application_id: application_id || undefined, company_id: company_id },
    });
    console.log(response);
  };
  const checkSystemStatus = async () => {
    try {
      const response = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/scan/system-status'), {
        headers: { 'x-company-id': company_id },
      });

      setState(prev => ({
        ...prev,
        checkingStatus: false,
        systemStatus: response.data.success ? 'operational' : 'operational',
        aiModelInfo: response.data.aiService,
      }));
    } catch (error) {
      console.error('Failed to check system status:', error);
      setState(prev => ({
        ...prev,
        checkingStatus: false,
        systemStatus: 'offline',
        error: 'Failed to connect to AI service',
      }));
    }
  };

  const initializeProductIndex = async () => {
    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      const response = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, '/api/scan/init-index'),
        {},
        {
          headers: { 'x-company-id': company_id },
          params: { application_id: application_id || undefined, company_id: company_id },
        }
      );

      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: null,
      }));

      alert(`Successfully indexed products!`);
    } catch (error) {
      console.error('Initialization failed:', error);
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: error.response?.data?.error || 'Failed to initialize product index',
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
        urlJoin(EXAMPLE_MAIN_URL, '/api/scan/search-by-image'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-company-id': company_id,
          },
          params: {
            application_id: application_id || undefined,
            company_id: company_id,
          },
          onUploadProgress: progressEvent => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setState(prev => ({ ...prev, uploadProgress: progress }));
          },
        }
      );
      console.log('response:', response);
      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: response.data.results || [],
        uploadProgress: 100,
        aiModelInfo: response.data.metadata,
      }));
    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.error || 'Failed to search products',
      }));
    }
  };

  const productProfileImage = media => {
    if (!media || !media.length) return DEFAULT_NO_IMAGE;
    const profileImg = media.find(m => m.type === 'image');
    return profileImg?.url || DEFAULT_NO_IMAGE;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const renderSimilarityScore = score => {
    if (score === undefined) return null;

    const percentage = Math.round(score * 100);
    let colorClass = '';

    if (percentage > 85) colorClass = 'high-match';
    else if (percentage > 70) colorClass = 'medium-match';
    else colorClass = 'low-match';

    return <div className={`similarity-score ${colorClass}`}>{percentage}% Match</div>;
  };

  const renderSystemStatus = () => {
    if (state.checkingStatus) {
      return <div className='status-checking'>Checking system status...</div>;
    }

    let statusClass = '';
    let statusText = '';

    switch (state.systemStatus) {
      case 'operational':
        statusClass = 'status-operational';
        statusText = 'System Operational';
        break;
      case 'degraded':
        statusClass = 'status-degraded';
        statusText = 'System Degraded';
        break;
      default:
        statusClass = 'status-offline';
        statusText = 'System Offline';
    }

    return (
      <div className={`system-status ${statusClass}`}>
        {statusText}
        {state.aiModelInfo && (
          <span className='model-info'>
            {state.aiModelInfo.model} ({state.aiModelInfo.device})
          </span>
        )}
      </div>
    );
  };

  const {
    isLoading,
    isInitializing,
    checkingStatus,
    searchResults,
    previewImage,
    error,
    uploadProgress,
    systemStatus,
  } = state;

  const isSystemReady = systemStatus === 'operational';

  return (
    <div className='scan-container'>
      <h1 className='title'>AI-Powered Visual Search</h1>
      <p className='subtitle'>
        {isSystemReady
          ? 'Upload an image to find similar products'
          : 'System initialization required'}
      </p>

      {renderSystemStatus()}

      <div className='controls'>
        {isSystemReady && (
          <>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept='image/*'
              style={{ display: 'none' }}
              disabled={isLoading}
            />

            <button
              className={`upload-button ${isLoading ? 'loading' : ''}`}
              onClick={triggerFileInput}
              disabled={isLoading || checkingStatus}
            >
              {isLoading ? (
                <>
                  <span className='spinner'></span>
                  Analyzing...
                </>
              ) : (
                'Upload Product Image'
              )}
            </button>
          </>
        )}

        <button
          className={`init-button ${isInitializing ? 'loading' : ''}`}
          onClick={initializeProductIndex}
          disabled={isInitializing || checkingStatus || !isSystemReady}
        >
          {isInitializing ? (
            <>
              <span className='spinner'></span>
              Initializing...
            </>
          ) : (
            'Rebuild Product Index'
          )}
        </button>
      </div>

      {isLoading && uploadProgress > 0 && (
        <div className='progress-bar'>
          <div className='progress-fill' style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {previewImage && (
        <div className='image-preview'>
          <img src={previewImage} alt='Preview' />
          {isLoading && (
            <div className='processing-overlay'>
              <div className='processing-text'>AI is analyzing your image...</div>
            </div>
          )}
        </div>
      )}

      {error && <div className='error-message'>{error}</div>}

      <div className='results-container'>
        {searchResults.length > 0 ? (
          <>
            <h2>Matching Products ({searchResults.length})</h2>
            <div className='product-grid'>
              {searchResults.map(product => (
                <div className='product-card' key={product._id}>
                  <div className='product-image'>
                    <img src={productProfileImage(product.media)} alt={product.name} />
                  </div>
                  <div className='product-details'>
                    <h3>{product.name}</h3>
                    {product.brand && <p className='brand'>{product.brand.name}</p>}
                    {product.price && <p className='price'>₹{product.price.marked}</p>}
                    {renderSimilarityScore(product.similarityScore)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          previewImage &&
          !isLoading && (
            <div className='no-results'>
              No matching products found. Try with a different image.
            </div>
          )
        )}
      </div>
    </div>
  );
};

//--------------------------------------------------------------------------

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import urlJoin from 'url-join';
// import DEFAULT_NO_IMAGE from '../public/assets/default_icon_listing.png';
// import greenDot from '../public/assets/green-dot.svg';
// import grayDot from '../public/assets/grey-dot.svg';
// import loaderGif from '../public/assets/loader.gif';
// import './style/home.css';

// const EXAMPLE_MAIN_URL = window.location.origin;

// export const Home = () => {
//   const [pageLoading, setPageLoading] = useState(false);
//   const [productList, setProductList] = useState([]);
//   const DOC_URL_PATH = '/help/docs/sdk/latest/platform/company/catalog/#getProducts';
//   const DOC_APP_URL_PATH = '/help/docs/sdk/latest/platform/application/catalog#getAppProducts';
//   const { application_id, company_id } = useParams();
//   const documentationUrl = 'https://api.fynd.com';

//   useEffect(() => {
//     isApplicationLaunch() ? fetchApplicationProducts() : fetchProducts();
//   }, [application_id]);

//   const fetchProducts = async () => {
//     setPageLoading(true);
//     try {
//       const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products'), {
//         headers: {
//           'x-company-id': company_id,
//         },
//       });
//       setProductList(data.items);
//     } catch (e) {
//       console.error('Error fetching products:', e);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   const fetchApplicationProducts = async () => {
//     setPageLoading(true);
//     try {
//       const { data } = await axios.get(
//         urlJoin(EXAMPLE_MAIN_URL, `/api/products/application/${application_id}`),
//         {
//           headers: {
//             'x-company-id': company_id,
//           },
//         }
//       );
//       setProductList(data.items);
//     } catch (e) {
//       console.error('Error fetching application products:', e);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   const productProfileImage = media => {
//     if (!media || !media.length) {
//       return DEFAULT_NO_IMAGE;
//     }
//     const profileImg = media.find(m => m.type === 'image');
//     return profileImg?.url || DEFAULT_NO_IMAGE;
//   };

//   const getDocumentPageLink = () => {
//     return documentationUrl
//       .replace('api', 'partners')
//       .concat(isApplicationLaunch() ? DOC_APP_URL_PATH : DOC_URL_PATH);
//   };

//   const isApplicationLaunch = () => !!application_id;

//   return (
//     <>
//       {pageLoading ? (
//         <div className='loader' data-testid='loader'>
//           <img src={loaderGif} alt='loader GIF' />
//         </div>
//       ) : (
//         <div className='products-container'>
//           <div className='title'>This is an example extension home page user interface.</div>

//           <div className='section'>
//             <div className='heading'>
//               <span>Example {isApplicationLaunch() ? 'Application API' : 'Platform API'}</span> :
//               <a href={getDocumentPageLink()} target='_blank' rel='noopener noreferrer'>
//                 {isApplicationLaunch() ? 'getAppProducts' : 'getProducts'}
//               </a>
//             </div>
//             <div className='description'>
//               This is an illustrative Platform API call to fetch the list of products in this
//               company. Check your extension folder’s 'server.js' file to know how to call Platform
//               API and start calling API you require.
//             </div>
//           </div>

//           <div>
//             {productList?.map((product, index) => (
//               <div
//                 className='product-list-container flex-row'
//                 key={`product-${product.name}-${index}`}
//               >
//                 <img
//                   className='mr-r-12'
//                   src={product.is_active ? greenDot : grayDot}
//                   alt='status'
//                 />
//                 <div className='card-avatar mr-r-12'>
//                   <img src={productProfileImage(product.media)} alt={product.name} />
//                 </div>
//                 <div className='flex-column'>
//                   <div className='flex-row'>
//                     <div className='product-name' data-testid={`product-name-${product.id}`}>
//                       {product.name}
//                     </div>
//                     <div className='product-item-code'>|</div>
//                     {product.item_code && (
//                       <span className='product-item-code'>
//                         Item Code:
//                         <span
//                           className='cl-RoyalBlue'
//                           data-testid={`product-item-code-${product.id}`}
//                         >
//                           {product.item_code}
//                         </span>
//                       </span>
//                     )}
//                   </div>
//                   {product.brand && (
//                     <div
//                       className='product-brand-name'
//                       data-testid={`product-brand-name-${product.id}`}
//                     >
//                       {product.brand.name}
//                     </div>
//                   )}
//                   {product.category_slug && (
//                     <div
//                       className='product-category'
//                       data-testid={`product-category-slug-${product.id}`}
//                     >
//                       Category: <span>{product.category_slug}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };
