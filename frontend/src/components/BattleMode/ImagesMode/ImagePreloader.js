import React, { useState, useCallback } from 'react';

const ImagePreloader = ({ images, onProgress }) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preloadImages = useCallback(async () => {
    setIsPreloading(true);
    setProgress(0);

    const promises = images.map((image, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = image.image_file;
        img.onload = () => {
          setProgress((prevProgress) => {
            const newProgress = (index + 1) / images.length;
            onProgress(newProgress);
            return newProgress;
          });
          resolve();
        };
        img.onerror = reject;
      });
    });

    try {
      await Promise.all(promises);
      setIsPreloading(false);
    } catch (error) {
      console.error('Error preloading images:', error);
      setIsPreloading(false);
    }
  }, [images, onProgress]);

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 10,
      borderRadius: 5,
    }}>
      <button
        onClick={preloadImages}
        disabled={isPreloading}
      >
        {isPreloading ? 'Preloading...' : 'Preload Images'}
      </button>
      {isPreloading && (
        <div style={{ color: 'white', marginTop: 5 }}>
          {`Progress: ${Math.round(progress * 100)}%`}
        </div>
      )}
    </div>
  );
};

export default ImagePreloader;