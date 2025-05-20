// components/SharedControls/TimerControls.js
import React, { useState, useEffect } from 'react';
import useTranslation from '../../../config/useTranslation';
import FireSliderStyles from './FireSliderStyles';
import theme from '../../../config/theme';
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

  // Helper to get screen size category
  const getScreenSize = () => {
    const width = window.innerWidth;
    if (width <= parseInt(theme.breakpoints.xs, 10)) return 'xs';
    if (width <= parseInt(theme.breakpoints.sm, 10)) return 'sm';
    if (width <= parseInt(theme.breakpoints.md, 10)) return 'md';
    return 'lg';
  };

  // Determine responsive styles based on screen size
  const getResponsiveStyles = () => {
    const screenSize = getScreenSize();
    
    // Default styles (lg screens)
    let styles = {
      timerPanel: {
        padding: '20px',
      },
      timerDisplay: {
        height: '88px',
        marginBottom: '15px',
        gap: '30px',
      },
      mainTimer: {
        fontSize: '53px',
        letterSpacing: '2px',
      },
      intervalBadge: {
        padding: '10px 14px',
        height: '48px',
        fontSize: '14px',
        gap: '8px',
      },
      intervalButton: {
        width: '26px',
        height: '26px',
        fontSize: '14px',
      },
      intervalSpan: {
        minWidth: '80px',
      },
      roundTimeSlider: {
        width: '180px',
      },
      roundTimeLabel: {
        top: '-20px',
        fontSize: '12px',
      },
      buttonContainer: {
        width: '70%',
        flexDirection: 'row',
        gap: '8px',
      },
      button: {
        padding: '8px 16px',
        fontSize: '13px',
      },
      tickLabels: {
        visible: true,
      },
      thumbDisplay: {
        width: '44px',
        height: '28px',
        fontSize: '16px',
      }
    };
    
    // Medium screens (md) adjustments
    if (screenSize === 'md') {
      styles = {
        ...styles,
        timerPanel: {
          padding: '16px 15px',
        },
        timerDisplay: {
          height: '80px',
          marginBottom: '12px',
          gap: '20px',
        },
        mainTimer: {
          fontSize: '46px',
          letterSpacing: '1px',
        },
        roundTimeSlider: {
          width: '160px',
        },
        buttonContainer: {
          width: '85%',
          gap: '6px',
        },
        button: {
          padding: '7px 12px',
          fontSize: '12px',
        },
      };
    }
    
    // Small screens (sm) adjustments
    if (screenSize === 'sm') {
      styles = {
        ...styles,
        timerPanel: {
          padding: '14px 10px',
        },
        timerDisplay: {
          height: '70px',
          marginBottom: '10px',
          gap: '15px',
        },
        mainTimer: {
          fontSize: '40px',
          letterSpacing: '0px',
        },
        intervalBadge: {
          padding: '7px 10px',
          height: '40px',
          fontSize: '12px',
          gap: '6px',
        },
        intervalButton: {
          width: '24px',
          height: '24px',
          fontSize: '12px',
        },
        intervalSpan: {
          minWidth: '70px',
        },
        roundTimeSlider: {
          width: '130px',
        },
        roundTimeLabel: {
          top: '-16px',
          fontSize: '10px',
        },
        buttonContainer: {
          width: '90%',
          gap: '5px',
        },
        button: {
          padding: '6px 10px',
          fontSize: '11px',
        },
        thumbDisplay: {
          width: '40px',
          height: '26px',
          fontSize: '14px',
        }
      };
    }
    
    // Extra small screens (xs) adjustments
    if (screenSize === 'xs') {
      styles = {
        ...styles,
        timerPanel: {
          padding: '16px 12px 12px', // Increased padding for better spacing
        },
        timerDisplay: {
          height: 'auto', // Auto height to accommodate content
          marginBottom: '14px', // Increased bottom margin for spacing
          gap: '14px', // Increased gap between items
          flexDirection: 'column',
          alignItems: 'center',
        },
        mainTimer: {
          fontSize: '42px', // Larger timer for better visibility
          letterSpacing: '1px',
          marginTop: '0px',
          marginBottom: '4px', // Add spacing below timer
          // Make timer extra bold and visible for collapsed state
          fontWeight: '800',
          textShadow: '0 0 15px rgba(255, 120, 60, 0.7), 0 2px 5px rgba(0, 0, 0, 0.8)',
          color: '#FFD480',
        },
        intervalBadge: {
          padding: '6px 10px',
          height: '36px', // Taller for better touch targets
          fontSize: '12px',
          gap: '6px',
          position: 'relative',
          top: '0', // No need to offset anymore with column layout
          width: '90%', // Wider to use more horizontal space
          maxWidth: '300px',
          margin: '0 auto',
          justifyContent: 'center', // Center contents
        },
        intervalButton: {
          width: '26px', // Larger buttons for touch
          height: '26px',
          fontSize: '12px',
        },
        intervalSpan: {
          minWidth: '70px',
          fontSize: '13px', // Slightly larger text
        },
        roundTimeSlider: {
          width: '90%', // Use most of the width
          maxWidth: '300px',
          marginTop: '4px',
          marginBottom: '8px', // Add margin below slider
          padding: '10px 0', // Add padding for larger touch area
        },
        roundTimeLabel: {
          top: '-12px',
          fontSize: '11px',
          textAlign: 'center',
          width: '100%',
        },
        buttonContainer: {
          width: '90%', // Use most of the screen width 
          flexDirection: 'column',
          gap: '8px', // More space between buttons
          margin: '4px auto 0', // Add top margin
        },
        button: {
          padding: '10px 12px', // Larger padding for better touch targets
          fontSize: '13px', // Larger text for visibility
          minHeight: '38px', // Taller buttons for touch
          borderRadius: '24px', // Rounder buttons
        },
        tickLabels: {
          visible: false, // Hide tick labels on smallest screens
        },
        thumbDisplay: {
          width: '44px', // Larger thumb for touch
          height: '30px',
          fontSize: '14px',
        }
      };
    }
    
    return styles;
  };
  
  // Get responsive styles
  const styles = getResponsiveStyles();

  return (
    <>
      {/* Custom Fire Slider Styles */}
      <FireSliderStyles />
      
      {/* Responsive styling for round-time-track elements */}
      <style>
        {`
          @media (max-width: ${theme.breakpoints.xs}) {
            .round-time-track .tick-30s,
            .round-time-track .tick-60s,
            .round-time-track .tick-120s {
              font-size: 8px;
            }
            
            .round-time-thumb-display {
              width: ${styles.thumbDisplay.width};
              height: ${styles.thumbDisplay.height};
              font-size: ${styles.thumbDisplay.fontSize};
            }
            
            .round-time-thumb-display::before {
              bottom: -12px;
              font-size: 10px;
            }
          }
        `}
      </style>
      
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
      
      {/* Mobile-only scroll indicator */}
      {getScreenSize() === 'xs' && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px', // Position just above the collapsed timer
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '8px',
            background: 'rgba(255, 120, 60, 0.5)',
            borderRadius: '4px',
            zIndex: 501,
            opacity: 0.7,
            animation: 'pulseUp 2s infinite ease-in-out',
          }}
        />
      )}
      <style>
        {`
          @keyframes pulseUp {
            0% { transform: translateX(-50%) scale(1); opacity: 0.5; }
            50% { transform: translateX(-50%) scale(1.2); opacity: 0.8; }
            100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
          }
        `}
      </style>
      
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
          padding: getScreenSize() === 'xs' ? '24px 12px 15px' : styles.timerPanel.padding,
          paddingTop: getScreenSize() === 'xs' ? '24px' : undefined, // Extra top padding for handle
          zIndex: 500,
          opacity: isFullScreen ? 0 : 1,
          transition: 'opacity 0.3s ease',
          background: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.9), rgba(30, 15, 8, 0.95))',
          pointerEvents: isFullScreen ? 'none' : 'auto',
          // Mobile view positioning and scrolling
          maxHeight: getScreenSize() === 'xs' ? '80vh' : 'auto', // Max height for mobile (80% of screen)
          height: getScreenSize() === 'xs' ? 'auto' : 'auto', // Auto height based on content
          overflowY: getScreenSize() === 'xs' ? 'auto' : 'visible', // Enable scrolling on small screens
          overscrollBehavior: 'contain', // Prevent scroll chaining
          // Ensure visible portion is at most 20% of viewport height initially
          transform: getScreenSize() === 'xs' ? 'translateY(calc(80% - 65px))' : 'none',
          transitionProperty: 'transform, opacity',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease-out',
          // Rounded corners for mobile view
          borderTopLeftRadius: getScreenSize() === 'xs' ? '16px' : '0',
          borderTopRightRadius: getScreenSize() === 'xs' ? '16px' : '0',
        }}
        // Mobile-specific behavior: reveal full panel on tap/click
        onClick={(e) => {
          if (getScreenSize() === 'xs' && e.target === e.currentTarget) {
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
        // Reset panel position on touch start inside the panel area
        onTouchStart={(e) => {
          if (getScreenSize() === 'xs' && e.target === e.currentTarget) {
            e.currentTarget.style.transform = 'translateY(0)';
          }
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
        {/* Drag handle for mobile */}
        {getScreenSize() === 'xs' && (
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '4px',
              backgroundColor: 'rgba(255, 120, 60, 0.5)',
              borderRadius: '2px',
              cursor: 'grab',
            }}
            onTouchStart={(e) => {
              const panel = e.currentTarget.parentElement;
              if (panel) {
                const startY = e.touches[0].clientY;
                const startTransform = panel.style.transform;
                
                // Get current translation value
                let currentTranslateY = 0;
                if (startTransform.includes('translateY')) {
                  const match = startTransform.match(/translateY\((.*?)\)/);
                  if (match && match[1]) {
                    if (match[1] === '0px' || match[1] === '0') {
                      currentTranslateY = 0;
                    } else {
                      // We have a complex calc expression, so we're in collapsed state
                      currentTranslateY = window.innerHeight * 0.8 - 65;
                    }
                  }
                }
                
                const handleTouchMove = (e) => {
                  const currentY = e.touches[0].clientY;
                  const deltaY = currentY - startY;
                  
                  // Calculate new position, constrained between 0 and 80% - 65px
                  const maxTranslateY = window.innerHeight * 0.8 - 65;
                  const newTranslateY = Math.max(0, Math.min(maxTranslateY, currentTranslateY + deltaY));
                  
                  panel.style.transform = `translateY(${newTranslateY}px)`;
                };
                
                const handleTouchEnd = () => {
                  // Snap to either fully open or fully collapsed
                  const rect = panel.getBoundingClientRect();
                  const currentHeight = window.innerHeight - rect.top;
                  const totalHeight = panel.scrollHeight;
                  
                  // If showing more than 40% of content, snap open, otherwise snap closed
                  if (currentHeight > totalHeight * 0.4) {
                    panel.style.transform = 'translateY(0)';
                  } else {
                    panel.style.transform = 'translateY(calc(80% - 65px))';
                  }
                  
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd);
              }
            }}
          />
        )}
        
        {/* Timer display - Main timer centered with interval and round time as "badges" */}
        <div 
          className="timer-display"
          style={{
            position: 'relative',
            height: styles.timerDisplay.height,
            marginBottom: styles.timerDisplay.marginBottom,
            display: 'flex',
            flexDirection: getScreenSize() === 'xs' ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: styles.timerDisplay.gap,
          }}>
          {/* Interval with integrated controls */}
          <div 
            className="interval-badge"
            style={{
              padding: styles.intervalBadge.padding,
              background: 'linear-gradient(135deg, rgba(255, 120, 60, 0.15), rgba(255, 80, 30, 0.1))',
              border: '1px solid rgba(255, 120, 60, 0.4)',
              borderRadius: '25px',
              fontSize: styles.intervalBadge.fontSize,
              color: 'rgba(255, 220, 160, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: getScreenSize() === 'xs' ? 'center' : 'flex-start',
              gap: styles.intervalBadge.gap,
              boxShadow: '0 2px 8px rgba(255, 120, 60, 0.2)',
              height: styles.intervalBadge.height,
              width: getScreenSize() === 'xs' ? styles.intervalBadge.width || 'auto' : 'auto',
              maxWidth: getScreenSize() === 'xs' ? styles.intervalBadge.maxWidth || 'none' : 'none',
              margin: getScreenSize() === 'xs' ? '0 auto' : 'initial',
              position: 'relative',
              top: styles.intervalBadge.top || '0',
            }}>
            <button
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
              style={{
                background: 'transparent',
                color: 'rgba(255, 180, 100, 0.8)',
                border: '1px solid rgba(255, 120, 60, 0.3)',
                borderRadius: '50%',
                width: styles.intervalButton.width,
                height: styles.intervalButton.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: styles.intervalButton.fontSize,
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 120, 60, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              -
            </button>
            <span style={{ minWidth: styles.intervalSpan.minWidth, textAlign: 'center' }}>
              {t('interval')}: {changeInterval}s
            </span>
            <button
              onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
              style={{
                background: 'transparent',
                color: 'rgba(255, 180, 100, 0.8)',
                border: '1px solid rgba(255, 120, 60, 0.3)',
                borderRadius: '50%',
                width: styles.intervalButton.width,
                height: styles.intervalButton.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: styles.intervalButton.fontSize,
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
            fontSize: styles.mainTimer.fontSize,
            fontWeight: 'bold',
            fontFamily: 'var(--font-display)',
            color: isActive ? 'rgba(255, 200, 100, 1)' : 'rgba(255, 150, 80, 0.9)',
            textAlign: 'center',
            textShadow: isActive ? '0 0 15px rgba(255, 120, 60, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)' : '0 2px 4px rgba(0, 0, 0, 0.7)',
            letterSpacing: styles.mainTimer.letterSpacing,
            lineHeight: '1.2',
            ...(getScreenSize() === 'xs' && { marginTop: '-6px', order: -1 }),
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
              width: styles.roundTimeSlider.width,
              marginTop: styles.roundTimeSlider.marginTop || '6px',
              marginBottom: styles.roundTimeSlider.marginBottom || '0',
              padding: styles.roundTimeSlider.padding || '0',
              maxWidth: getScreenSize() === 'xs' ? styles.roundTimeSlider.maxWidth || '240px' : 'none',
              ...(getScreenSize() === 'xs' && {
                background: 'rgba(40, 20, 10, 0.3)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 120, 60, 0.15)',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
              }),
            }}>
            {/* Simple label above slider */}
            <span className="round-time-label" style={{
              position: 'absolute',
              top: styles.roundTimeLabel.top,
              left: '0',
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: styles.roundTimeLabel.fontSize,
            }}>
              {t('roundTime')}
            </span>
            
            {/* Slider Container with Time Display */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: getScreenSize() === 'xs' ? '60px' : '60px', // Same height for all screen sizes for consistency
              display: 'flex',
              alignItems: 'center',
              paddingTop: getScreenSize() === 'xs' ? '10px' : '6px', // More padding for xs screens
              paddingBottom: getScreenSize() === 'xs' ? '10px' : '0', // Add bottom padding for xs
            }}>
              {/* Track with markers */}
              <div style={{ position: 'relative', width: '100%', height: '20px' }}>
                <div className="round-time-track">
                  {/* Adding tick labels as span elements for proper positioning */}
                  {styles.tickLabels.visible !== false && (
                    <>
                      <span className="tick-30s">30s</span>
                      <span className="tick-60s">1m</span>
                      <span className="tick-120s">2m</span>
                    </>
                  )}
                </div>
                
                {/* Custom track fill */}
                <div 
                  className="round-time-track-fill"
                  style={{
                    width: `${getRoundDurationPercentage(roundDuration)}%`,
                  }}
                ></div>
              </div>
              
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
                      
                      // Update position from current pointer position
                      // No need to track startX/startLeft as we calculate position directly
                      
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
                    
                    // Enhanced touch event handlers for better mobile experience
                    el.ontouchstart = (e) => {
                      // Don't prevent default scrolling on xs screens with scrollable container
                      if (getScreenSize() !== 'xs') {
                        e.preventDefault();
                      }
                      e.stopPropagation(); // Prevent event bubbling
                      
                      setIsRoundSliderActive(true);
                      
                      // Update visual feedback
                      el.classList.add('dragging');
                      
                      // Track initial position for better touch handling
                      const touchStartX = e.touches[0].clientX;
                      const startValue = roundDuration;
                      
                      // Create enhanced touch move handler with better precision
                      const handleTouchMove = (e) => {
                        e.stopPropagation();
                        
                        // On scrollable containers, prevent default only during active dragging
                        if (getScreenSize() === 'xs') {
                          e.preventDefault();
                        }
                        
                        // Update pointer position for the slider
                        updateFromPointer(e.touches[0].clientX);
                        
                        // Provide visual feedback during touch
                        el.style.transform = 'scale(0.96)';
                        
                        // Ensure timer panel doesn't scroll during dragging
                        const timerPanel = document.querySelector('.timer-panel');
                        if (timerPanel) {
                          timerPanel.style.overflowY = 'hidden';
                        }
                      };
                      
                      // Enhanced touch end handler
                      const handleTouchEnd = () => {
                        setIsRoundSliderActive(false);
                        el.classList.remove('dragging');
                        el.style.transform = '';
                        
                        // Re-enable scrolling on the timer panel
                        const timerPanel = document.querySelector('.timer-panel');
                        if (timerPanel) {
                          timerPanel.style.overflowY = getScreenSize() === 'xs' ? 'auto' : 'visible';
                        }
                        
                        document.removeEventListener('touchmove', handleTouchMove, { passive: false });
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      // Add global event listeners with passive: false to allow preventDefault
                      document.addEventListener('touchmove', handleTouchMove, { passive: false });
                      document.addEventListener('touchend', handleTouchEnd);
                    };
                    
                    // Also allow clicking directly on the track
                    const trackEl = getTrackElement();
                    if (trackEl) {
                      trackEl.onclick = (e) => {
                        updateFromPointer(e.clientX);
                      };
                      
                      // Add additional click area around the track
                      const container = el.parentElement;
                      if (container) {
                        // Clicking anywhere in the container will update the position
                        container.onclick = (e) => {
                          // Only handle clicks that weren't on the thumb itself
                          if (e.target !== el) {
                            updateFromPointer(e.clientX);
                          }
                        };
                      }
                    }
                  }
                }}
                style={{
                  left: `calc(${getRoundDurationPercentage(roundDuration)}% - 20px)`,
                  top: '0',
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
            flexDirection: getScreenSize() === 'xs' ? 'column' : 'row',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            gap: styles.buttonContainer.gap,
            width: styles.buttonContainer.width,
            margin: '0 auto',
          }}>
          <button 
            onClick={toggleActive}
            style={{
              padding: styles.button.padding,
              background: isActive ? 
                'linear-gradient(135deg, rgba(255, 60, 60, 0.8), rgba(200, 40, 40, 0.7))' : 
                'linear-gradient(135deg, rgba(255, 120, 60, 0.8), rgba(255, 80, 30, 0.7))',
              color: 'white',
              border: '1px solid rgba(255, 120, 60, 0.5)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: styles.button.fontSize,
              fontWeight: '600',
              flex: '1',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              minHeight: styles.button.minHeight,
            }}
          >
            {isActive ? t('pause') : t('resume')}
          </button>
          
          <button 
            onClick={getNextItem}
            style={{
              padding: styles.button.padding,
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.7))',
              color: 'rgba(255, 180, 100, 0.9)',
              border: '1px solid rgba(255, 120, 60, 0.3)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: styles.button.fontSize,
              fontWeight: '600',
              flex: '1',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              minHeight: styles.button.minHeight,
            }}
          >
            {t('nextItem')}
          </button>
          
          <button 
            onClick={handleResetRound}
            style={{
              padding: styles.button.padding,
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.7))',
              color: 'rgba(255, 180, 100, 0.9)',
              border: '1px solid rgba(255, 120, 60, 0.3)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: styles.button.fontSize,
              fontWeight: '600',
              flex: '1',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              minHeight: styles.button.minHeight,
            }}
          >
            {t('resetRound')}
          </button>
        </div>
      </div>
    </>
  );
};