// components/ImagesMode/ImprovedImagesMode.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import styled from 'styled-components';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';
import apiConfig from '../../../config/apiConfig';
import useTranslation from '../../../config/useTranslation';
import theme from '../../../config/theme';
import ErrorBoundary from '../../SharedUI/ErrorBoundary';
import ErrorMessage from '../../SharedUI/ErrorMessage';
import { showToast } from '../../SharedUI/ToastNotification';
import '../../../fire-theme.css';
import { 
  ApiError, 
  NetworkError, 
  ResourceError,
  fetchWithErrorHandling
} from '../../../utils/errors';
import {
  fetchAndCacheImage,
  clearOldImages
} from './improvedIndexedDBUtils';

// Styled Components
const ImagesModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: ${props => props.isFullScreen ? '#000' : 'transparent'};
  overflow: hidden;
  /* Remove padding since we're using positioning */
  position: relative;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
  /* Add bottom margin to create space for the timer panel */
  margin-bottom: 180px;
  height: calc(100vh - 180px);
`;

const DisplayImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 10;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ControlButtonsContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 500;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.isFullScreen ? 0 : 1};
  
  &:hover {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  display: block;
  padding: 10px;
  background-color: ${theme.colors.accentPrimary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-bottom: ${props => props.marginBottom ? '10px' : '0'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.accentSecondary};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TimerSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
`;

const FallbackMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
`;

// Custom hook for API calls with retries
const useRetryableAPI = (maxRetries = 3, initialBackoff = 1000) => {
  const makeRequest = useCallback(async (fetchFn, options = {}) => {
    const { retries = maxRetries, backoff = initialBackoff, silent = false } = options;
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry if client error (4xx) except for 429 (too many requests)
        if (error instanceof ApiError && 
            error.status >= 400 && error.status < 500 && 
            error.status !== 429) {
          break;
        }
        
        // Stop if no more retries
        if (attempt >= retries) {
          break;
        }
        
        // Calculate backoff time with exponential increase
        const delay = backoff * Math.pow(2, attempt);
        
        // Show retry toast if not silent
        if (!silent) {
          showToast({
            title: 'Connection error',
            message: `Retrying in ${Math.round(delay / 1000)} seconds... (${attempt + 1}/${retries})`,
            type: 'warning',
            duration: delay - 500 // Show until just before retry
          });
        }
        
        // Wait for backoff period
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Failed after all retries
    throw lastError;
  }, [maxRetries, initialBackoff]);

  return { makeRequest };
};

function ImprovedImagesMode() {
  const BUFFER_SIZE = 100;
  const [images, setImages] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const { t } = useTranslation();
  const { makeRequest } = useRetryableAPI();

  // Initialize timer control with image-specific configuration
  const {
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,
    isControlWindow,
    isFullScreen,
    fullScreenHandle,
    getNextItem,
    handleIntervalChange,
    handleRoundDurationChange,
    handleResetRound: baseHandleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  } = useTimerControl({
    defaultInterval: 35,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: images.length,
    onNextItem: () => {
      if (currentIndex >= images.length - BUFFER_SIZE / 2 && nextPage) {
        fetchImages(nextPage);
      }
    },
  });

  const fetchImages = useCallback(async (url, reset = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use retry wrapper
      const data = await makeRequest(async () => {
        return await fetchWithErrorHandling(url);
      });
      
      // Process successful response
      setImages(prevImages => {
        const newImages = reset ? data.results : [...prevImages, ...data.results];
        return newImages.slice(Math.max(newImages.length - BUFFER_SIZE, 0));
      });
      setNextPage(data.next);
      
      // Show success toast for reset operations
      if (reset) {
        showToast({
          title: t('imagesLoaded'),
          message: `${data.results.length} ${t('imagesLoaded')}`,
          type: 'success',
          duration: 3000
        });
      }
      
    } catch (error) {
      // Handle error appropriately
      console.error('Error fetching images:', error);
      setError(error);
      
      // Show appropriate error toast
      if (error instanceof NetworkError) {
        showToast({
          title: t('connectionError'),
          message: error.getUserMessage(),
          type: 'error'
        });
      } else if (error instanceof ApiError) {
        showToast({
          title: t('apiError'),
          message: error.getUserMessage(),
          type: 'error'
        });
      } else {
        showToast({
          title: t('errorOccurred'),
          message: error.message,
          type: 'error'
        });
      }
      
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, t]);

  // fetchManyImages function removed - now handled in Settings component

  // Custom reset handler that combines timer reset with image reset
  const handleResetRound = useCallback(() => {
    setImages([]);
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
    baseHandleResetRound();
  }, [fetchImages, baseHandleResetRound]);

  // Initial image fetch
  useEffect(() => {
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
    
    // Cleanup old images as maintenance task
    clearOldImages(7).then(count => {
      if (count > 0) {
        console.log(`Cleaned up ${count} old cached images`);
      }
    });
  }, [fetchImages]);

  // Image display logic with error handling
  const displayImage = useCallback(async (imageUrl) => {
    try {
      // Check if image exists
      if (!imageUrl) {
        throw new ResourceError('Image URL is missing', {
          resourceType: 'image'
        });
      }
      
      // Try to get from cache or fetch + cache
      return await fetchAndCacheImage(imageUrl);
    } catch (error) {
      console.error('Error retrieving image:', error);
      
      // For UI errors, show a toast
      showToast({
        title: t('imageLoadError'),
        message: error.getUserMessage ? error.getUserMessage() : error.message,
        type: 'error',
        duration: 5000
      });
      
      // Return a placeholder or the original URL as fallback
      return imageUrl;
    }
  }, [t]);

  // Update displayed image when index changes
  useEffect(() => {
    if (images.length > 0 && currentIndex < images.length) {
      setIsLoading(true);
      
      displayImage(images[currentIndex].image_file)
        .then(blob => {
          if (imgRef.current) {
            // If it's a blob, create an object URL
            if (blob instanceof Blob) {
              imgRef.current.src = URL.createObjectURL(blob);
              
              // Clean up object URL on unmount
              return () => URL.revokeObjectURL(imgRef.current.src);
            } else {
              // It's a URL string
              imgRef.current.src = blob;
            }
          }
        })
        .catch(error => {
          console.error('Failed to display image:', error);
          // Show fallback/error image
          if (imgRef.current) {
            imgRef.current.src = '/images/error-placeholder.png';
          }
        })
        .finally(() => {
          setIsLoading(false);
          
          // Add logging to check image position
          setTimeout(() => {
            const imageContainer = document.querySelector('div[data-testid="image-container"]');
            const imageElement = imgRef.current;
            const timerPanel = document.querySelector('.timer-panel');
            
            console.log("=== IMAGE POSITION LOGGING ===");
            console.log("Window height:", window.innerHeight);
            
            if (imageContainer) {
              const imageContainerRect = imageContainer.getBoundingClientRect();
              console.log("Image container bottom border:", imageContainerRect.bottom);
            } else {
              console.log("Image container not found");
            }
            
            if (imageElement) {
              const imageRect = imageElement.getBoundingClientRect();
              console.log("Image bottom border:", imageRect.bottom);
            } else {
              console.log("Image element not found");
            }
            
            if (timerPanel) {
              const timerRect = timerPanel.getBoundingClientRect();
              console.log("Timer panel top border:", timerRect.top);
              
              if (imageElement) {
                const imageRect = imageElement.getBoundingClientRect();
                console.log("Gap between image and timer:", timerRect.top - imageRect.bottom);
              }
            } else {
              console.log("Timer panel not found");
            }
          }, 2000);
        });
    }
  }, [currentIndex, images, displayImage]);

  // Handle image load errors
  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    showToast({
      title: t('imageLoadError'),
      message: t('couldNotLoadImage'),
      type: 'error'
    });
    
    // Set placeholder
    if (e.target) {
      e.target.src = '/images/error-placeholder.png';
    }
  };

  // Render control buttons for fullscreen and control panel
  const renderControlButtons = () => (
    <ControlButtonsContainer isFullScreen={isFullScreen}
      onMouseEnter={(e) => isFullScreen && (e.style.opacity = '1')}
      onMouseLeave={(e) => isFullScreen && (e.style.opacity = '0')}
    >
      <ControlButton
        onClick={openControlWindow}
        marginBottom
      >
        {t('openControlPanel')}
      </ControlButton>
      <ControlButton
        onClick={toggleFullScreen}
      >
        {isFullScreen ? t('exitFullScreen') : t('enterFullScreen')}
      </ControlButton>
    </ControlButtonsContainer>
  );

  // Create error display component
  const ImageFetchError = () => (
    <ErrorMessage
      title={t('imageLoadError')}
      subtitle={error instanceof ApiError ? error.getUserMessage() : t('checkConnection')}
      severity="error"
      allowRetry={true}
      onRetry={() => fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true)}
    />
  );

  // Main fallback for error boundary
  const errorBoundaryFallback = ({ error, onRetry }) => (
    <FallbackMessage>
      <h3>{t('componentError')}</h3>
      <p>{error?.message || t('unknownError')}</p>
      <button onClick={onRetry}>{t('tryAgain')}</button>
    </FallbackMessage>
  );

  return (
    <ErrorBoundary fallback={errorBoundaryFallback}>
      <FullScreen handle={fullScreenHandle}>
        <ImagesModeContainer isFullScreen={isFullScreen}>
          {!isControlWindow && (
            <>
              <ImageContainer data-testid="image-container">
                {error && <ImageFetchError />}
                
                {images.length > 0 ? (
                  <DisplayImage
                    ref={imgRef}
                    alt="Display"
                    onError={handleImageError}
                  />
                ) : !error && (
                  <FallbackMessage>{t('noImagesLoaded')}</FallbackMessage>
                )}
                
                {isLoading && (
                  <LoadingOverlay>
                    <Spinner />
                    <div>{t('loadingImages')}</div>
                  </LoadingOverlay>
                )}
              </ImageContainer>
              {renderControlButtons()}
            </>
          )}
          <TimerSection>
            <TimerControls
              timer={timer}
              roundTimer={roundTimer}
              changeInterval={changeInterval}
              roundDuration={roundDuration}
              isActive={isActive}
              handleRoundDurationChange={handleRoundDurationChange}
              getNextItem={getNextItem}
              handleIntervalChange={handleIntervalChange}
              toggleActive={toggleActive}
              handleResetRound={handleResetRound}
              isControlWindow={isControlWindow}
              isFullScreen={isFullScreen}
            />
          </TimerSection>
        </ImagesModeContainer>
      </FullScreen>
    </ErrorBoundary>
  );
}

export default ImprovedImagesMode;