// BeatsMode.js
import React, { useState } from 'react';
import { FullScreen } from 'react-full-screen';
import useTranslation from '../../../config/useTranslation';

const BeatsMode = () => {
  const { t } = useTranslation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [handle, setHandle] = useState(null);

  const toggleFullScreen = () => {
    if (handle) {
      if (isFullScreen) {
        handle.exit();
      } else {
        handle.enter();
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  return (
    <FullScreen handle={{ enter: () => {}, exit: () => {}, active: isFullScreen, onChange: setIsFullScreen }} ref={setHandle}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%'
        }}>
          <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('beatsModeTitle') || 'Freestyle Beats'}</h1>
          
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '15px' }}>
              {t('beatsModeDescription') || 'Use these beats for your freestyle practice sessions.'}
            </p>
            <p style={{ fontSize: '14px', backgroundColor: '#333', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
              {t('thirdPartyCookiesWarning') || 'Note: You may need to allow third-party cookies for the Spotify player to work properly.'}
            </p>
          </div>
          
          <div style={{ width: '100%', height: '500px', maxWidth: '100%' }}>
            <iframe
              src="https://open.spotify.com/embed/playlist/5JyZOh3sXa75Lsm8kyS1rI?utm_source=generator"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Cypher Arena Freestyle Beats"
              style={{ borderRadius: '8px' }}
            ></iframe>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a
              href="https://open.spotify.com/playlist/5JyZOh3sXa75Lsm8kyS1rI"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#1DB954', // Spotify green
                color: 'white',
                padding: '10px 20px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 'bold',
                marginTop: '15px'
              }}
            >
              {t('openInSpotify') || 'Open in Spotify'} ↗
            </a>
          </div>
        </div>
        
        <div style={{
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
            {isFullScreen ? (t('exitFullScreen') || 'Exit Fullscreen') : (t('enterFullScreen') || 'Enter Fullscreen')}
          </button>
        </div>
      </div>
    </FullScreen>
  );
};

export default BeatsMode;