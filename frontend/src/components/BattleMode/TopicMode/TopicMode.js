// components/TopicMode/TopicMode.js
import React from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

function TopicMode() {
  const numbers = [...Array(11).keys()];
  
  const {
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,
    isControlWindow,
    isFullScreen,
    fullScreenHandle,
    getNextItem,
    handleIntervalChange,
    handleRoundDurationChange,
    handleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  } = useTimerControl({
    defaultInterval: 15,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: numbers.length,
    channelName: 'topic-mode-channel',
  });

  const renderNumberDisplay = () => (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%', 
      height: isFullScreen ? '100vh' : '80vh', 
      position: 'relative' 
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '300px',
        height: '300px',
        border: '2px solid white',
        borderRadius: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        fontSize: '120px'
      }}>
        {numbers[currentIndex]}
      </div>
    </div>
  );

  return (
    <FullScreen handle={fullScreenHandle}>
      <div className={`number-mode ${isFullScreen ? 'fullscreen' : ''}`} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        height: '100vh', 
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        {!isControlWindow && (
          <>
            {renderNumberDisplay()}
            <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
              <button 
                onClick={openControlWindow}
                style={{
                  marginBottom: '10px',
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
                Open Control Panel
              </button>
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
                {isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              </button>
            </div>
          </>
        )}
        
        <TimerControls
          timer={timer}
          roundTimer={roundTimer}
          changeInterval={changeInterval}
          roundDuration={roundDuration}
          isActive={isActive}
          handleRoundDurationChange={handleRoundDurationChange}
          getNextItem={getNextItem}
          handleIntervalChange={handleIntervalChange}
          toggleActive={toggleActive}
          handleResetRound={handleResetRound}
          isControlWindow={isControlWindow}
          isFullScreen={isFullScreen}
        />
      </div>
    </FullScreen>
  );
}

export default TopicMode;