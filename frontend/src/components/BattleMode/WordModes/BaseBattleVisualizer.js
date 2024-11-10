// BaseBattleVisualizer.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

const BaseBattleVisualizer = ({ endpoint, fetchFunction }) => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

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
    defaultInterval: 10,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: words.length,
    onNextItem: () => {
      if (currentIndex >= words.length - 5) {
        fetchWords();
      }
    },
  });

  const fetchWords = useCallback(() => {
    (fetchFunction || fetch)(endpoint)
      .then(response => {
        if (!fetchFunction) return response.json();
        return response;
      })
      .then(data => {
        setWords(data.words);
        setCurrentWord(data.words[0]);
      })
      .catch(error => console.error('Error fetching words:', error));
  }, [endpoint, fetchFunction]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[currentIndex]);
    }
  }, [currentIndex, words]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
  
    const centerX = width / 2;
    // Adjust centerY to account for controls height
    const centerY = (height - 100) / 2;  // 100px is approximate controls height
    const maxRadius = Math.min(width, height - 100) * 0.45; // Increased from 0.35 to 0.45 and accounting for controls
    const time = Date.now() / 15000;
  
    const innerColor = `hsla(${(time * 30) % 360}, 50%, 60%, 1)`;
    const midColor = `hsla(${((time * 30) + 30) % 360}, 50%, 65%, 1)`;
    const outerColor = `hsla(${((time * 30) + 60) % 360}, 50%, 70%, 1)`;
  
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.5, innerColor);
    gradient.addColorStop(0.8, midColor);
    gradient.addColorStop(1, outerColor);
  
    ctx.beginPath();
    const radiusOffset = Math.sin(time * 2) * 2;
    ctx.arc(centerX, centerY, maxRadius + radiusOffset, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    const lines = currentWord.split('\n');
    
    if (lines.length === 1) {
      let fontSize = maxRadius / 2.5; // Increased from 3 to 2.5 for bigger text
      ctx.font = `bold ${fontSize}px Arial`;
      
      let textWidth = ctx.measureText(currentWord).width;
      if (textWidth > maxRadius * 1.5) {
        fontSize *= (maxRadius * 1.5) / textWidth;
        ctx.font = `bold ${fontSize}px Arial`;
      }
      
      ctx.fillText(currentWord, centerX, centerY);
    } else {
      let fontSize = maxRadius / (1.5 + lines.length * 0.5); // Adjusted for bigger text
      ctx.font = `bold ${fontSize}px Arial`;
      
      const lineHeight = fontSize * 1.2;
      const totalHeight = lineHeight * lines.length;
      const startY = centerY - (totalHeight / 2) + (lineHeight / 2);
      
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        ctx.fillText(line, centerX, y);
      });
    }
  
    animationRef.current = requestAnimationFrame(draw);
  }, [currentWord]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isControlWindow) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - (isFullScreen ? 0 : 100);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw, isControlWindow, isFullScreen]);

  const renderControlButtons = () => (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isFullScreen ? 0 : 1,
      }}
      onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
    >
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
  );

  return (
    <FullScreen handle={fullScreenHandle}>
      <div style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a'
      }}>
        {!isControlWindow && (
          <>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
            {renderControlButtons()}
          </>
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
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
      </div>
    </FullScreen>
  );
};

export default BaseBattleVisualizer;