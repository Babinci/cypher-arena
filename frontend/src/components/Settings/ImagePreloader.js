import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { storeImage } from '../BattleMode/ImagesMode/indexedDBUtils';
import { clearOldImages } from '../BattleMode/ImagesMode/improvedIndexedDBUtils';
import theme from '../../config/theme';
import useTranslation from '../../config/useTranslation';

const PreloaderContainer = styled.div`
  margin-top: 15px;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const PreloaderButton = styled.button`
  background-color: ${theme.colors.accentPrimary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.accentSecondary};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: #333;
  border-radius: 4px;
  height: 10px;
  margin-top: 10px;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background-color: ${theme.colors.accentPrimary};
  width: ${props => `${props.progress}%`};
  transition: width 0.3s ease;
`;

export const ImagePreloader = ({ 
  onPreloadingChange, 
  onProgressChange, 
  fetchManyImages,
  onComplete 
}) => {
  const { t } = useTranslation();
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preloadImages = useCallback(async (imageSet) => {
    setIsPreloading(true);
    setProgress(0);
    onPreloadingChange(true);
    onProgressChange(0);

    for (let i = 0; i < imageSet.length; i++) {
      const image = imageSet[i];
      try {
        const response = await fetch(image.image_file);
        const blob = await response.blob();
        await storeImage(image.image_file, blob);
       
        const currentProgress = (i + 1) / imageSet.length;
        setProgress(currentProgress);
        onProgressChange(currentProgress);
      } catch (error) {
        console.error('Error caching image:', error);
      }
    }

    setIsPreloading(false);
    onPreloadingChange(false);
    if (onComplete) onComplete();
  }, [onPreloadingChange, onProgressChange, onComplete]);
  
  const handlePreloadMany = useCallback(async () => {
    try {
      const manyImages = await fetchManyImages();
      preloadImages(manyImages);
    } catch (error) {
      console.error('Error fetching images for preload:', error);
      setIsPreloading(false);
      onPreloadingChange(false);
    }
  }, [fetchManyImages, preloadImages, onPreloadingChange]);

  const handleClearCache = useCallback(async () => {
    try {
      setIsPreloading(true);
      onPreloadingChange(true);
      
      // Clear all images older than 1 day
      const count = await clearOldImages(1);
      
      setIsPreloading(false);
      onPreloadingChange(false);
      
      return count;
    } catch (error) {
      console.error('Error clearing cache:', error);
      setIsPreloading(false);
      onPreloadingChange(false);
      return 0;
    }
  }, [onPreloadingChange]);

  return (
    <PreloaderContainer>
      <ButtonsRow>
        <PreloaderButton
          onClick={handlePreloadMany}
          disabled={isPreloading}
        >
          {isPreloading ? t('preloading') : t('preloadImages')}
        </PreloaderButton>
        
        <PreloaderButton
          onClick={handleClearCache}
          disabled={isPreloading}
        >
          {t('clearImageCache')}
        </PreloaderButton>
      </ButtonsRow>
      
      {isPreloading && (
        <ProgressBar>
          <ProgressFill progress={progress * 100} />
        </ProgressBar>
      )}
    </PreloaderContainer>
  );
};

export default ImagePreloader;