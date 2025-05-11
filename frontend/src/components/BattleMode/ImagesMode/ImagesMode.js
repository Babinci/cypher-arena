// components/ImagesMode/ImagesMode.js
import React, { useState, useEffect, useCallback } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';
import apiConfig from '../../../config/apiConfig';
import useTranslation from '../../../config/useTranslation';
import ImagePreloader from './ImagePreloader';
import { getImage } from './indexedDBUtils';

function ImagesMode() {
  const BUFFER_SIZE = 100;
  const [images, setImages] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const { t } = useTranslation();

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
    defaultInterval: 15,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: images.length,
    onNextItem: () => {
      if (currentIndex >= images.length - BUFFER_SIZE / 2 && nextPage) {
        fetchImages(nextPage);
      }
    },
  });

  const fetchImages = useCallback((url, reset = false) => {
    console.log(`Fetching images from: ${url}`);
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(`Fetched images:`, data.results);
        setImages(prevImages => {
          const newImages = reset ? data.results : [...prevImages, ...data.results];
          console.log(`New images array:`, newImages);
          return newImages.slice(Math.max(newImages.length - BUFFER_SIZE, 0));
        });
        setNextPage(data.next);
        console.log(`Next page URL: ${data.next}`);
        setImagesPreloaded(false);
      })
      .catch(error => console.error('Error fetching images:', error));
  }, []);

  const fetchManyImages = useCallback(async () => {
    let allImages = [];
    let url = `${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=100`;
    
    for (let i = 0; i < 20; i++) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        allImages = [...allImages, ...data.results];
        url = data.next;
        if (!url) break;
      } catch (error) {
        console.error('Error fetching many images:', error);
        break;
      }
    }
    return allImages;
  }, []);

  // Custom reset handler that combines timer reset with image reset
  const handleResetRound = useCallback(() => {
    setImages([]);
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
    baseHandleResetRound();
  }, [fetchImages, baseHandleResetRound]);

  // Initial image fetch
  useEffect(() => {
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
  }, [fetchImages]);

  // Image display logic
  const displayImage = useCallback(async (imageUrl) => {
    console.log(`Displaying image: ${imageUrl}`);
    try {
      const cachedImage = await getImage(imageUrl);
      if (cachedImage) {
        return URL.createObjectURL(cachedImage);
      }
    } catch (error) {
      console.error('Error retrieving cached image:', error);
    }
    return imageUrl;
  }, []);

  useEffect(() => {
    if (images.length > 0 && currentIndex < images.length) {
      console.log(`Current index: ${currentIndex}, Total images: ${images.length}`);
      displayImage(images[currentIndex].image_file).then(src => {
        const imgElement = document.getElementById('currentImage');
        if (imgElement) {
          imgElement.src = src;
        }
      });
    }
  }, [currentIndex, images, displayImage]);

  // Render control buttons for fullscreen and control panel
  const renderControlButtons = () => (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isFullScreen ? 0 : 1,
      }}
      onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
    >
      <button
        onClick={openControlWindow}
        style={{
          marginBottom: '10px',
          display: 'block',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {t('openControlPanel')}
      </button>
      <button
        onClick={toggleFullScreen}
        style={{
          display: 'block',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {isFullScreen ? t('exitFullScreen') : t('enterFullScreen')}
      </button>
    </div>
  );

  return (
    <FullScreen handle={fullScreenHandle}>
      <div
        className={`images-mode ${isFullScreen ? 'fullscreen' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          backgroundColor: isFullScreen ? '#000' : 'transparent',
          overflow: 'hidden'
        }}
      >
        {!isControlWindow && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              flex: 1,
              minHeight: 0,
              position: 'relative',
              marginBottom: -10
            }}>
              {images.length > 0 ? (
                <img
                  id="currentImage"
                  alt="Display"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              ) : (
                <p>No images loaded</p>
              )}
              <ImagePreloader
                images={images}
                onProgress={(progress) => {
                  if (progress === 1) setImagesPreloaded(true);
                }}
                fetchManyImages={fetchManyImages}
              />
            </div>
            {renderControlButtons()}
          </>
        )}
        <div style={{ 
          flexShrink: 0,
          marginTop: -10 
        }}> 
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
            style={{
              padding: isFullScreen ? '10px' : 0
            }}
          />
        </div>
      </div>
    </FullScreen>
  );
}

export default ImagesMode;