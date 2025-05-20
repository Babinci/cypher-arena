// components/BattleMode/SharedControls/StyledTimerControls.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useTranslation from '../../../config/useTranslation';
import theme from '../../../config/theme';
import FireSliderStyles from './FireSliderStyles';
import '../../../cypher-theme.css';
import '../../../fire-theme.css';

// Styled Components
const TimerPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: ${props => theme.gradients.fire.panel};
  border-top: 1px solid ${props => theme.colors.fire.border};
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.7);
  padding: ${props => theme.dimensions.timer.padding};
  z-index: ${props => theme.zIndices.timerPanel};
  opacity: ${props => props.isFullScreen ? 0 : 1};
  transition: opacity ${props => theme.animation.medium} ${props => theme.animation.easing.default};
  pointer-events: ${props => props.isFullScreen ? 'none' : 'auto'};
`;

const TimerDisplay = styled.div`
  position: relative;
  height: ${props => theme.dimensions.timer.height};
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 30px;
`;

const IntervalBadge = styled.div`
  padding: 2px 4px;
  background: ${props => theme.gradients.fire.badge};
  border: 1px solid ${props => theme.colors.fire.border};
  border-radius: 25px;
  font-size: 14px;
  color: ${props => theme.colors.fire.accent};
  display: flex;
  align-items: center;
  gap: 2px;
  box-shadow: 0 2px 8px rgba(255, 120, 60, 0.2);
  height: ${props => theme.dimensions.timer.badgeHeight};
`;

const IntervalButton = styled.button`
  background: transparent;
  color: ${props => theme.colors.fire.medium};
  border: 1px solid rgba(255, 120, 60, 0.3);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all ${props => theme.animation.fast} ${props => theme.animation.easing.default};

  &:hover {
    background: rgba(255, 120, 60, 0.2);
  }
`;

const MainTimer = styled.div`
  font-size: ${props => theme.dimensions.timer.fontSize};
  font-weight: bold;
  font-family: ${props => theme.fonts.display};
  color: ${props => props.isActive ? theme.colors.fire.highlight : theme.colors.fire.medium};
  text-align: center;
  text-shadow: ${props => 
    props.isActive ? theme.shadows.glow.fire : '0 2px 4px rgba(0, 0, 0, 0.7)'};
  letter-spacing: 2px;
  line-height: 1.2;
`;

const RoundTimeSliderControl = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const RoundTimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
`;

const RoundTimeLabel = styled.span`
  font-size: 12px;
  color: ${props => theme.colors.fire.medium};
  margin-bottom: 3px;
`;

const RoundTimeValue = styled.span`
  font-size: 22px;
  font-weight: bold;
  color: ${props => theme.colors.fire.accent};
  font-family: ${props => theme.fonts.display};
`;

const SliderContainer = styled.div`
  position: relative;
  width: ${props => theme.dimensions.sliders.width};
  height: 40px;
  display: flex;
  align-items: center;
`;

// Use classnames instead of styled button for infinity button
const InfinityButton = styled.button`
  position: absolute;
  right: -45px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const TimerButtonsContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
  width: 70%;
  margin: 0 auto;
`;

const BaseButton = styled.button`
  padding: 8px 16px;
  color: ${props => theme.colors.fire.accent};
  border: 1px solid rgba(255, 120, 60, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-family: ${props => theme.fonts.display};
  font-size: ${props => theme.dimensions.timer.buttonFontSize};
  font-weight: 600;
  flex: 1;
  transition: all ${props => theme.animation.fast} ${props => theme.animation.easing.default};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
`;

const ActionButton = styled(BaseButton)`
  background: ${props => props.isActive ? 
    theme.gradients.fire.active : 
    theme.gradients.fire.inactive};
  color: white;
  border: 1px solid rgba(255, 120, 60, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
`;

const ControlButton = styled(BaseButton)`
  background: ${props => theme.gradients.fire.button};
`;

// Import the fire slider styles
const SliderStyles = FireSliderStyles;

