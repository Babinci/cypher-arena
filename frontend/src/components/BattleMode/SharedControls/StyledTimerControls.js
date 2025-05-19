// components/BattleMode/SharedControls/StyledTimerControls.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useTranslation from '../../../config/useTranslation';
import theme from '../../../config/theme';
import '../../../cypher-theme.css';

// Styled Components
const TimerPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: rgba(10, 10, 10, 0.85);
  border-top: 1px solid ${props => theme.colors.fire.border};
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.7);
  padding: ${props => theme.dimensions.timer.padding};
  z-index: ${props => theme.zIndices.timerPanel};
  opacity: ${props => props.isFullScreen ? 0.2 : 1};
  transition: opacity ${props => theme.animation.medium} ${props => theme.animation.easing.default};
  background: ${props => theme.gradients.fire.panel};
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
  padding: 10px 14px;
  background: ${props => theme.gradients.fire.badge};
  border: 1px solid ${props => theme.colors.fire.border};
  border-radius: 25px;
  font-size: 14px;
  color: ${props => theme.colors.fire.accent};
  display: flex;
  align-items: center;
  gap: 8px;
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

const InfinityButton = styled.button`
  position: absolute;
  right: -45px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${props => props.isActive ? 'rgba(255, 160, 80, 0.5)' : 'rgba(40, 40, 40, 0.6)'};
  color: ${props => props.isActive ? 'rgba(255, 240, 180, 1)' : 'rgba(255, 180, 100, 0.7)'};
  border: ${props => props.isActive ? '2px solid rgba(255, 180, 100, 0.8)' : '1px solid rgba(255, 120, 60, 0.3)'};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => theme.animation.fast} ${props => theme.animation.easing.default};
  box-shadow: ${props => props.isActive ? '0 0 8px rgba(255, 160, 80, 0.5)' : 'none'};

  &:hover {
    background: ${props => !props.isActive && 'rgba(60, 60, 60, 0.7)'};
  }
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

// Custom slider styles
const SliderStyles = `
  .round-time-slider {
    width: 100%;
    height: ${theme.dimensions.sliders.height};
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    z-index: 10;
    outline: none;
  }
  
  /* Track styles */
  .round-time-slider::-webkit-slider-track {
    width: 100%;
    height: 4px;
    background: transparent;
    border-radius: 2px;
    border: none;
  }
  
  .round-time-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: transparent;
    border-radius: 2px;
    border: none;
  }
  
  /* Thumb styles */
  .round-time-slider::-webkit-slider-thumb {
    appearance: none;
    width: ${theme.dimensions.sliders.thumbSize};
    height: ${theme.dimensions.sliders.thumbSize};
    background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(255, 140, 70, 0.8));
    border: 2px solid rgba(255, 180, 100, 0.8);
    border-radius: 50%;
    cursor: pointer;
    margin-top: -8px;
    box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .round-time-slider::-moz-range-thumb {
    width: ${theme.dimensions.sliders.thumbSize};
    height: ${theme.dimensions.sliders.thumbSize};
    background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(255, 140, 70, 0.8));
    border: 2px solid rgba(255, 180, 100, 0.8);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .round-time-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(255, 160, 80, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4);
  }
  
  .round-time-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(255, 160, 80, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4);
  }
  
  .round-time-slider:active::-webkit-slider-thumb {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(255, 180, 100, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .round-time-slider:active::-moz-range-thumb {
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(255, 180, 100, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  /* Progress fill effect */
  .round-time-slider::-webkit-slider-runnable-track {
    background: linear-gradient(to right, 
      rgba(255, 160, 80, 0.8) 0%, 
      rgba(255, 160, 80, 0.8) var(--value), 
      transparent var(--value), 
      transparent 100%);
  }
  
  .round-time-slider::-moz-range-progress {
    background: linear-gradient(90deg, rgba(255, 120, 60, 0.6), rgba(255, 160, 80, 0.9));
    height: 4px;
    border-radius: 2px;
  }
  
  .round-time-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: transparent;
    border-radius: 2px;
    border: none;
  }
`;

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
      
      {/* Main timer panel - Full Width Fixed at Bottom */}
      <TimerPanel 
        isFullScreen={isFullScreen}
        onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0.2')}
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

          {/* Round Time with Line Slider */}
          <RoundTimeSliderControl>
            {/* Round Time Display */}
            <RoundTimeDisplay className="roundtime-badge">
              <RoundTimeLabel>
                {t('roundTime')}
              </RoundTimeLabel>
              <RoundTimeValue>
                {roundDuration === Infinity ? '∞' : `${roundTimer}s`}
              </RoundTimeValue>
            </RoundTimeDisplay>
            
            {/* Line Slider Container */}
            <SliderContainer>
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
                  '--value': `${(roundDuration === Infinity ? 100 : (roundDuration - 10) / 290 * 100)}%`,
                }}
                className="round-time-slider"
              />
              
              {/* Infinity button at the end */}
              <InfinityButton
                isActive={roundDuration === Infinity}
                onClick={() => {
                  handleRoundDurationChange(Infinity);
                  setIsRoundSliderActive(false);
                }}
              >
                ∞
              </InfinityButton>
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