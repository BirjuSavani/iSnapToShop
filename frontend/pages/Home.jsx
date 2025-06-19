import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { useParams } from 'react-router-dom';
import './style/home.css';
import NotFound from './NotFound';

// Import refactored components and helpers
import { AnalyticsTab } from './components/AnalyticsTab';
import { SearchTab } from './components/SearchTab';
import { ImageGenerationModal, ActivationPopup, WelcomePopup } from './components/Modals';
import { NavButton } from './components/NavButton'; // Import the new NavButton
import {
  fetchAnalyticsData,
  handleImageUpload,
  generateImageFromPrompt,
  toggleActiveStatus,
  updateStatusOnServer,
} from './components/helpers';
import { AnalyticsIcon, SearchIcon } from './components/Icons';
Chart.register(...registerables);

const GET_STATUS_API_URL =
  'https://asia-south1.workflow.boltic.app/5e71a083-579e-4d69-b997-6e9789cc294c';

// --- HELPER FUNCTION TO REMOVE STATE DUPLICATION ---
const setReadyState = (setState, isActive = true) => {
  setState(prev => ({
    ...prev,
    isActive,
    isInitializing: false,
    apiStatusLoading: false,
    firstTimeVisit: false,
    statusMessage: 'Ready to search products!',
  }));
};

export const Home = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showPopup, setShowPopup] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    totalSearches: 0,
    successfulMatches: 0,
    matchRate: 0,
    searchTrends: [],
    deviceBreakdown: [
      { device: 'Mobile', percentage: 68 },
      { device: 'Desktop', percentage: 25 },
      { device: 'Tablet', percentage: 7 },
    ],
  });

  const [searchTrendsChart, setSearchTrendsChart] = useState({ datasets: [] });

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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fileInputRef = useRef(null);
  const { application_id, company_id } = useParams();

  const memoizedFetchAnalytics = useCallback(() => {
    fetchAnalyticsData(
      application_id,
      company_id,
      startDate,
      endDate,
      setAnalyticsData,
      setSearchTrendsChart
    );
  }, [application_id, company_id, startDate, endDate]);

  const memoizedGenerateImage = useCallback(() => {
    generateImageFromPrompt(
      promptText,
      company_id,
      application_id,
      setState,
      setIsGenerating,
      setPromptText,
      setShowImageModal
    );
  }, [promptText, company_id, application_id]);

  const memoizedHandleUpload = useCallback(
    e => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file, company_id, application_id, setState);
        setShowImageModal(false);
      }
    },
    [company_id, application_id]
  );

  useEffect(() => {
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 6);
    const formatDate = date => date.toISOString().split('T')[0];
    setStartDate(formatDate(priorDate));
    setEndDate(formatDate(today));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      memoizedFetchAnalytics();
    }
  }, [startDate, endDate, memoizedFetchAnalytics]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      memoizedFetchAnalytics();
    }
  }, [activeTab, memoizedFetchAnalytics]);

  useEffect(() => {
    if (activeTab !== 'search') {
      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: [],
        previewImage: null,
        error: null,
        uploadProgress: 0,
      }));
      setPromptText('');
    }
  }, [activeTab]);

  useEffect(() => {
    if (state.isInitializing && !state.isActive) setShowActivationPopup(true);
    else setShowActivationPopup(false);
  }, [state.isInitializing, state.isActive]);

  useEffect(() => {
    if (!state.apiStatusLoading && !state.isActive && state.firstTimeVisit) setShowPopup(true);
    else setShowPopup(false);
  }, [state.apiStatusLoading, state.isActive, state.firstTimeVisit]);

  useEffect(() => {
    if (!application_id) return;

    let isMounted = true;
    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get(`${GET_STATUS_API_URL}?_id=${application_id}`);
        if (isMounted && response.data?.status === 'success') {
          const record = response.data.data.result.data.find(item => item._id === application_id);
          if (record && record.active === 'true') {
            // USE THE HELPER
            setReadyState(setState, true);
          } else {
            await toggleActiveStatus(false, true, application_id, company_id, setState);
            await updateStatusOnServer(application_id, true);
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
      // USE THE HELPER for the already-active case
      setReadyState(setState, true);
    }

    return () => {
      isMounted = false;
    };
  }, [application_id, company_id, state.isActive]);

  if (!application_id) {
    return <NotFound />;
  }

  return (
    <div className='dashboard-container'>
      <ImageGenerationModal
        show={showImageModal}
        onClose={() => setShowImageModal(false)}
        fileInputRef={fileInputRef}
        onFileSelect={memoizedHandleUpload}
        promptText={promptText}
        setPromptText={setPromptText}
        onGenerate={memoizedGenerateImage}
        isGenerating={isGenerating}
      />
      <ActivationPopup show={showActivationPopup} statusMessage={state.statusMessage} />
      <WelcomePopup
        show={showPopup}
        onClose={() => {
          setShowPopup(false);
          setState(prev => ({ ...prev, firstTimeVisit: false }));
        }}
      />

      <header className='dashboard-header'>
        <div className='header-title'>
          <h1>iSnapToShop</h1>
          <p>Visual Shopping Assistant Dashboard</p>
        </div>
        <nav className='dashboard-nav'>
          {/* USE THE NEW NavButton COMPONENT TO REMOVE JSX DUPLICATION */}
          <NavButton
            onClick={() => setActiveTab('analytics')}
            isActive={activeTab === 'analytics'}
            label='Analytics'
          >
            <AnalyticsIcon />
          </NavButton>

          <NavButton
            onClick={() => setActiveTab('search')}
            isActive={activeTab === 'search'}
            label='Product Search'
          >
            <SearchIcon />
          </NavButton>
        </nav>
      </header>

      <main className='dashboard-content'>
        {activeTab === 'search' ? (
          <SearchTab state={state} setShowImageModal={setShowImageModal} />
        ) : (
          <AnalyticsTab
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            analyticsData={analyticsData}
            searchTrendsChart={searchTrendsChart}
          />
        )}
      </main>
    </div>
  );
};