// TimerControls: A reusable component that renders the control panel UI using styled-components
export const StyledTimerControls = ({
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

  return (
    <>
      {/* Custom Slider Styles */}
      <style>{SliderStyles}</style>
      
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
            const timerPanel = document.querySelector('[class^="StyledTimerControls__TimerPanel"]');
            if (timerPanel) {
              timerPanel.style.opacity = '1';
              timerPanel.style.pointerEvents = 'auto';
            }
          }}
          onMouseMove={(e) => {
            // Also respond to mouse movement in the hover area
            const timerPanel = document.querySelector('[class^="StyledTimerControls__TimerPanel"]');
            if (timerPanel && e.clientY > window.innerHeight - 120) {
              timerPanel.style.opacity = '1';
              timerPanel.style.pointerEvents = 'auto';
            }
          }}
          onMouseLeave={(e) => {
            if (isFullScreen) {
              // Hide timer if mouse goes above the detection area
              const timerPanel = document.querySelector('[class^="StyledTimerControls__TimerPanel"]');
              if (timerPanel) {
                timerPanel.style.opacity = '0';
                timerPanel.style.pointerEvents = 'none';
              }
            }
          }}
        />
      )}
      
      {/* Main timer panel - Full Width Fixed at Bottom */}
      <TimerPanel 
        isFullScreen={isFullScreen}
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
        <TimerDisplay>
          {/* Interval with integrated controls */}
          <IntervalBadge className="interval-badge">
            <IntervalButton
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
            >
              -
            </IntervalButton>
            <span style={{ minWidth: '80px', textAlign: 'center' }}>
              {t('interval')}: {changeInterval}s
            </span>
            <IntervalButton
              onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
            >
              +
            </IntervalButton>
          </IntervalBadge>

          {/* Main Timer centered */}
          <MainTimer isActive={isActive}>
            {timer}
          </MainTimer>

          {/* Unified Round Time Slider */}
          <RoundTimeSliderControl style={{ width: '180px', marginTop: '6px' }}>
            {/* Small label above slider */}
            <RoundTimeLabel className="round-time-label" style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              width: '100%',
              textAlign: 'center',
            }}>
              {t('roundTime')}
            </RoundTimeLabel>
            
            {/* Slider Container with Time Display */}
            <SliderContainer style={{ width: '100%', height: '46px', paddingTop: '6px' }}>
              {/* Simple track for visual indication only */}
              <div className="round-time-track"></div>
              
              {/* Custom track fill */}
              <div 
                className="round-time-track-fill"
                style={{
                  width: `${(roundDuration === Infinity ? 100 : (roundDuration - 10) / 290 * 100)}%`,
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
                    
                    // Calculate and set slider value from pointer position
                    const updateFromPointer = (clientX) => {
                      const trackEl = getTrackElement();
                      if (!trackEl) return;
                      
                      const rect = trackEl.getBoundingClientRect();
                      const thumbWidth = el.offsetWidth;
                      
                      // Calculate x position relative to track, accounting for thumb width
                      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                      const ratio = x / rect.width;
                      
                      // Update the slider value (10-300 range)
                      const newValue = Math.round(10 + ratio * 290);
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
                  left: `calc(${(roundDuration === Infinity ? 100 : (roundDuration - 10) / 290 * 100)}% - 20px)`,
                  top: '-18px',
                  cursor: 'grab',
                }}
              >
                {roundDuration === Infinity ? '∞' : roundTimer}
              </div>
            </SliderContainer>
          </RoundTimeSliderControl>
        </TimerDisplay>
        
        {/* Control buttons - fire-themed */}
        <TimerButtonsContainer>
          <ActionButton 
            isActive={isActive}
            onClick={toggleActive}
          >
            {isActive ? t('pause') : t('resume')}
          </ActionButton>
          
          <ControlButton 
            onClick={getNextItem}
          >
            {t('nextItem')}
          </ControlButton>
          
          <ControlButton 
            onClick={handleResetRound}
          >
            {t('resetRound')}
          </ControlButton>
        </TimerButtonsContainer>
      </TimerPanel>
    </>
  );
};