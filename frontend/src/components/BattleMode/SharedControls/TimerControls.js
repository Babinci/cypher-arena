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
    const mainTimer = timerDisplay?.querySelector('div:first-child');
    
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
      
      // Log timer display positions (top and bottom borders)
      if (timerDisplay) {
        const displayRect = timerDisplay.getBoundingClientRect();
        console.log(`- Timer display top: ${(displayRect.top / windowHeight * 100).toFixed(1)}%`);
        console.log(`- Timer display bottom: ${(displayRect.bottom / windowHeight * 100).toFixed(1)}%`);
        console.log(`- Timer display height: ${(displayRect.height / windowHeight * 100).toFixed(1)}%`);
        
        // Log main timer bottom border
        if (mainTimer) {
          const mainTimerRect = mainTimer.getBoundingClientRect();
          console.log(`- Main timer bottom border: ${(mainTimerRect.bottom / windowHeight * 100).toFixed(1)}%`);
        }
      }
      
      // Log interval and round time badge positions
      if (intervalBadge) {
        const intervalRect = intervalBadge.getBoundingClientRect();
        console.log(`- Interval badge horizontal center: ${(intervalRect.left + intervalRect.width/2) / windowWidth * 100}%`);
        console.log(`- Interval badge width: ${intervalRect.width / windowWidth * 100}%`);
        console.log(`- Interval badge bottom border: ${(intervalRect.bottom / windowHeight * 100).toFixed(1)}%`);
      }
      
      if (roundTimeBadge) {
        const roundTimeRect = roundTimeBadge.getBoundingClientRect();
        console.log(`- Round time badge horizontal center: ${(roundTimeRect.left + roundTimeRect.width/2) / windowWidth * 100}%`);
        console.log(`- Round time badge width: ${roundTimeRect.width / windowWidth * 100}%`);
        console.log(`- Round time badge bottom border: ${(roundTimeRect.bottom / windowHeight * 100).toFixed(1)}%`);
      }
      
      // Log slider position - top and bottom borders
      if (slider) {
        const sliderRect = slider.getBoundingClientRect();
        console.log(`- Slider top border: ${(sliderRect.top / windowHeight * 100).toFixed(1)}%`);
        console.log(`- Slider bottom border: ${(sliderRect.bottom / windowHeight * 100).toFixed(1)}%`);
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
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          borderTop: '1px solid rgba(255, 120, 60, 0.3)',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.7)',
          padding: '8px 10px',
          zIndex: 500,
          opacity: isFullScreen ? 0.2 : 1,
          transition: 'opacity 0.3s ease',
          background: 'linear-gradient(to top, rgba(10, 10, 10, 0.95), rgba(20, 10, 5, 0.85))',
        }}
        onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0.2')}
      >
        {/* Timer display - Main timer centered with interval and round time as "badges" */}
        <div 
          className="timer-display"
          style={{
          position: 'relative',
          height: '50px',
          marginBottom: '0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
        }}>
          {/* Interval with integrated controls */}
          <div 
            className="interval-badge"
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, rgba(255, 120, 60, 0.15), rgba(255, 80, 30, 0.1))',
              border: '1px solid rgba(255, 120, 60, 0.4)',
              borderRadius: '20px',
              fontSize: '14px',
              color: 'rgba(255, 220, 160, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255, 120, 60, 0.2)',
            }}>
            <button
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
              style={{
                background: 'transparent',
                color: 'rgba(255, 180, 100, 0.8)',
                border: '1px solid rgba(255, 120, 60, 0.3)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 120, 60, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              -
            </button>
            <span style={{ minWidth: '80px', textAlign: 'center' }}>
              {t('interval')}: {changeInterval}s
            </span>
            <button
              onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
              style={{
                background: 'transparent',
                color: 'rgba(255, 180, 100, 0.8)',
                border: '1px solid rgba(255, 120, 60, 0.3)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 120, 60, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              +
            </button>
          </div>

          {/* Main Timer centered */}
          <div style={{
            fontSize: '42px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            color: isActive ? 'rgba(255, 200, 100, 1)' : 'rgba(255, 150, 80, 0.9)',
            textAlign: 'center',
            textShadow: isActive ? '0 0 15px rgba(255, 120, 60, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
            letterSpacing: '2px',
          }}>
            {timer}
          </div>

          {/* Round Time badge - now integrated with slider */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div 
              className="roundtime-badge"
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(255, 120, 60, 0.15), rgba(255, 80, 30, 0.1))',
                border: '1px solid rgba(255, 120, 60, 0.4)',
                borderRadius: '20px',
                fontSize: '14px',
                color: 'rgba(255, 220, 160, 0.9)',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(255, 120, 60, 0.2)',
              }}>
              {t('roundTime')}: {roundDuration === Infinity ? '∞' : `${roundTimer}s`}
            </div>
          </div>
        </div>
        
        {/* Round duration slider - narrower and connected to round time */}
        <div style={{ 
          marginTop: '6px',
          marginBottom: '8px',
          width: '70%',
          margin: '6px auto 8px auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
        }}>
          {/* Connect slider visually to round time */}
          <div style={{
            position: 'absolute',
            top: '-16px',
            right: '50%',
            transform: 'translateX(50%)',
            width: '2px',
            height: '16px',
            background: 'linear-gradient(to bottom, rgba(255, 120, 60, 0.4), transparent)',
          }} />
          <input
            type="range"
            min="10"
            max="300"
            value={roundDuration === Infinity ? 300 : roundDuration}
            onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
            aria-label={t('roundDuration')}
            style={{ 
              width: '100%',
              height: '6px',
              appearance: 'none',
              background: 'linear-gradient(to right, rgba(255, 60, 30, 0.3), rgba(255, 120, 60, 0.6))',
              borderRadius: '3px',
              outline: 'none',
              border: '1px solid rgba(255, 120, 60, 0.2)',
            }}
            className="fire-slider"
          />
        </div>
        
        {/* Control buttons - fire-themed */}
        <div 
          className="timer-buttons"
          style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          gap: '8px',
          width: '70%',
          margin: '0 auto',
        }}>
          <button 
            onClick={toggleActive}
            style={{
              padding: '8px 16px',
              background: isActive ? 
                'linear-gradient(135deg, rgba(255, 60, 60, 0.8), rgba(200, 40, 40, 0.7))' : 
                'linear-gradient(135deg, rgba(255, 120, 60, 0.8), rgba(255, 80, 30, 0.7))',
              color: 'white',
              border: '1px solid rgba(255, 120, 60, 0.5)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          >
            {isActive ? t('pause') : t('resume')}
          </button>
          
          <button 
            onClick={getNextItem}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.7))',
              color: 'rgba(255, 180, 100, 0.9)',
              border: '1px solid rgba(255, 120, 60, 0.3)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          >
            {t('nextItem')}
          </button>
          
          <button 
            onClick={handleResetRound}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.7))',
              color: 'rgba(255, 180, 100, 0.9)',
              border: '1px solid rgba(255, 120, 60, 0.3)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: '600',
              flex: '1',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          >
            {t('resetRound')}
          </button>
        </div>
      </div>
    </>
  );
};