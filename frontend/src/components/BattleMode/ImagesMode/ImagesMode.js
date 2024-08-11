import React, { useState, useEffect, useCallback } from 'react';
import apiConfig from '../../../config/apiConfig';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';

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
      })
      .catch(error => console.error('Error fetching images:', error));
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

  return (
    <div className="images-mode" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxHeight: '80vh' }}>
        {images.length > 0 ? (
          <img src={images[currentImageIndex]?.image_file} alt="Display" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <p>No images loaded</p>
        )}
      </div>
      <div className="control-panel" style={{ width: '100%', overflowY: 'auto', padding: '10px', boxSizing: 'border-box', maxHeight: '20vh' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={getNextImage}>Next Image</button>
          <button onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}>Decrease Interval</button>
          <button onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}>Increase Interval</button>
          <button onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Resume'}</button>
          <button onClick={handleResetRound}>Reset Round</button>
        </div>
      </div>
    </div>
  );
}

export default ImagesMode;