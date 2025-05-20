import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import theme from '../../config/theme';
import useTranslation from '../../config/useTranslation';
import { ImagePreloader } from './ImagePreloader';
import apiConfig from '../../config/apiConfig';
import { showToast } from '../SharedUI/ToastNotification';

const SettingsContainer = styled.div`
  background-color: ${theme.colors.backgroundDark};
  color: ${theme.colors.textPrimary};
  padding: 20px;
  border-radius: 8px;
  max-width: 800px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const SettingsHeader = styled.h2`
  color: ${theme.colors.accentPrimary};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${theme.colors.borderColor};
`;

const SettingsSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  margin-bottom: 15px;
`;

const SettingsButton = styled.button`
  background-color: ${theme.colors.accentPrimary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 10px;
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

function Settings() {
  const { t } = useTranslation();
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const fetchManyImages = useCallback(async () => {
    let allImages = [];
    let url = `${apiConfig.baseUrl}${apiConfig.endpoints.getImages}?page_size=100`;
    
    try {
      for (let i = 0; i < 20; i++) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        allImages = [...allImages, ...data.results];
        url = data.next;
        if (!url) break;
      }
      return allImages;
    } catch (error) {
      console.error('Error fetching many images:', error);
      showToast({
        title: t('errorOccurred'),
        message: error.message,
        type: 'error'
      });
      throw error;
    }
  }, [t]);

  const handlePreloadComplete = useCallback(() => {
    showToast({
      title: t('preloadComplete'),
      message: t('imagesPreloadedSuccess'),
      type: 'success'
    });
    setIsPreloading(false);
  }, [t]);

  return (
    <SettingsContainer>
      <SettingsHeader>{t('settings')}</SettingsHeader>
      
      <SettingsSection>
        <SectionTitle>{t('imageSettings')}</SectionTitle>
        <p>{t('imagePreloadDescription')}</p>
        
        <ImagePreloader 
          onPreloadingChange={setIsPreloading}
          onProgressChange={setPreloadProgress}
          fetchManyImages={fetchManyImages}
          onComplete={handlePreloadComplete}
        />
        
        {isPreloading && (
          <div style={{ marginTop: 10 }}>
            {t('preloadingProgress')}: {Math.round(preloadProgress * 100)}%
          </div>
        )}
      </SettingsSection>
    </SettingsContainer>
  );
}

export default Settings;