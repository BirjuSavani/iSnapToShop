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
  // Mobile choice modal styles
  mobileModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2000,
  },
  mobileModalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '20px',
    maxHeight: '50vh',
    animation: 'slideUp 0.3s ease-out',
  },
  mobileModalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  mobileChoiceButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '15px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mobileChoiceButtonHover: {
    backgroundColor: '#e9ecef',
    transform: 'translateY(-1px)',
  },
  mobileChoiceIcon: {
    width: '24px',
    height: '24px',
    fill: '#3949ab',
  },
  mobileChoiceText: {
    color: '#333',
    fontWeight: '500',
  },
  mobileModalCancel: {
    width: '100%',
    padding: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '10px',
    marginTop: '10px',
    fontSize: '16px',
    color: '#666',
    cursor: 'pointer',
    fontWeight: '500',
  },
  // Main upload button for mobile
  mobileUploadMainButton: {
    backgroundColor: '#3949ab',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontWeight: 'bold',
    border: 'none',
    fontSize: '18px',
    width: '100%',
    maxWidth: '300px',
  },
  // Popup styles
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  },
  popupContent: {
    background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
    borderRadius: '16px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
    animation: 'fadeIn 0.4s ease-in-out',
    marginTop: '12px',
  },
  popupHeader: {
    padding: '20px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#ffffffcc',
    backdropFilter: 'blur(4px)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0,
  },
  closeButton: {
    background: '#f1f1f1',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: '#ddd',
    },
  },
  popupBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  card: {
    border: 'none',
    borderRadius: '14px',
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    padding: '10px 16px 0 16px',
    color: '#2d3436',
  },
  cardPrice: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#d63031',
    padding: '0 16px',
  },
  cardOriginalPrice: {
    fontSize: '0.9rem',
    color: '#b2bec3',
    textDecoration: 'line-through',
    marginLeft: '6px',
  },
  cardCategory: {
    fontSize: '0.85rem',
    color: '#636e72',
    textTransform: 'capitalize',
    padding: '0 16px 10px 16px',
  },
  viewDetailsButton: {
    margin: '0 16px 16px 16px',
    padding: '10px',
    backgroundColor: '#F0801A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s ease',
    '&:hover': {
      backgroundColor: '#000027',
    },
  },
  mobileCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '15px',
    borderBottom: '1px solid #eee',
    width: '100%',
  },
  mobileCardImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '15px',
  },
  mobileCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  mobileCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mobileCardPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#d63031',
    marginBottom: '8px',
  },
  mobileCardOriginalPrice: {
    fontSize: '12px',
    color: '#b2bec3',
    textDecoration: 'line-through',
    marginLeft: '6px',
  },
  mobileViewDetailsButton: {
    padding: '8px 12px',
    backgroundColor: '#F0801A',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    alignSelf: 'flex-start',
    transition: 'background 0.2s ease',
    '&:hover': {
      backgroundColor: '#000027',
    },
  },
  mobileProductsContainer: {
    width: '100%',
  },
  // Add fadeIn animation
  ['@keyframes fadeIn']: {
    '0%': { opacity: 0, transform: 'scale(0.95)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
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
  '@keyframes slideUp': {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' },
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
  const [showMobileModal, setShowMobileModal] = useState(false);

  const API_BASE_URL_2 = `/ext/ab/api/proxy/scan`;
  const title = props?.title?.value ?? 'Snap & Shop - Find Products by Image';

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showPopup]);

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

  const handleImageUpload = async (e, isCapture = false) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setSelectedImage(URL.createObjectURL(file));
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('company_id', company_id);

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
      alert('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = product => {
    // Redirect to product description page using the product slug
    const productSlug =
      product.slug || product.id || product.name.toLowerCase().replace(/\s+/g, '-');
    const productUrl = `/product/${productSlug}`;
    window.open(productUrl, '_blank');
  };

  const openProductListPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedImage(null);
  };

  const formatPrice = price => {
    return `₹${price.toLocaleString()}`;
  };

  const formatCategoryName = category => {
    if (!category) return '';
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle mobile button click - show modal
  const handleMobileUploadClick = () => {
    setShowMobileModal(true);
  };

  // Handle mobile modal choice selection
  const handleMobileChoice = choiceType => {
    setShowMobileModal(false); // Close modal first

    // Small delay to ensure modal is closed before showing file picker
    setTimeout(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;

      if (choiceType === 'camera') {
        input.capture = 'environment'; // Use back camera
      }

      // Handle file selection
      input.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          handleImageUpload(e, choiceType === 'camera');
        }
        // Clean up
        input.remove();
      });

      // Handle cancel (when user closes file picker without selecting)
      input.addEventListener('cancel', () => {
        input.remove();
      });

      // Add to document, click, then remove
      document.body.appendChild(input);
      input.style.display = 'none';
      input.click();
    }, 100);
  };

  // Close mobile modal
  const closeMobileModal = () => {
    setShowMobileModal(false);
  };

  // Font Awesome camera icon component
  const CameraIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke='black'
      strokeWidth={1}
      strokeLinecap='round'
      strokeLinejoin='round'
      width={24}
      height={24}
    >
      <path d='M4 7h2.586A2 2 0 0 0 8.414 6l.172-.172A2 2 0 0 1 10 5h4a2 2 0 0 1 1.414.586l.172.172A2 2 0 0 0 17.414 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z' />
      <circle cx='12' cy='13' r='3' />
    </svg>
  );

  const FolderIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke='black'
      strokeWidth={1}
      strokeLinecap='round'
      strokeLinejoin='round'
      width={24}
      height={24}
    >
      <path d='M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' />
      <polyline points='12 12 12 3 8 7' />
      <line x1='12' y1='3' x2='16' y2='7' />
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
            <button onClick={handleMobileUploadClick}>
              <CameraIcon />
            </button>
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
        <>{/* <p style={styles.loadingText}>Finding perfect matches for you</p> */}</>
      ) : (
        <div>
          {productFilterList.length === 0 && selectedImage && (
            <p style={styles.noProductsText}>No matching products found.</p>
          )}
        </div>
      )}

      {/* Mobile Choice Modal */}
      {showMobileModal && (
        <div style={styles.mobileModalOverlay} onClick={closeMobileModal}>
          <div style={styles.mobileModalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.mobileModalTitle}>Choose Image Source</h3>

            <button
              style={styles.mobileChoiceButton}
              onClick={() => handleMobileChoice('camera')}
              onMouseEnter={e => {
                e.target.style.backgroundColor = styles.mobileChoiceButtonHover.backgroundColor;
                e.target.style.transform = styles.mobileChoiceButtonHover.transform;
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = styles.mobileChoiceButton.backgroundColor;
                e.target.style.transform = 'none';
              }}
            >
              <CameraIcon />
              <span style={styles.mobileChoiceText}>Take Photo</span>
            </button>

            <button
              style={styles.mobileChoiceButton}
              onClick={() => handleMobileChoice('gallery')}
              onMouseEnter={e => {
                e.target.style.backgroundColor = styles.mobileChoiceButtonHover.backgroundColor;
                e.target.style.transform = styles.mobileChoiceButtonHover.transform;
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = styles.mobileChoiceButton.backgroundColor;
                e.target.style.transform = 'none';
              }}
            >
              <FolderIcon />
              <span style={styles.mobileChoiceText}>Choose from Gallery</span>
            </button>

            <button style={styles.mobileModalCancel} onClick={closeMobileModal}>
              Cancel
            </button>
          </div>
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
                isMobile ? (
                  <div style={styles.mobileProductsContainer}>
                    {productFilterList.map((product, index) => (
                      <div key={index} style={styles.mobileCard}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={styles.mobileCardImage}
                          onError={e => {
                            e.target.src =
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        <div style={styles.mobileCardContent}>
                          <h3 style={styles.mobileCardTitle}>{product.name}</h3>

                          {product.category && (
                            <p style={styles.cardCategory}>
                              {formatCategoryName(product.category)}
                            </p>
                          )}

                          {product.sizes && product.sizes.length > 0 && (
                            <div style={styles.mobileCardPrice}>
                              {formatPrice(product.sizes[0].price.effective.min)}
                              {product.sizes[0].price.marked.min >
                                product.sizes[0].price.effective.min && (
                                <span style={styles.mobileCardOriginalPrice}>
                                  {formatPrice(product.sizes[0].price.marked.min)}
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            style={styles.mobileViewDetailsButton}
                            onClick={() => handleViewDetails(product)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                        <h3 style={styles.cardTitle}>
                          {product.name.length > 27
                            ? product.name.slice(0, 27) + '...'
                            : product.name}
                        </h3>

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
                )
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
  label: 'iSnapToShop',
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
