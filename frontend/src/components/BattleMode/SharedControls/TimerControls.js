// components/SharedControls/TimerControls.js
import React, { useState, useEffect, useRef } from 'react';
import useTranslation from '../../../config/useTranslation';
import '../../../cypher-theme.css';

// TimerControls: A reusable component that renders the control panel UI
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
  
  // Function to log UI positions
  const logUIPositions = () => {
    // Get timer panel element to calculate positions
    const timerPanel = document.querySelector('.timer-panel');
    const timerDisplay = document.querySelector('.timer-display');
    const buttonsContainer = document.querySelector('.timer-buttons');
    const buttons = buttonsContainer?.querySelectorAll('button');
    const slider = document.querySelector('.green-slider');
    const intervalBadge = document.querySelector('.interval-badge');
    const roundTimeBadge = document.querySelector('.roundtime-badge');
    
    // Calculate positions in percentages
    if (timerPanel) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const timerRect = timerPanel.getBoundingClientRect();
      
      // Log detailed positioning information
      console.log("=== UI POSITION LOGGING ===");
      console.log("Timer UI Positioning (% of screen):");
      console.log("- Window dimensions:", windowWidth, "x", windowHeight);
      console.log(`- Timer panel top border: ${(timerRect.top / windowHeight * 100).toFixed(1)}%`);
      console.log(`- Timer panel height: ${(timerRect.height / windowHeight * 100).toFixed(1)}%`);
      console.log(`- Timer panel width: ${(timerRect.width / windowWidth * 100).toFixed(1)}%`);
      
      if (timerDisplay) {
        const displayRect = timerDisplay.getBoundingClientRect();
        console.log(`- Timer display top: ${(displayRect.top / windowHeight * 100).toFixed(1)}%`);
        console.log(`- Timer display height: ${(displayRect.height / windowHeight * 100).toFixed(1)}%`);
      }
      
      // Log interval and round time badge positions
      if (intervalBadge) {
        const intervalRect = intervalBadge.getBoundingClientRect();
        console.log(`- Interval badge horizontal center: ${(intervalRect.left + intervalRect.width/2) / windowWidth * 100}%`);
        console.log(`- Interval badge width: ${intervalRect.width / windowWidth * 100}%`);
      }
      
      if (roundTimeBadge) {
        const roundTimeRect = roundTimeBadge.getBoundingClientRect();
        console.log(`- Round time badge horizontal center: ${(roundTimeRect.left + roundTimeRect.width/2) / windowWidth * 100}%`);
        console.log(`- Round time badge width: ${roundTimeRect.width / windowWidth * 100}%`);
      }
      
      if (slider) {
        const sliderRect = slider.getBoundingClientRect();
        console.log(`- Slider position: ${(sliderRect.top / windowHeight * 100).toFixed(1)}%`);
      }
      
      // If we have buttons, log their positions
      if (buttons?.length) {
        const buttonRect = buttons[0].getBoundingClientRect();
        console.log(`- First button top position: ${(buttonRect.top / windowHeight * 100).toFixed(1)}%`);
        
        if (buttonsContainer) {
          const containerRect = buttonsContainer.getBoundingClientRect();
          console.log(`- Buttons container width: ${(containerRect.width / windowWidth * 100).toFixed(1)}%`);
        }
      }
    }
  };
  
  // Handle window resize only
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Add a one-time logging effect
  useEffect(() => {
    // Just log once after component is mounted and rendered
    setTimeout(() => {
      console.log("=== ONE-TIME UI POSITION LOGGING ===");
      console.log("Screen settings and UI positions (not updating):");
      logUIPositions();
    }, 1000); // Log after 1 second to make sure everything is rendered
  }, []);

  return (
    <>
      {/* Main timer panel - Full Width Fixed at Bottom */}
      <div
        className="timer-panel"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          borderTop: '2px solid var(--accent-primary)',
          boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.5)',
          padding: '10px 15px',
          zIndex: 1000,
          opacity: isFullScreen ? 0.2 : 1,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0.2')}
      >
        {/* Timer display - Main timer centered with interval and round time as "badges" */}
        <div 
          className="timer-display"
          style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15px',
          height: '60px',
        }}>
          {/* Main Timer centered */}
          <div style={{
            fontSize: '40px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            color: isActive ? 'var(--accent-primary)' : 'white',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}>
            {timer}
          </div>

          {/* Interval and Round Time as floating badges */}
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            position: 'absolute',
            top: '10px',
          }}>
            {/* Left badge - Interval */}
            <div 
              className="interval-badge"
              style={{
              padding: '5px 10px',
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              borderRadius: '5px',
              fontSize: '14px',
              color: 'white',
              textAlign: 'center',
              position: 'absolute',
              left: '20%',
              transform: 'translateX(-50%)',
            }}>
              {t('interval')}: {changeInterval}s
            </div>
            
            {/* Right badge - Round Timer */}
            <div 
              className="roundtime-badge"
              style={{
              padding: '5px 10px',
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              borderRadius: '5px',
              fontSize: '14px',
              color: 'white',
              textAlign: 'center',
              position: 'absolute',
              right: '20%',
              transform: 'translateX(50%)',
            }}>
              {t('roundTime')}: {roundDuration === Infinity ? '∞' : `${roundTimer}s`}
            </div>
          </div>
        </div>
        
        {/* Round duration slider - styled like the green progress bar in the reference */}
        <div style={{ 
          marginBottom: '15px',
          width: '90%',
          margin: '0 auto 15px auto',
        }}>
          <input
            type="range"
            min="10"
            max="300"
            value={roundDuration === Infinity ? 300 : roundDuration}
            onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
            aria-label={t('roundDuration')}
            style={{ 
              width: '100%',
              height: '12px',
              appearance: 'none',
              backgroundColor: 'rgba(40, 40, 40, 0.5)',
              borderRadius: '6px',
              outline: 'none',
              border: '1px solid rgba(0, 0, 0, 0.3)',
            }}
            className="green-slider"
          />
        </div>
        
        {/* Control buttons - centered layout as in reference image */}
        <div 
          className="timer-buttons"
          style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          gap: '5px',
          width: '80%',
          margin: '0 auto',
        }}>
          <button 
            onClick={toggleActive}
            style={{
              padding: '8px 10px',
              backgroundColor: isActive ? 'var(--accent-tertiary)' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '600',
              flex: '1',
            }}
          >
            {isActive ? t('pause') : t('resume')}
          </button>
          
          <button 
            onClick={getNextItem}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-light)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '600',
              flex: '1',
            }}
          >
            {t('nextItem')}
          </button>
          
          <button 
            onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-light)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '600',
              flex: '1',
            }}
          >
            {t('decreaseInterval')}
          </button>
          
          <button 
            onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-light)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '600',
              flex: '1',
            }}
          >
            {t('increaseInterval')}
          </button>
          
          <button 
            onClick={handleResetRound}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-light)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: '600',
              flex: '1',
            }}
          >
            {t('resetRound')}
          </button>
        </div>
      </div>
    </>
  );
};