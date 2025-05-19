// components/SharedControls/TimerControls.js
import React, { useState, useEffect, useRef } from 'react';
import useTranslation from '../../../config/useTranslation';
import FireSliderStyles from './FireSliderStyles';
import '../../../cypher-theme.css';
import '../../../fire-theme.css';

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
  
  // Slider active state
  const [isRoundSliderActive, setIsRoundSliderActive] = useState(false);
  
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
      {/* Custom Fire Slider Styles */}
      <FireSliderStyles />
      {/* Main timer panel - Full Width Fixed at Bottom */}
      <div
        className="timer-panel"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderTop: '1px solid #FF784C',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.7)',
          padding: '20px',
          zIndex: 500,
          opacity: isFullScreen ? 0.2 : 1,
          transition: 'opacity 0.3s ease',
          background: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.9), rgba(30, 15, 8, 0.95))',
        }}
        onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0.2')}
      >
        {/* Timer display - Main timer centered with interval and round time as "badges" */}
        <div 
          className="timer-display"
          style={{
          position: 'relative',
          height: '88px',
          marginBottom: '15px',
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
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(255, 120, 60, 0.15), rgba(255, 80, 30, 0.1))',
              border: '1px solid rgba(255, 120, 60, 0.4)',
              borderRadius: '25px',
              fontSize: '14px',
              color: 'rgba(255, 220, 160, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255, 120, 60, 0.2)',
              height: '48px',
            }}>
            <button
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
              style={{
                background: 'transparent',
                color: 'rgba(255, 180, 100, 0.8)',
                border: '1px solid rgba(255, 120, 60, 0.3)',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
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
                width: '26px',
                height: '26px',
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
            fontSize: '53px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            color: isActive ? 'rgba(255, 200, 100, 1)' : 'rgba(255, 150, 80, 0.9)',
            textAlign: 'center',
            textShadow: isActive ? '0 0 15px rgba(255, 120, 60, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
            letterSpacing: '2px',
            lineHeight: '1.2',
          }}>
            {timer}
          </div>

          {/* Round Time with Line Slider */}
          <div 
            className="round-time-slider-control"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}>
            {/* Round Time Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px',
            }}>
              <span style={{
                fontSize: '12px',
                color: 'rgba(255, 180, 100, 0.7)',
                marginBottom: '3px',
              }}>
                {t('roundTime')}
              </span>
              <span style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: 'rgba(255, 220, 160, 0.95)',
                fontFamily: 'var(--font-display)',
              }}>
                {roundDuration === Infinity ? '∞' : `${roundTimer}s`}
              </span>
            </div>
            
            {/* Line Slider Container */}
            <div style={{
              position: 'relative',
              width: '150px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
            }}>
              {/* Custom Native Slider */}
              <input
                type="range"
                min="10"
                max="300"
                value={roundDuration === Infinity ? 300 : roundDuration}
                onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
                onInput={(e) => handleRoundDurationChange(parseInt(e.target.value))}
                onMouseDown={() => setIsRoundSliderActive(true)}
                onMouseUp={() => setIsRoundSliderActive(false)}
                onTouchStart={() => setIsRoundSliderActive(true)}
                onTouchEnd={() => setIsRoundSliderActive(false)}
                aria-label={t('roundDuration')}
                style={{
                  width: '100%',
                  '--value': `${(roundDuration === Infinity ? 100 : (roundDuration - 10) / 290 * 100)}%`,
                }}
                className="fire-slider"
              />
              
              {/* Infinity button at the end */}
              <button
                className={`infinity-button ${roundDuration === Infinity ? 'active' : 'inactive'}`}
                onClick={() => {
                  handleRoundDurationChange(Infinity);
                  setIsRoundSliderActive(false);
                }}
              >
                ∞
              </button>
            </div>
          </div>
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