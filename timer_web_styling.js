import { useState } from 'react';

// Mock theme and translation for demonstration
const theme = {
  colors: {
    fire: {
      border: '#FF784C',
      accent: '#FFA050',
      medium: '#FF9C60',
      highlight: '#FFEFB0',
    }
  },
  dimensions: {
    timer: {
      padding: '20px',
      height: '80px',
      badgeHeight: '36px',
      fontSize: '42px',
      buttonFontSize: '14px',
    },
    sliders: {
      width: '200px',
      height: '20px',
      thumbSize: '20px',
    }
  },
  animation: {
    fast: '0.2s',
    medium: '0.3s',
    easing: {
      default: 'ease-out',
    }
  },
  gradients: {
    fire: {
      panel: 'linear-gradient(to bottom, rgba(40, 20, 10, 0.9), rgba(30, 15, 8, 0.95))',
      badge: 'linear-gradient(to bottom, rgba(50, 25, 15, 0.7), rgba(40, 20, 10, 0.8))',
      button: 'linear-gradient(to bottom, rgba(60, 30, 15, 0.6), rgba(40, 20, 10, 0.7))',
      active: 'linear-gradient(to bottom, rgba(255, 100, 50, 0.8), rgba(200, 80, 30, 0.9))',
      inactive: 'linear-gradient(to bottom, rgba(100, 50, 30, 0.6), rgba(70, 35, 20, 0.7))'
    }
  },
  shadows: {
    glow: {
      fire: '0 0 10px rgba(255, 180, 100, 0.7), 0 0 20px rgba(255, 140, 60, 0.5)'
    }
  },
  fonts: {
    display: '"Montserrat", sans-serif'
  },
  zIndices: {
    timerPanel: 100
  }
};

// Mock translation function
const useTranslation = () => ({
  t: (key) => {
    const translations = {
      interval: 'Interval',
      roundTime: 'Round Time',
      pause: 'Pause',
      resume: 'Resume',
      nextItem: 'Next Item',
      resetRound: 'Reset Round',
      roundDuration: 'Round Duration'
    };
    return translations[key] || key;
  }
});

