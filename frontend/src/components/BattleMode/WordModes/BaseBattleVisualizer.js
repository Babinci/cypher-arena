// BaseBattleVisualizer.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';
import { drawGradientRectangle } from './Gradient_Rectangle';
import { renderWordText } from './WordTextRenderer';
import { drawFireSmokeBackground, FireSmokeParticleSystem, renderFireSmokeText } from './FireSmokeVisualizer';
// import { renderWordText } from './WordTextRendererDebug'; // Using debug version
// import { renderWordText } from './WordTextRendererClean'; // Using clean version
// import { renderWordText } from './WordTextRendererLarge'; // Using large version
// import { renderWordText } from './WordTextRendererFixed'; // Using fixed version
import useTranslation from '../../../config/useTranslation';
// Temporarily removed font imports for debugging

const BaseBattleVisualizer = ({ endpoint, fetchFunction, styleConfig, visualMode = 'rectangle' }) => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particleSystemRef = useRef(null);
  // const [fontLoaded, setFontLoaded] = useState(false); // Removed for debugging
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
  
  // Initialize particle system when switching to fire mode
  useEffect(() => {
    if (visualMode === 'fire') {
      const canvas = canvasRef.current;
      if (canvas && !particleSystemRef.current) {
        particleSystemRef.current = new FireSmokeParticleSystem(canvas.width, canvas.height);
      }
    }
  }, [visualMode]);

  // Removed font loading effect for debugging

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
  
    ctx.clearRect(0, 0, width, height);
    
    const availableWidth = width;
    const availableHeight = height;
    const isMobileView = availableWidth <= 768;
    
    let maxWidth, maxHeight;
    
    // Set dimensions for text area
    maxWidth = Math.min(availableWidth * 0.9, 1200);  
    maxHeight = Math.min(availableHeight * 0.85, 900);
    
    const centerX = availableWidth / 2;
    const time = Date.now() / 15000; // Time for animations
    
    // Choose visualization based on mode
    if (visualMode === 'fire') {
      // Initialize particle system if needed
      if (!particleSystemRef.current) {
        particleSystemRef.current = new FireSmokeParticleSystem(width, height);
      }
      
      // Draw fire/smoke background
      drawFireSmokeBackground(ctx, {
        x: 0,
        y: 0,
        width: width,
        height: height,
        time: time,
        particleSystem: particleSystemRef.current
      });
      
      // Render text with fire effect
      if (currentWord) {
        renderFireSmokeText(ctx, {
          currentWord,
          rectangle: {
            x: centerX - maxWidth / 2,
            y: (height - maxHeight) / 2,
            width: maxWidth,
            height: maxHeight,
            centerX: centerX,
            centerY: height / 2
          },
          isMobileView: isMobileView
        });
      }
    } else {
      // Default rectangle mode
      // Fill with solid black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      const borderRadius = Math.min(maxWidth, maxHeight) * 0.15;
      
      // Subtle pulse animation
      const pulseSize = Math.sin(time * 2) * 5;
      const animatedWidth = maxWidth + pulseSize;
      let animatedHeight = maxHeight + pulseSize;
      
      // Position rectangle
      const topPadding = 15;
      let animatedY = topPadding;
      animatedHeight = Math.min(animatedHeight, maxHeight);
      animatedY = Math.max(topPadding, animatedY);
      
      const finalCenterY = animatedY + animatedHeight / 2;
      const animatedX = centerX - animatedWidth / 2;
      
      // Draw gradient rectangle
      drawGradientRectangle(ctx, {
        x: animatedX,
        y: animatedY,
        width: animatedWidth,
        height: animatedHeight,
        borderRadius,
        time: time
      });
      
      // Render text on rectangle
      if (currentWord) {
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
          isMobileView: width < 768
        });
      }
    }

    animationRef.current = requestAnimationFrame(() => draw());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, styleConfig, visualMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isControlWindow) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Update particle system dimensions if in fire mode
      if (visualMode === 'fire' && particleSystemRef.current) {
        particleSystemRef.current.updateDimensions(canvas.width, canvas.height);
      }
      
      requestAnimationFrame(() => draw());
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw, isControlWindow, isFullScreen, visualMode]);

  const renderControlButtons = () => (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 500,
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
                  height: '100%',
                  zIndex: 10 // Add explicit z-index to ensure it's below the back button but above background
                }} 
              />
            </div>
            {renderControlButtons()}
          </>
        )}
        
        {/* Timer controls now float above content instead of being in flex layout */}
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
};

export default BaseBattleVisualizer;