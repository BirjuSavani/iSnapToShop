import React, { useEffect, useState } from 'react';
// import './Component.css'

// Styles object for component styling
const styles = {
  container: {
    margin: '0 auto',
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg,#0C5273 0%,#0C5272 100%)',
    // minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },

  title: {
    textAlign: 'center',
    color: '#ffffff',
    // marginBottom: '40px',
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 20px rgba(255,255,255,0.3)',
    letterSpacing: '-0.02em',
    paddingTop: '20px',
  },

  uploadSection: {
    textAlign: 'center',
    marginBottom: '20px',
    position: 'relative',
  },

  customUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '20px',
    // background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '20px 30px',
    borderRadius: '24px',
    marginBottom: '0px',
    color: '#fff',
    cursor: 'pointer',
    // border: '2px solid rgba(255, 255, 255, 0.2)',
    // boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
  },

  mainUploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #e9e9e9 0%, #e2d4e9 50%, #efefef 100%)',
    color: 'black',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    minWidth: '220px',
    margin: '0 auto',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  quickText: {
    fontWeight: '700',
    fontSize: '1.2em',
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // Modal Styles - Completely redesigned
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'modalFadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  modalContent: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    animation: 'modalSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.5)',
  },

  modalTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  modalCloseButton: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#636e72',
    padding: '0',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      transform: 'rotate(90deg)',
    },
  },

  modalBody: {
    padding: '30px',
  },

  modalSection: {
    marginBottom: '25px',
  },

  modalSectionLabel: {
    display: 'block',
    marginBottom: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3436',
    letterSpacing: '0.5px',
  },

  fileInput: {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    fontSize: '15px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
    },
  },

  modalDivider: {
    textAlign: 'center',
    margin: '30px 0',
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
    },
  },

  modalDividerText: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '0 20px',
    color: '#636e72',
    fontSize: '14px',
    fontWeight: '600',
    position: 'relative',
    zIndex: 1,
  },

  promptInput: {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    fontSize: '15px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
    },
  },

  generateButton: {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
    },
  },

  generateButtonDisabled: {
    background: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },

  // Popup Styles - Major redesign
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'modalFadeIn 0.4s ease',
  },

  popupContent: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    maxWidth: '1200px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    animation: 'popupSlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  popupHeader: {
    padding: '25px 30px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  popupTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-0.02em',
  },

  closeButton: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    fontSize: '18px',
    color: '#636e72',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      transform: 'rotate(90deg) scale(1.1)',
    },
  },

  popupBody: {
    maxHeight: '80vh',
    overflowY: 'auto',
    paddingRight: '10px',
    paddingLeft: '10px',
    boxSizing: 'border-box',
  },
  popupImageSection: {
    padding: '25px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '20px',
    marginBottom: '30px',
    border: '2px solid rgba(102, 126, 234, 0.1)',
    textAlign: 'center',
    maxHeight: '300px',
    position: 'relative',
    overflow: 'hidden',
  },

  popupImageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  popupSelectedImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '16px',
    border: '3px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },

  selectedImageWrapper: {
    position: 'relative',
    display: 'inline-block',
  },

  resultsSection: {
    marginTop: '30px',
    borderTop: '2px solid rgba(102, 126, 234, 0.1)',
    paddingTop: '30px',
  },

  resultsTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '25px',
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.01em',
  },

  loadingText: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #5DBDCA 0%, #7864AB 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    padding: '40px 0',
  },

  noProductsText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#636e72',
    marginTop: '50px',
    fontWeight: '500',
  },

  // Grid and Card Styles - Completely modern
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    paddingBottom: '40px', // extra padding at bottom
  },

  card: {
    // border: 'none',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid rgba(231, 233, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    },
  },

  cardImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },

  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    padding: '15px 20px 8px 20px',
    color: '#2d3436',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  },

  cardPrice: {
    fontSize: '1.3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    padding: '0 20px 8px 20px',
  },

  cardOriginalPrice: {
    fontSize: '1rem',
    color: '#b2bec3',
    textDecoration: 'line-through',
    marginLeft: '8px',
    fontWeight: '500',
  },

  cardCategory: {
    fontSize: '0.9rem',
    color: '#636e72',
    textTransform: 'capitalize',
    padding: '0 20px 15px 20px',
    fontWeight: '500',
    opacity: 0.8,
  },

  viewDetailsButton: {
    margin: '0 20px 0px 20px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
    },
  },

  // Mobile Card Styles
  mobileCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    marginBottom: '15px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    width: '100%',
  },

  mobileCardImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginRight: '15px',
    border: '2px solid rgba(255, 255, 255, 0.8)',
  },

  mobileCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  mobileCardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: '6px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4',
  },

  mobileCardPrice: {
    fontSize: '16px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '12px',
  },

  mobileCardOriginalPrice: {
    fontSize: '13px',
    color: '#b2bec3',
    textDecoration: 'line-through',
    marginLeft: '6px',
    fontWeight: '500',
  },

  mobileViewDetailsButton: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    alignSelf: 'flex-start',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 15px rgba(102, 126, 234, 0.3)',
  },

  mobileProductsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingBottom: '40px', // same here
  },

  // AI Processing Overlay
  aiProcessingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  aiIcon: {
    fontSize: '48px',
    marginBottom: '15px',
    animation: 'aiPulse 2s infinite',
  },

  aiProcessingText: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '8px',
  },

  aiSubtext: {
    fontSize: '14px',
    opacity: 0.9,
    fontWeight: '500',
  },

  // Loading Spinner
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  generatingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  imagePreview: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  previewButtonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  previewButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },

  // Animations
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  '@keyframes aiPulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.1)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },

  '@keyframes modalFadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },

  '@keyframes modalSlideUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(30px) scale(0.95)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },

  '@keyframes popupSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(40px) scale(0.9)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },

  // Responsive adjustments
  '@media (max-width: 768px)': {
    title: {
      fontSize: '2.5rem',
      paddingTop: '40px',
    },
    customUploadContainer: {
      padding: '30px 20px',
      margin: '0 15px',
    },
    popupContent: {
      margin: '10px',
      maxWidth: 'calc(100% - 20px)',
    },
    popupBody: {
      padding: '20px',
    },
    grid: {
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
  },
};
// Required for FDK to register the server call
export function Component({ props, fpi }) {
  const application_id = props.application_id.value;
  const company_id = props.company_id.value;

  const [productFilterList, setProductFilterList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // New states for upload/generate modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  // New states for add to cart
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [pincode, setPincode] = useState('');
  const [activeCartItemIndex, setActiveCartItemIndex] = useState(null); // Track which item has active cart overlay

  const API_BASE_URL_2 = `/ext/ab/api/proxy/scan`;
  const title = props?.title?.value ?? 'Snap & Shop - Find Products by Image';

  useEffect(() => {
    if (showPopup || showUploadModal || showCartOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showPopup, showUploadModal, showCartOverlay]);

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

  const handleImageUpload = async file => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setSelectedImage(URL.createObjectURL(file));
      setLoading(true);
      setShowUploadModal(false); // Close the upload modal

      const formData = new FormData();
      formData.append('image', file);
      formData.append('company_id', company_id);

      const response = await fetch(
        `${API_BASE_URL_2}//search-by-image-using-store-front?application_id=${application_id}&company_id=${company_id}`,
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

  const generateImageFromPrompt = async function (prompt) {
    if (!prompt.trim()) {
      alert('Please enter a description for the image');
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch(
        `${API_BASE_URL_2}/generate-prompts-to-image?company_id=${company_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowImagePreviewModal(true);
        // await handleImageUploadEnhanced(data.imageUrl);
        setPromptText('');
        // setIsGenerating(false);
      } else {
        throw new Error(data.message || 'Image generation failed');
      }
    } catch (err) {
      console.error('Error generating/searching image:', err);
      alert('Failed to generate or search image. Please try again.');
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptGeneratedImage = async () => {
    if (!generatedImageUrl) return;
    console.log(generatedImageUrl, '1111111111');

    try {
      setLoading(true);
      setShowImagePreviewModal(false);
      await handleImageUploadEnhanced(generatedImageUrl);
    } catch (error) {
      console.error('Error processing generated image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateImage = () => {
    setShowImagePreviewModal(false);
    setShowUploadModal(true);
  };

  const handleImageUploadEnhanced = async imageUrl => {
    try {
      setLoading(true);
      setShowUploadModal(false);

      // Fetch the image
      const imageResponse = await fetch(imageUrl, {
        method: 'GET',
        headers: { Accept: 'image/*' },
        mode: 'cors', // Ensure CORS is handled
      });

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();

      // Ensure we have a valid MIME type
      let mimeType = imageBlob.type;
      if (!mimeType || !mimeType.startsWith('image/')) {
        mimeType = 'image/png'; // Safe default
      }

      console.log('Blob details:', {
        type: imageBlob.type,
        size: imageBlob.size,
        finalMimeType: mimeType,
      });

      // Create FormData with enhanced mobile compatibility
      const formData = new FormData();

      // Check browser capabilities
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isOldAndroid = /Android [1-4]\./.test(navigator.userAgent);

      if (isOldAndroid) {
        // For old Android versions, try alternative approach
        console.log('Detected old Android, using special handling');

        // Convert blob to array buffer then back to blob (sometimes fixes Android issues)
        const arrayBuffer = await imageBlob.arrayBuffer();
        const fixedBlob = new Blob([arrayBuffer], { type: mimeType });

        formData.append('image', fixedBlob, 'generated-image.png');
      } else if (isMobile) {
        // For modern mobile browsers
        try {
          const file = new File([imageBlob], 'generated-image.png', {
            type: mimeType,
            lastModified: Date.now(),
          });
          formData.append('image', file);
        } catch (fileError) {
          console.log('File constructor failed on mobile, using blob');
          formData.append('image', imageBlob, 'generated-image.png');
        }
      } else {
        // Desktop approach
        const file = new File([imageBlob], 'generated-image.png', {
          type: mimeType,
          lastModified: Date.now(),
        });
        formData.append('image', file);
      }

      formData.append('company_id', company_id);

      // Debug FormData contents
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Set preview image
      setSelectedImage(imageUrl);

      // Send request with mobile-optimized headers
      const uploadResponse = await fetch(
        `${API_BASE_URL_2}/search-by-image?application_id=${application_id}&company_id=${company_id}`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
          // Don't set Content-Type header - let browser set it with boundary
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();

      // Set the results from API response
      setProductFilterList(result.results || []);

      // Automatically open popup if products are found
      if (result.results && result.results.length > 0) {
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Enhanced upload failed:', error);
      setProductFilterList([]);
      alert(`Error processing image: ${error.message}`);
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

  // New function to handle add to cart
  const handleAddToCart = product => {
    setSelectedProduct(product);
    setShowCartOverlay(true);
  };

  // New function to submit cart
  const handleCartSubmit = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (!pincode || pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    // Here you would typically call an API to add to cart
    alert(`Added ${selectedProduct.name} (Size: ${selectedSize}) to cart for pincode ${pincode}`);
    setShowCartOverlay(false);
    setSelectedSize('');
    setPincode('');
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

  // Open upload modal
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  // Close upload modal
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setPromptText('');
    setIsGenerating(false);
  };

  // Handle file input change for upload
  const handleFileInputChange = e => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Font Awesome camera icon component
  const CameraIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      width={24}
      height={24}
    >
      <path d='M4 7h2.586A2 2 0 0 0 8.414 6l.172-.172A2 2 0 0 1 10 5h4a2 2 0 0 1 1.414.586l.172.172A2 2 0 0 0 17.414 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z' />
      <circle cx='12' cy='13' r='3' />
    </svg>
  );

  // Shopping cart icon component
  const CartIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      fill='currentColor'
      viewBox='0 0 16 16'
    >
      <path d='M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z' />
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
        {/* Combined Upload Section with background */}
        <div style={styles.customUploadContainer}>
          {/* Flex container that changes direction on mobile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            {/* Original functional button */}
            <button
              onClick={openUploadModal}
              style={{
                ...styles.mainUploadButton,
                margin: 0,
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid #7fd7f7',
                width: isMobile ? '100%' : 'auto',
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Analyzing Image...
                </>
              ) : (
                <>
                  <CameraIcon />
                  Upload Product Image
                </>
              )}
            </button>

            {/* Text section - will appear below button on mobile */}
            <div style={{ color: '#fff', marginTop: isMobile ? '6px' : 0 }}>
              <span style={styles.quickText}>iSnapToShop</span> – Upload or generate images to find
              your perfect product match.
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Generate Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Upload or Generate Product Image</h2>
              <button style={styles.modalCloseButton} onClick={closeUploadModal}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <label style={styles.modalSectionLabel}>Upload Image</label>
                <input
                  type='file'
                  onChange={handleFileInputChange}
                  accept='image/*'
                  style={styles.fileInput}
                />
              </div>

              <div style={styles.modalDivider}>
                <span style={styles.modalDividerText}>OR</span>
              </div>

              <div style={styles.modalSection}>
                <label style={styles.modalSectionLabel}>Generate Image via Prompt</label>
                <input
                  type='text'
                  style={styles.promptInput}
                  placeholder='Describe your product (e.g., "White jordan sneakers")'
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  disabled={isGenerating}
                />
                <button
                  onClick={() => generateImageFromPrompt(promptText)}
                  style={{
                    ...styles.generateButton,
                    ...(isGenerating || !promptText ? styles.generateButtonDisabled : {}),
                  }}
                  disabled={isGenerating || !promptText}
                >
                  {isGenerating ? (
                    <div style={styles.generatingContent}>
                      <span style={styles.spinner}></span>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Generate & Use Image'
                  )}
                </button>
                {/* Generated Image Preview Modal */}
                {showImagePreviewModal && generatedImageUrl && (
                  <div style={styles.modalOverlay}>
                    <div
                      style={{
                        ...styles.modalContent,
                        maxWidth: '90%', // Changed from 600px to percentage for better responsiveness
                        maxHeight: '90vh', // Added maxHeight with viewport units
                        overflowY: 'auto', // Added scroll if content is too tall
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={styles.modalHeader}>
                        <h2 style={styles.modalTitle}>Preview Generated Image</h2>
                        <button
                          style={styles.modalCloseButton}
                          onClick={() => setShowImagePreviewModal(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div
                        style={{
                          ...styles.modalBody,
                          textAlign: 'center',
                          flex: 1, // Takes remaining space
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between', // Distributes space evenly
                        }}
                      >
                        <div style={{ marginBottom: '20px', flex: 1 }}>
                          <img
                            src={generatedImageUrl}
                            alt='Generated from prompt'
                            style={{
                              maxWidth: '100%',
                              maxHeight: '60vh', // Limit image height
                              borderRadius: '8px',
                              objectFit: 'contain', // Ensures image maintains aspect ratio
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '15px',
                            padding: '20px 0',
                            flexWrap: 'wrap', // Allows buttons to wrap on small screens
                          }}
                        >
                          <button
                            onClick={handleRegenerateImage}
                            style={{
                              ...styles.generateButton,
                              backgroundColor: '#f0f0f0',
                              color: '#333',
                              border: '1px solid #ccc',
                              minWidth: '150px', // Ensures consistent button width
                              margin: '5px',
                            }}
                          >
                            Regenerate
                          </button>
                          <button
                            onClick={handleAcceptGeneratedImage}
                            style={{
                              ...styles.generateButton,
                              backgroundColor: '#4CAF50',
                              minWidth: '150px', // Ensures consistent button width
                              margin: '5px',
                            }}
                          >
                            Use This Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product List Popup - Now includes selected image and loading state */}
      {(showPopup || loading) && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div style={styles.popupContent} onClick={e => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <h2 style={styles.popupTitle}>
                {productFilterList.length > 0
                  ? `Search Results (${productFilterList.length} products)`
                  : 'Searching for products'}
              </h2>
              <button style={styles.closeButton} onClick={closePopup}>
                ×
              </button>
            </div>

            <div style={styles.popupBody}>
              {/* Show selected image in a dedicated section */}
              {selectedImage && (
                <div style={styles.popupImageSection}>
                  <div style={styles.popupImageTitle}>Your Uploaded Image</div>
                  <div style={styles.selectedImageWrapper}>
                    <img
                      src={selectedImage}
                      alt='Uploaded for search'
                      style={styles.popupSelectedImage}
                    />
                    {loading && <AIProcessingOverlay />}
                  </div>
                </div>
              )}

              {loading ? (
                <p style={styles.loadingText}>Finding perfect matches for you...</p>
              ) : (
                <>
                  {productFilterList.length > 0 && (
                    <div style={styles.resultsSection}>
                      <div style={styles.resultsTitle}>Matching Products</div>
                      {isMobile ? (
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

                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    marginTop: '10px',
                                    flexWrap: 'nowrap',
                                    alignItems: 'center', // optional: to center buttons horizontally
                                  }}
                                >
                                  <button
                                    style={{
                                      padding: '6px 14px',
                                      fontSize: '13px',
                                      borderRadius: '4px',
                                      border: 'none',
                                      backgroundColor: '#007BFF',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      width: '130px',
                                    }}
                                    onClick={() => handleViewDetails(product)}
                                  >
                                    View Details
                                  </button>

                                  <button
                                    style={{
                                      padding: '6px 14px',
                                      fontSize: '13px',
                                      borderRadius: '4px',
                                      border: 'none',
                                      backgroundColor: '#4CAF50',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                      width: '130px',
                                    }}
                                    onClick={() => handleAddToCart(product)}
                                  >
                                    <CartIcon /> Add to Cart
                                  </button>
                                </div>
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
                                <p style={styles.cardCategory}>
                                  {formatCategoryName(product.category)}
                                </p>
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

                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'nowrap',
                                  gap: '8px',
                                  marginTop: '4px',
                                  marginLeft: '20px',
                                  marginBottom: '10px',
                                }}
                              >
                                <button
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#007BFF',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => handleViewDetails(product)}
                                >
                                  View Details
                                </button>

                                <button
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#4CAF50',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <CartIcon style={{ fontSize: '14px' }} /> Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {productFilterList.length === 0 && !loading && (
                    <p style={styles.noProductsText}>No matching products found.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Overlay */}
      {showCartOverlay && selectedProduct && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalContent,
              maxWidth: isMobile ? '90%' : '500px',
              padding: '20px',
            }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add to Cart</h2>
              <button
                style={styles.modalCloseButton}
                onClick={() => {
                  setShowCartOverlay(false);
                  setSelectedSize('');
                  setPincode('');
                }}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>{selectedProduct.name}</h3>
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Select Size
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedProduct.sizes.map((size, index) => (
                        <button
                          key={index}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${selectedSize === size.size ? '#4CAF50' : '#ddd'}`,
                            backgroundColor: selectedSize === size.size ? '#e8f5e9' : '#fff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            minWidth: '50px',
                            textAlign: 'center',
                          }}
                          onClick={() => setSelectedSize(size.size)}
                        >
                          {size.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Enter Pincode
                  </label>
                  <input
                    type='text'
                    value={pincode}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setPincode(value);
                      }
                    }}
                    placeholder='6-digit pincode'
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                    }}
                  />
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onClick={handleCartSubmit}
                >
                  <CartIcon /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    {
      id: 'company_id',
      label: 'Company ID',
      type: 'text',
      default: '',
      info: 'Company ID',
      require: true,
    },
    {
      id: 'application_id',
      label: 'Application ID',
      type: 'text',
      default: '',
      info: 'Application ID',
      require: true,
    },
  ],
  blocks: [],
};
