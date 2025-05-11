// components/SharedControls/TimerControls.js
import React, { useState, useEffect } from 'react';
import useTranslation from '../../../config/useTranslation';

// TimerControls: A reusable component that renders the control panel UI
// Props:
// - timer: Current countdown timer value for items
// - roundTimer: Overall round timer value
// - changeInterval: Time between item changes
// - roundDuration: Total duration of the round
// - isActive: Whether the timer is running
// - handleRoundDurationChange: Function to update round duration
// - getNextItem: Function to move to next item
// - handleIntervalChange: Function to update interval
// - toggleActive: Function to pause/resume
// - handleResetRound: Function to reset the round
// - isControlWindow: Whether this is rendered in control window
// - isFullScreen: Whether the main window is in fullscreen
export const TimerControls = ({
  timer,
  roundTimer,
  changeInterval,
  roundDuration,
  isActive,
  handleRoundDurationChange,
  getNextItem,
  handleIntervalChange,
  toggleActive,
  handleResetRound,
  isControlWindow,
  isFullScreen,
}) => {
  // Get translation function
  const { t } = useTranslation();
  
  // Add mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExpanded, setIsExpanded] = useState(!isMobile); // Collapsed by default on mobile

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile-optimized compact styles
  const mobileStyles = {
    controlPanel: {
      padding: '5px',
      height: isMobile ? 'auto' : 'auto',
      maxHeight: isMobile && !isExpanded ? '40px' : 'none',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease-in-out',
    },
    timerInfo: {
      fontSize: isMobile ? '12px' : '14px',
      marginBottom: isMobile ? '10px' : '20px',
    },
    button: {
      padding: isMobile ? '6px 10px' : '10px 20px',
      fontSize: isMobile ? '12px' : '14px',
    }
  };

  return (
    <div
      className="control-panel"
      style={{
        width: '100%',
        overflowY: isControlWindow ? 'visible' : 'auto',
        padding: isMobile ? '5px' : '10px',
        boxSizing: 'border-box',
        height: 'auto',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        position: isFullScreen ? 'fixed' : 'static',
        bottom: 0,
        left: 0,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isFullScreen ? 0 : 1,
        ...mobileStyles.controlPanel
      }}
      onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
    >
      {/* Control window title */}
      {isControlWindow && (
        <h2 style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          {t('openControlPanel')}
        </h2>
      )}

      {/* Mobile toggle button */}
      {isMobile && !isControlWindow && (
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            padding: '5px',
            borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.2)' : 'none'
          }}
        >
          {isExpanded ? 'Collapse Controls ▲' : 'Expand Controls ▼'}
        </div>
      )}
     
      {/* Timer display section - always visible */}
      <div style={{ 
        marginBottom: isMobile ? '10px' : '20px', 
        textAlign: 'center',
        fontSize: isMobile ? '12px' : '14px'
      }}>
        <div className="timer">{t('timer')}: {timer} seconds</div>
        {(isExpanded || !isMobile || isControlWindow) && (
          <>
            <div>{t('interval')}: {changeInterval} seconds</div>
            <div>{t('roundDuration')}: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
          </>
        )}
      </div>

      {/* Rest of controls - only visible when expanded on mobile */}
      {(isExpanded || !isMobile || isControlWindow) && (
        <>
          {/* Round duration slider */}
          <div style={{ marginBottom: isMobile ? '10px' : '20px' }}>
            <input
              type="range"
              min="10"
              max="300"
              value={roundDuration === Infinity ? 300 : roundDuration}
              onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                marginBottom: '10px',
                accentColor: '#4CAF50'
              }}
            />
          </div>

          {/* Control buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: isMobile ? '5px' : '10px'
          }}>
            {/* Button styling - smaller on mobile */}
            <button
              onClick={getNextItem}
              style={{
                padding: isMobile ? '6px 10px' : '10px 20px',
                backgroundColor: '#FFD700',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {t('nextItem')}
            </button>
            
            <button
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
              style={{
                padding: isMobile ? '6px 10px' : '10px 20px',
                backgroundColor: '#FFD700',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {t('decreaseInterval')}
            </button>
            
            <button
              onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
              style={{
                padding: isMobile ? '6px 10px' : '10px 20px',
                backgroundColor: '#FFD700',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {t('increaseInterval')}
            </button>
            
            <button
              onClick={toggleActive}
              style={{
                padding: isMobile ? '6px 10px' : '10px 20px',
                backgroundColor: '#FFD700',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {isActive ? t('pause') : t('resume')}
            </button>
            
            <button
              onClick={handleResetRound}
              style={{
                padding: isMobile ? '6px 10px' : '10px 20px',
                backgroundColor: '#FFD700',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {t('resetRound')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
