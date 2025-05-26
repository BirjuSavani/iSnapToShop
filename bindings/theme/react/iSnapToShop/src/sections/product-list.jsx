import React, { useEffect, useState } from 'react';

// Styles object for component styling
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  uploadSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  uploadButton: {
    backgroundColor: '#3949ab',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontWeight: 'bold',
    border: 'none',
    fontSize: '16px',
    margin: '0 10px 10px 10px',
  },
  mobileButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  desktopButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenInput: {
    display: 'none',
  },
  selectedImageContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  selectedImage: {
    maxWidth: '300px',
    borderRadius: '10px',
    border: '1px solid #ccc',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
  },
  showResultsButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'block',
    margin: '20px auto',
  },
  resultsFoundText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#333',
    marginTop: '20px',
    fontWeight: 'bold',
  },
  // Popup styles
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  popupContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    width: '100%',
  },
  popupHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1001,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBody: {
    padding: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '0',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#333',
    lineHeight: '1.4',
  },
  cardPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e53e3e',
    margin: '8px 0',
  },
  cardOriginalPrice: {
    fontSize: '14px',
    color: '#999',
    textDecoration: 'line-through',
    marginLeft: '8px',
  },
  cardCategory: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: '8px',
  },
  viewDetailsButton: {
    backgroundColor: '#3949ab',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '12px',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#666',
    marginTop: '40px',
  },
  cameraIcon: {
    width: '20px',
    height: '20px',
    fill: 'currentColor',
  },
  selectedImageWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '20px',
  },
  aiProcessingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(57, 73, 171, 0.7)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  aiIcon: {
    fontSize: '48px',
    marginBottom: '15px',
    animation: 'pulse 1.5s infinite',
  },
  aiProcessingText: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  aiSubtext: {
    fontSize: '14px',
    opacity: 0.8,
  },
  dotsAnimation: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'white',
    margin: '0 3px',
    animation: 'bounce 1.4s infinite ease-in-out',
  },
  dotsAnimation1: { animationDelay: '0s' },
  dotsAnimation2: { animationDelay: '0.2s' },
  dotsAnimation3: { animationDelay: '0.4s' },
  // Animations
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.1)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
  '@keyframes bounce': {
    '0%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-10px)' },
  },
};

export function Component({ props }) {
  const application_id = '672ddc7346bed2c768faf043';
  const company_id = '9095';

  const [productFilterList, setProductFilterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const API_BASE_URL_2 = `/ext/ab/api/proxy/scan`;
  const title = props?.title?.value ?? 'Snap & Shop - Find Products by Image';

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('company_id', company_id);

    try {
      const response = await fetch(
        `${API_BASE_URL_2}/search-by-image?application_id=${application_id}&company_id=${company_id}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const data = await response.json();

      // Set the results from API response
      setProductFilterList(data.results || []);

      // Automatically open popup if products are found
      if (data.results && data.results.length > 0) {
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error during image upload search:', error);
      setProductFilterList([]);
    }

    setLoading(false);
  };

  const handleViewDetails = product => {
    // Redirect to product description page using the product slug
    const productSlug =
      product.slug || product.id || product.name.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/product/${productSlug}`;
  };

  const openProductListPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const formatPrice = price => {
    return `₹${price.toLocaleString()}`;
  };

  const formatCategoryName = category => {
    if (!category) return '';
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Font Awesome camera icon component
  const CameraIcon = () => (
    <svg style={styles.cameraIcon} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
      <path d='M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z' />
    </svg>
  );

  const AIProcessingOverlay = () => (
    <div style={styles.aiProcessingOverlay}>
      <div style={{ ...styles.aiIcon }}>
        <svg
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'></path>
          <path d='M12 12v9'></path>
          <path d='m8 17 4 4 4-4'></path>
        </svg>
      </div>
      <div style={styles.aiProcessingText}>AI Processing</div>
      <div style={styles.aiSubtext}>Analyzing image patterns</div>
      <div style={{ marginTop: '15px', display: 'flex' }}>
        <div style={{ ...styles.dotsAnimation, ...styles.dotsAnimation1 }}></div>
        <div style={{ ...styles.dotsAnimation, ...styles.dotsAnimation2 }}></div>
        <div style={{ ...styles.dotsAnimation, ...styles.dotsAnimation3 }}></div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div>
        <title>{title}</title>
      </div>

      <h1 style={styles.title}>{title}</h1>

      <div style={styles.uploadSection}>
        {isMobile ? (
          <div style={styles.mobileButtonContainer}>
            <label htmlFor='imageCaptureUpload'>
              <CameraIcon />
            </label>
            <input
              id='imageCaptureUpload'
              type='file'
              accept='image/*'
              capture='environment'
              style={styles.hiddenInput}
              onChange={e => handleImageUpload(e, true)}
            />

            <label htmlFor='imageFileUpload'>
              <CameraIcon />
            </label>
            <input
              id='imageFileUpload'
              type='file'
              accept='image/*'
              style={styles.hiddenInput}
              onChange={e => handleImageUpload(e, false)}
            />
          </div>
        ) : (
          <div style={styles.desktopButtonContainer}>
            <label htmlFor='imageUpload'>
              <CameraIcon />
            </label>
            <input
              id='imageUpload'
              type='file'
              accept='image/*'
              style={styles.hiddenInput}
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>

      {selectedImage && (
        <div style={styles.selectedImageContainer}>
          <div style={styles.selectedImageWrapper}>
            <img src={selectedImage} alt='Selected' style={styles.selectedImage} />
            {loading && <AIProcessingOverlay />}
          </div>
        </div>
      )}
      {loading ? (
        <>
          {/* <p style={styles.loadingText}>Finding perfect matches for you</p> */}
        </>
      ) : (
        <div>
          {productFilterList.length === 0 && selectedImage && (
            <p style={styles.noProductsText}>No matching products found.</p>
          )}
          {/* {productFilterList.length === 0 && !selectedImage && (
            <p style={styles.noProductsText}>Upload an image to start searching.</p>
          )} */}
        </div>
      )}

      {/* Product List Popup */}
      {showPopup && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div style={styles.popupContent} onClick={e => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <h2 style={styles.popupTitle}>
                Search Results ({productFilterList.length} products)
              </h2>
              <button style={styles.closeButton} onClick={closePopup}>
                ×
              </button>
            </div>

            <div style={styles.popupBody}>
              {productFilterList.length > 0 ? (
                <div style={styles.grid}>
                  {productFilterList.map((product, index) => (
                    <div key={index} style={styles.card}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={styles.cardImage}
                        onError={e => {
                          e.target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                      <h3 style={styles.cardTitle}>{product.name}</h3>

                      {product.category && (
                        <p style={styles.cardCategory}>{formatCategoryName(product.category)}</p>
                      )}

                      {product.sizes && product.sizes.length > 0 && (
                        <div style={styles.cardPrice}>
                          {formatPrice(product.sizes[0].price.effective.min)}
                          {product.sizes[0].price.marked.min >
                            product.sizes[0].price.effective.min && (
                            <span style={styles.cardOriginalPrice}>
                              {formatPrice(product.sizes[0].price.marked.min)}
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        style={styles.viewDetailsButton}
                        onClick={() => handleViewDetails(product)}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noProductsText}>No products found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Required for FDK to register the server call
Component.serverFetch = async ({ fpi }) => {
  return {};
};

export const settings = {
  label: 'Product List',
  name: 'product-list',
  props: [
    {
      id: 'title',
      label: 'Page Title',
      type: 'text',
      default: '',
      info: 'Page Title',
    },
  ],
  blocks: [],
};