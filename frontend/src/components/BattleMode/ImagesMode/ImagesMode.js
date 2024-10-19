// ImagesMode.js

import React, { useState, useEffect, useCallback } from 'react';
import apiConfig from '../../../config/apiConfig';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';
import {FullScreen, useFullScreenHandle } from 'react-full-screen';
import ImagePreloader from './ImagePreloader';
import { getImage } from './indexedDBUtils';

function ImagesMode() {
  const BUFFER_SIZE = 100;  // Max number of images to keep in memory
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [changeInterval, setChangeInterval] = useState(15);
  const [roundDuration, setRoundDuration] = useState(90);
  const [isActive, setIsActive] = useState(true);
  const [timer, resetImageTimer] = useWordTimer(changeInterval, isActive);
  const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => setIsActive(false));
  const [nextPage, setNextPage] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const fullScreenHandle = useFullScreenHandle();

  const fetchImages = useCallback((url, reset = false) => {
    console.log("Fetching images...");
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched data:", data);
        setImages(prevImages => {
          const newImages = reset ? data.results : [...prevImages, ...data.results];
          // Keep only the latest BUFFER_SIZE images
          return newImages.slice(Math.max(newImages.length - BUFFER_SIZE, 0));
        });
        setNextPage(data.next);
        setImagesPreloaded(false);
      })
      .catch(error => console.error('Error fetching images:', error));
  }, []);

  const fetchManyImages = useCallback(async () => {
    let allImages = [];
    let url = `${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=100`;
    
    for (let i = 0; i < 20; i++) {  // Fetch 20 pages of 100 images each
      try {
        const response = await fetch(url);
        const data = await response.json();
        allImages = [...allImages, ...data.results];
        url = data.next;
        if (!url) break;  // Stop if there are no more pages
      } catch (error) {
        console.error('Error fetching many images:', error);
        break;
      }
    }

    return allImages;
  }, []);

  const getNextImage = useCallback(() => {
    setCurrentImageIndex(prevIndex => {
      let newIndex = prevIndex + 1;
      if (newIndex >= images.length) {
        if (nextPage) {
          fetchImages(nextPage);
        }
        newIndex = 0;  // Loop back to the first image if at the end
      }
      return newIndex;
    });
  }, [images.length, nextPage, fetchImages]);

  useEffect(() => {
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
  }, [fetchImages]);

  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextImage();
      resetImageTimer();
    }
  }, [timer, isActive, getNextImage, resetImageTimer]);

  const handleIntervalChange = useCallback((value) => {
    setChangeInterval(value);
    resetImageTimer();
  }, [resetImageTimer]);

  const handleRoundDurationChange = useCallback((value) => {
    setRoundDuration(value === 300 ? Infinity : value);
    resetRoundTimer(value === 300 ? Infinity : value);
  }, [resetRoundTimer]);

  const handleResetRound = () => {
    setImages([]);
    setCurrentImageIndex(0);
    fetchImages(`${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=${BUFFER_SIZE}`, true);
    resetRoundTimer(roundDuration);
    resetImageTimer();
    setIsActive(true);
    getNextImage();
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      fullScreenHandle.exit();
    } else {
      fullScreenHandle.enter();
    }
    setIsFullScreen(!isFullScreen);
  };

  const displayImage = useCallback(async (imageUrl) => {
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
    if (images.length > 0 && currentImageIndex < images.length) {
      displayImage(images[currentImageIndex].image_file).then(src => {
        const imgElement = document.getElementById('currentImage');
        if (imgElement) {
          imgElement.src = src;
        }
      });
    }
  }, [currentImageIndex, images, displayImage]);

  return (
    <FullScreen handle={fullScreenHandle}>
      <div className={`images-mode ${isFullScreen ? 'fullscreen' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: isFullScreen ? '100vh' : '80vh', position: 'relative' }}>
          {images.length > 0 ? (
            <img
              id="currentImage"
              alt="Display"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <p>No images loaded</p>
          )}
          <button
            onClick={toggleFullScreen}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
              zIndex: 1000
            }}
          >
            {isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          </button>
          <ImagePreloader
            images={images}
            onProgress={(progress) => {
              console.log(`Preload progress: ${progress * 100}%`);
              if (progress === 1) setImagesPreloaded(true);
            }}
            fetchManyImages={fetchManyImages}
          />
        </div>
        <div
          className="control-panel"
          style={{
            width: '100%',
            overflowY: 'auto',
            padding: '10px',
            boxSizing: 'border-box',
            maxHeight: isFullScreen ? 'auto' : '20vh',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            position: isFullScreen ? 'fixed' : 'static',
            bottom: 0,
            left: 0,
            transition: 'opacity 0.3s ease-in-out',
            opacity: isFullScreen ? 0 : 1
          }}
          onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
        >
          <div className="timer">Image Timer: {timer} seconds</div>
          <div>Interval: {changeInterval} seconds</div>
          <div>Round Duration: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
          <input
            type="range"
            min="10"
            max="300"
            value={roundDuration === Infinity ? 300 : roundDuration}
            onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <button onClick={getNextImage}>Next Image</button>
            <button onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}>Decrease Interval</button>
            <button onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}>Increase Interval</button>
            <button onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Resume'}</button>
            <button onClick={handleResetRound}>Reset Round</button>
          </div>
        </div>
      </div>
    </FullScreen>
  );
}


export default ImagesMode;