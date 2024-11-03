import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import apiConfig from '../../../config/apiConfig';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

function FreestyleBattleVisualizer() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize timer control with word-specific configuration
  const {
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,  // This was causing double increments
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
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`)
      .then(response => response.json())
      .then(data => {
        setWords(data.words);
        // Fix: Set initial word without using modulo
        setCurrentWord(data.words[0]);
      })
      .catch(error => console.error('Error fetching words:', error));
  }, []); 

  // Initial words fetch
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Update current word when index changes
  useEffect(() => {
    if (words.length > 0) {
      // Fix: Directly use currentIndex without modulo
      setCurrentWord(words[currentIndex]);
    }
  }, [currentIndex, words]);

  // Canvas animation
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
  
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;
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
    let fontSize = maxRadius / 3;
    ctx.font = `bold ${fontSize}px Arial`;
  
    let textWidth = ctx.measureText(currentWord).width;
    if (textWidth > maxRadius * 1.5) {
      fontSize *= (maxRadius * 1.5) / textWidth;
      ctx.font = `bold ${fontSize}px Arial`;
    }
  
    ctx.fillText(currentWord, centerX, centerY - fontSize / 4);
    ctx.font = `${fontSize * 0.5}px Arial`;
    ctx.fillText(timer, centerX, centerY + fontSize / 2);
  
    animationRef.current = requestAnimationFrame(draw);
  }, [currentWord, timer]);

  // Canvas setup and animation
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

  // Render control buttons for fullscreen and control panel
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
}

export default FreestyleBattleVisualizer;