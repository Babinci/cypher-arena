// components/SharedControls/TimerControls.js
import React from 'react';

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
}) => (
  // Main control panel container
  // Note: overflow behavior differs between control window and main window
  // Control window shows full content, main window scrolls
  <div
    className="control-panel"
    style={{
      width: '100%',
      overflowY: isControlWindow ? 'visible' : 'auto',
      padding: '10px',
      boxSizing: 'border-box',
      maxHeight: isFullScreen ? 'auto' : '20vh',
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      position: isFullScreen ? 'fixed' : 'static',
      bottom: 0,
      left: 0,
      transition: 'opacity 0.3s ease-in-out',
      opacity: isFullScreen ? 0 : 1,
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
        Control Panel
      </h2>
    )}
   
    {/* Timer display section */}
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <div className="timer">Timer: {timer} seconds</div>
      <div>Interval: {changeInterval} seconds</div>
      <div>Round Duration: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
    </div>

    {/* Round duration slider */}
    <div style={{ marginBottom: '20px' }}>
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
      gap: '10px'
    }}>
      {/* Next Item button */}
      <button
        onClick={getNextItem}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFD700',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Next Item
      </button>
      
      {/* Decrease Interval button */}
      <button
        onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFD700',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Decrease Interval
      </button>
      
      {/* Increase Interval button */}
      <button
        onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFD700',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Increase Interval
      </button>
      
      {/* Pause/Resume button */}
      <button
        onClick={toggleActive}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFD700',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {isActive ? 'Pause' : 'Resume'}
      </button>
      
      {/* Reset Round button */}
      <button
        onClick={handleResetRound}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FFD700',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Reset Round
      </button>
    </div>
  </div>
);
