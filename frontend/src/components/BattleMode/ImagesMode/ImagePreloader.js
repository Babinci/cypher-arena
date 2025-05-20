import React, { useState, useCallback, useRef, useEffect } from 'react';
import { storeImage } from './indexedDBUtils';
const ImagePreloader = ({ images, onProgress, fetchManyImages }) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  // isPreloaded tracks when images are fully loaded
  const [, setIsPreloaded] = useState(false);
  const containerRef = useRef(null);

  const preloadImages = useCallback(async (imageSet) => {
    setIsPreloading(true);
    setProgress(0);
    setIsPreloaded(false);  // Reset preloaded state when starting

    for (let i = 0; i < imageSet.length; i++) {
      const image = imageSet[i];
      try {
        const response = await fetch(image.image_file);
        const blob = await response.blob();
        await storeImage(image.image_file, blob);
       
        setProgress((i + 1) / imageSet.length);
        onProgress((i + 1) / imageSet.length);
      } catch (error) {
        console.error('Error caching image:', error);
      }
    }

    setIsPreloading(false);
    setIsPreloaded(true);
  }, [onProgress]);
  
    const handlePreloadCurrent = useCallback(() => {
      preloadImages(images);
    }, [images, preloadImages]);
  
    const handlePreload2000 = useCallback(async () => {
      const manyImages = await fetchManyImages();
      preloadImages(manyImages);
    }, [fetchManyImages, preloadImages]);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 5,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? (
        <div style={{ color: 'white', fontSize: '16px' }}>⚡ Preload</div>
      ) : (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreloadCurrent();
            }}
            disabled={isPreloading}
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '5px 10px',
              marginBottom: '5px',
            }}
          >
            {isPreloading ? 'Preloading...' : 'Preload Current'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreload2000();
            }}
            disabled={isPreloading}
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '5px 10px',
            }}
          >
            {isPreloading ? 'Preloading 2000...' : 'Preload 2000'}
          </button>
          {isPreloading && (
            <div style={{ color: 'white', marginTop: 5, fontSize: '12px' }}>
              {`${Math.round(progress * 100)}%`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImagePreloader;