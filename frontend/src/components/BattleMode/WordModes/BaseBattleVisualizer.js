// BaseBattleVisualizer.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';
import { drawGradientRectangle } from './Gradient_Rectangle';
import { renderWordText } from './WordTextRenderer';
import useTranslation from '../../../config/useTranslation';

const BaseBattleVisualizer = ({ endpoint, fetchFunction, styleConfig }) => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { t } = useTranslation();

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
    defaultInterval: 35,
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
    // Fill with solid black background for maximum contrast with white text
    ctx.fillStyle = '#000000'; // Pure black for contrast
    ctx.fillRect(0, 0, width, height);
    
    const availableWidth = width;
    const availableHeight = height;
    // Remove unused topPadding variable
    const isMobileView = availableWidth <= 768;
    
    let maxWidth, maxHeight;
    
    // Set rectangle to use most of the screen
    // This should match the area used by text
    maxWidth = Math.min(availableWidth * 0.9, 1200);  
    maxHeight = Math.min(availableHeight * 0.8, 800);
    
    const borderRadius = Math.min(maxWidth, maxHeight) * 0.15;
    
    const centerX = availableWidth / 2;
    
    // Simple animation cycle for gradient effect
    const time = Date.now() / 15000; // Create time variable for gradient animation
    
    // Restore the subtle pulse animation from original code
    const pulseSize = Math.sin(time * 2) * 5;
    const animatedWidth = maxWidth + pulseSize;
    let animatedHeight = maxHeight + pulseSize;

    // Position rectangle with topPadding like in original code
    const topPadding = 20;
    let animatedY = topPadding;
    animatedHeight = Math.min(animatedHeight, maxHeight);
    animatedY = Math.max(topPadding, animatedY);
    
    const finalCenterY = animatedY + animatedHeight / 2;
    
    const animatedX = centerX - animatedWidth / 2;

    // Use the new rectangle drawing function
    drawGradientRectangle(ctx, {
      x: animatedX,
      y: animatedY,
      width: animatedWidth,
      height: animatedHeight,
      borderRadius,
      time // Pass time for gradient animation
    });

    // --- WORD WRAPPING LOGIC MOVED TO WordTextRenderer.js ---
    // Pass exact rectangle dimensions to ensure text fits properly
    renderWordText(ctx, {
      currentWord,
      rectangle: {
        x: animatedX,
        y: animatedY,
        width: animatedWidth,
        height: animatedHeight,
        centerX: centerX,
        centerY: finalCenterY
      },
      isMobileView: width < 768 // Force recalculation of mobile mode
    });
    // --- END WORD WRAPPING LOGIC ---

    animationRef.current = requestAnimationFrame(() => draw());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, styleConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isControlWindow) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      requestAnimationFrame(() => draw());
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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
          backgroundColor: '#333333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.05em',
          position: 'relative'
        }}
      >
        {t('openControlPanel')}
      </button>
      <button
        onClick={toggleFullScreen}
        style={{
          display: 'block',
          padding: '10px',
          backgroundColor: '#333333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.05em',
          position: 'relative'
        }}
      >
        {isFullScreen ? t('exitFullScreen') : t('enterFullScreen')}
      </button>
    </div>
  );

  return (
    <FullScreen handle={fullScreenHandle}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-deep)', // Use theme variable
        fontFamily: 'var(--font-display)' // Use theme font
      }}>
        {!isControlWindow && (
          <>
            <div style={{
              flex: 1,
              position: 'relative',
              minHeight: 0,
              width: '100%'
            }}>
              <canvas 
                ref={canvasRef} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  width: '100%',
                  height: '100%'
                }} 
              />
            </div>
            {renderControlButtons()}
          </>
        )}
        <div 
          style={{ 
            flexShrink: 0
          }}
        >
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