const TimerPanel = ({ isFullScreen, children, onMouseEnter, onMouseLeave }) => (
  <div 
    className={`fixed bottom-0 left-0 right-0 w-full p-5 z-50 transition-opacity duration-300 ease-out ${isFullScreen ? 'opacity-20' : 'opacity-100'}`}
    style={{
      background: theme.gradients.fire.panel,
      borderTop: `1px solid ${theme.colors.fire.border}`,
      boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.7)',
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </div>
);

const TimerDisplay = ({ children }) => (
  <div 
    className="relative flex flex-row items-center justify-center gap-8 mb-4"
    style={{ height: theme.dimensions.timer.height }}
  >
    {children}
  </div>
);

const IntervalBadge = ({ children }) => (
  <div 
    className="flex items-center gap-2 py-2 px-4 rounded-3xl text-sm"
    style={{
      background: theme.gradients.fire.badge,
      border: `1px solid ${theme.colors.fire.border}`,
      color: theme.colors.fire.accent,
      boxShadow: '0 2px 8px rgba(255, 120, 60, 0.2)',
      height: theme.dimensions.timer.badgeHeight
    }}
  >
    {children}
  </div>
);

const IntervalButton = ({ onClick, children }) => (
  <button
    className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold transition-all duration-200 ease-out"
    style={{
      background: 'transparent',
      color: theme.colors.fire.medium,
      border: '1px solid rgba(255, 120, 60, 0.3)',
    }}
    onClick={onClick}
  >
    {children}
  </button>
);

const MainTimer = ({ isActive, children }) => (
  <div
    className="text-center font-bold"
    style={{
      fontSize: theme.dimensions.timer.fontSize,
      fontFamily: theme.fonts.display,
      color: isActive ? theme.colors.fire.highlight : theme.colors.fire.medium,
      textShadow: isActive ? theme.shadows.glow.fire : '0 2px 4px rgba(0, 0, 0, 0.7)',
      letterSpacing: '2px',
      lineHeight: 1.2,
    }}
  >
    {children}
  </div>
);

const TimerDemo = () => {
  // Demo state
  const [timer, setTimer] = useState('01:45');
  const [roundTimer, setRoundTimer] = useState(120);
  const [changeInterval, setChangeInterval] = useState(30);
  const [roundDuration, setRoundDuration] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const handleIntervalChange = (value) => {
    setChangeInterval(value);
  };
  
  const handleRoundDurationChange = (value) => {
    setRoundDuration(value);
    if (value !== Infinity) {
      setRoundTimer(value);
    }
  };
  
  const toggleActive = () => {
    setIsActive(!isActive);
  };
  
  const getNextItem = () => {
    // Demo function
    alert('Next item clicked');
  };
  
  const handleResetRound = () => {
    // Demo function
    setRoundTimer(roundDuration === Infinity ? 120 : roundDuration);
    setTimer('01:45');
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Custom slider styling */}
      <style>{`
        .fire-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, rgba(217, 119, 6, 0.9), rgba(146, 64, 14, 0.3));
          border-radius: 2px;
          outline: none;
        }
        
        .fire-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(217, 119, 6, 0.8));
          border: 2px solid rgba(217, 119, 6, 0.8);
          box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        
        .fire-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(217, 119, 6, 0.8));
          border: 2px solid rgba(217, 119, 6, 0.8);
          box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
      `}</style>
      
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-bold mb-6 text-orange-200">Fire-Themed Timer Controls</h1>
        <p className="text-orange-200 mb-4">This is a demonstration of the timer component with fire styling</p>
        <button 
          className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          onClick={toggleFullScreen}
        >
          Toggle {isFullScreen ? 'Normal' : 'Fullscreen'} Mode
        </button>
      </div>
      
      {/* Main application area */}
      <div className="flex-1 w-full flex items-center justify-center">
        {isFullScreen ? (
          <div className="text-4xl text-orange-200">
            Fullscreen Content Area
          </div>
        ) : (
          <div className="text-xl text-orange-200">
            Normal Content Area
          </div>
        )}
      </div>
      
      {/* Timer Control Panel */}
      <TimerPanel 
        isFullScreen={isFullScreen}
        onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0.2')}
      >
        <TimerDisplay>
          {/* Interval with integrated controls */}
          <IntervalBadge>
            <IntervalButton
              onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
            >
              -
            </IntervalButton>
            <span className="min-w-20 text-center">
              Interval: {changeInterval}s
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

          {/* Round Time control */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center min-w-20">
              <span className="text-xs text-orange-300 mb-1">
                Round Time
              </span>
              <span className="text-xl font-bold text-orange-400">
                {roundDuration === Infinity ? '∞' : `${roundTimer}s`}
              </span>
            </div>
            
            <div className="relative w-48 h-10 flex items-center">
              <input
                type="range"
                min="10"
                max="300"
                value={roundDuration === Infinity ? 300 : roundDuration}
                onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
                className="fire-slider"
              />
              
              <button
                className={`absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-base font-bold
                  ${roundDuration === Infinity ? 
                    'bg-amber-800/80 text-amber-200 border-2 border-amber-600 shadow-lg shadow-orange-700/50' : 
                    'bg-amber-950/80 text-amber-500/90 border border-orange-700/50 hover:bg-amber-900/80'}`}
                onClick={() => handleRoundDurationChange(Infinity)}
              >
                ∞
              </button>
            </div>
          </div>
        </TimerDisplay>
        
        {/* Control buttons */}
        <div className="flex flex-wrap justify-center gap-2 w-4/5 mx-auto">
          <button 
            className={`px-4 py-2 rounded-2xl text-white border border-orange-500/50 shadow-md flex-1 font-semibold transition-all duration-200
              ${isActive ? 
                'bg-gradient-to-b from-orange-500/80 to-orange-700/90' : 
                'bg-gradient-to-b from-orange-800/60 to-orange-900/70'}`}
            onClick={toggleActive}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
          
          <button 
            className="px-4 py-2 rounded-2xl text-orange-300 border border-orange-500/30 shadow-md bg-gradient-to-b from-orange-900/60 to-orange-950/70 flex-1 font-semibold transition-all duration-200"
            onClick={getNextItem}
          >
            Next Item
          </button>
          
          <button 
            className="px-4 py-2 rounded-2xl text-orange-300 border border-orange-500/30 shadow-md bg-gradient-to-b from-orange-900/60 to-orange-950/70 flex-1 font-semibold transition-all duration-200"
            onClick={handleResetRound}
          >
            Reset Round
          </button>
        </div>
      </TimerPanel>
    </div>
  );
};

export default TimerDemo;