// components/SharedControls/TimerControls.js
import React, { useState, useEffect } from 'react';
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
  
  // Slider active state - not currently used but kept for future functionality
  const [, setIsRoundSliderActive] = useState(false);
  
  // Define step values for the round duration slider
  const stepValues = [20, 30, 35, 40, 45, 50, 60, 70, 80, 90, 120, 150, 180, Infinity];
  
  // Helper function to convert duration to percentage position
  const getRoundDurationPercentage = (duration) => {
    if (duration === Infinity) return 100;
    
    // Find the index of this duration in our steps, or the nearest one
    const exactIndex = stepValues.indexOf(duration);
    if (exactIndex !== -1) {
      // If the value is exactly one of our steps, use its position
      return (exactIndex / (stepValues.length - 1)) * 100;
    }
    
    // If it's between steps (shouldn't happen with our implementation), find nearest
    // This is a fallback for any unexpected values
    let nearestIndex = 0;
    let minDiff = Math.abs(stepValues[0] - duration);
    
    for (let i = 1; i < stepValues.length; i++) {
      if (stepValues[i] === Infinity) continue;
      const diff = Math.abs(stepValues[i] - duration);
      if (diff < minDiff) {
        minDiff = diff;
        nearestIndex = i;
      }
    }
    
    return (nearestIndex / (stepValues.length - 1)) * 100;
  };
  
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
      
      {/* Hover detection area - only visible in fullscreen mode */}
      {isFullScreen && (
        <div
          className="timer-hover-area"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px', // Larger hover area for better detection
            width: '100%',
            zIndex: 499,
            cursor: 'default',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            const timerPanel = document.querySelector('.timer-panel');
            if (timerPanel) {
              timerPanel.style.opacity = '1';
              timerPanel.style.pointerEvents = 'auto';
            }
          }}
          onMouseMove={(e) => {
            // Also respond to mouse movement in the hover area
            const timerPanel = document.querySelector('.timer-panel');
            if (timerPanel && e.clientY > window.innerHeight - 120) {
              timerPanel.style.opacity = '1';
              timerPanel.style.pointerEvents = 'auto';
            }
          }}
          onMouseLeave={(e) => {
            if (isFullScreen) {
              // Hide timer if mouse goes above the detection area
              const timerPanel = document.querySelector('.timer-panel');
              if (timerPanel) {
                timerPanel.style.opacity = '0';
                timerPanel.style.pointerEvents = 'none';
              }
            }
          }}
        />
      )}
      
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
          opacity: isFullScreen ? 0 : 1,
          transition: 'opacity 0.3s ease',
          background: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.9), rgba(30, 15, 8, 0.95))',
          pointerEvents: isFullScreen ? 'none' : 'auto',
        }}
        onMouseEnter={(e) => {
          if (isFullScreen) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.pointerEvents = 'auto';
          }
        }}
        onMouseLeave={(e) => {
          if (isFullScreen) {
            // Immediately hide the timer when mouse leaves
            e.currentTarget.style.opacity = '0';
            e.currentTarget.style.pointerEvents = 'none';
          }
        }}
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

          {/* Unified Round Time Slider */}
          <div 
            className="round-time-slider-control"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '180px',
              marginTop: '6px',
            }}>
            {/* Small label above slider */}
            <span className="round-time-label" style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              width: '100%',
              textAlign: 'center',
            }}>
              {t('roundTime')}
            </span>
            
            {/* Slider Container with Time Display */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '6px',
            }}>
              {/* Simple track for visual indication only */}
              <div className="round-time-track"></div>
              
              {/* Custom track fill */}
              <div 
                className="round-time-track-fill"
                style={{
                  width: `${getRoundDurationPercentage(roundDuration)}%`,
                }}
              ></div>
              
              {/* Draggable Thumb Display */}
              <div 
                className="round-time-thumb-display"
                ref={(el) => {
                  if (el) {
                    // Setup drag functionality
                    const getTrackElement = () => {
                      // Find the track element (parent of this thumb)
                      return el.parentElement.querySelector('.round-time-track');
                    };
                    
                    // Define the specific step values 
                    const stepValues = [20, 30, 35, 40, 45, 50, 60, 70, 80, 90, 120, 150, 180, Infinity];
                    
                    // Calculate and set slider value from pointer position to nearest step value
                    const updateFromPointer = (clientX) => {
                      const trackEl = getTrackElement();
                      if (!trackEl) return;
                      
                      const rect = trackEl.getBoundingClientRect();
                      
                      // Calculate x position relative to track
                      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                      const ratio = x / rect.width;
                      
                      // Map the ratio to the index in the step values array
                      const index = Math.min(
                        Math.floor(ratio * stepValues.length), 
                        stepValues.length - 1
                      );
                      
                      // Set the new value from our predefined steps
                      const newValue = stepValues[index];
                      handleRoundDurationChange(newValue);
                    };
                    
                    // Mouse event handlers
                    el.onmousedown = (e) => {
                      e.preventDefault(); // Prevent text selection
                      setIsRoundSliderActive(true);
                      
                      // Capture starting point for drag
                      const startX = e.clientX;
                      const startLeft = parseFloat(el.style.left || '0');
                      
                      // Update cursor style
                      el.style.cursor = 'grabbing';
                      
                      // Create move handler
                      const handleMouseMove = (e) => {
                        updateFromPointer(e.clientX);
                      };
                      
                      // Create mouse up handler
                      const handleMouseUp = () => {
                        setIsRoundSliderActive(false);
                        el.style.cursor = 'grab';
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      // Add global event listeners
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    };
                    
                    // Touch event handlers
                    el.ontouchstart = (e) => {
                      e.preventDefault(); // Prevent scrolling
                      setIsRoundSliderActive(true);
                      
                      // Update cursor style
                      el.classList.add('dragging');
                      
                      // Create touch move handler
                      const handleTouchMove = (e) => {
                        updateFromPointer(e.touches[0].clientX);
                      };
                      
                      // Create touch end handler
                      const handleTouchEnd = () => {
                        setIsRoundSliderActive(false);
                        el.classList.remove('dragging');
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      // Add global event listeners
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    };
                    
                    // Also allow clicking directly on the track
                    const trackEl = getTrackElement();
                    if (trackEl) {
                      trackEl.onclick = (e) => {
                        updateFromPointer(e.clientX);
                      };
                    }
                  }
                }}
                style={{
                  left: `calc(${getRoundDurationPercentage(roundDuration)}% - 20px)`,
                  top: '-18px',
                  cursor: 'grab',
                }}
              >
                {roundDuration === Infinity ? '∞' : roundTimer}
              </div>
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