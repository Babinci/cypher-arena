// components/SharedControls/TimerControls.js
import React, { useState, useEffect } from 'react';
import useTranslation from '../../../config/useTranslation';
import '../../../cypher-theme.css';

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

  return (
    <div
      className="control-panel"
      style={{
        width: '100%',
        overflowY: isControlWindow ? 'visible' : 'auto',
        padding: isMobile ? '5px' : '10px',
        boxSizing: 'border-box',
        height: 'auto',
        maxHeight: isMobile && !isExpanded ? '40px' : '15vh', // Maximum 15% of screen height
        overflow: 'hidden',
        position: isFullScreen ? 'fixed' : 'static',
        bottom: 0,
        left: 0,
        transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out',
        opacity: isFullScreen ? 0 : 1
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
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '0.02em',
            color: 'var(--accent-primary)',
            borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.2)' : 'none'
          }}
        >
          {isExpanded ? t('collapseControls') + ' ▲' : t('expandControls') + ' ▼'}
        </div>
      )}
     
      {/* Timer display section - always visible */}
      <div className="timer-display" style={{ 
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: isMobile ? '8px' : '12px'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '600',
          borderRadius: '4px',
          padding: '2px 8px',
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--bg-deep)'
        }}>
          {t('timer')}: {timer} {t('seconds')}
        </div>
        
        {(!isMobile || isExpanded || isControlWindow) ? (
          <>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              borderRadius: '4px',
              padding: '2px 8px',
              backgroundColor: 'var(--bg-light)',
              color: 'white'
            }}>
              {t('interval')}: {changeInterval} {t('seconds')}
            </div>
            
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              borderRadius: '4px',
              padding: '2px 8px',
              backgroundColor: 'var(--bg-light)',
              color: 'white'
            }}>
              {t('roundDuration')}: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} ${t('seconds')}`}
            </div>
          </>
        ) : null}
      </div>

      {/* Rest of controls - only visible when expanded on mobile */}
      {(isExpanded || !isMobile || isControlWindow) && (
        <>
          {/* Round duration slider */}
          <div style={{ marginBottom: isMobile ? '8px' : '10px' }}>
            <input
              type="range"
              min="10"
              max="300"
              value={roundDuration === Infinity ? 300 : roundDuration}
              onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
            />
          </div>

          {/* Control buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: isMobile ? '5px' : '8px'
          }}>
            <button onClick={getNextItem} className="control-btn">
              {t('nextItem')}
            </button>
            
            <button 
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
              className="control-btn"
            >
              {t('decreaseInterval')}
            </button>
            
            <button 
              onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
              className="control-btn"
            >
              {t('increaseInterval')}
            </button>
            
            <button 
              onClick={toggleActive}
              className="control-btn"
              style={{
                backgroundColor: isActive ? 'var(--accent-tertiary)' : 'var(--accent-primary)'
              }}
            >
              {isActive ? t('pause') : t('resume')}
            </button>
            
            <button 
              onClick={handleResetRound}
              className="control-btn"
            >
              {t('resetRound')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
