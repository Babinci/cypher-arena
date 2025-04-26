// BaseBattleVisualizer.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

const BaseBattleVisualizer = ({ endpoint, fetchFunction, styleConfig }) => {
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
    
    const controlsApproxHeight = 120;
    const availableHeight = height - (isFullScreen ? 0 : controlsApproxHeight);
    const availableWidth = width;
    
    const isMobileView = availableWidth <= 768;
    
    let maxWidth, maxHeight;
    
    if (isMobileView) {
      maxWidth = availableWidth * 0.9;
    } else {
      maxWidth = Math.min(availableWidth * 0.75, 800);
    }
    
    maxHeight = Math.min(availableHeight * 0.85, 600);
    
    const borderRadius = Math.min(maxWidth, maxHeight) * 0.15;
    
    const centerX = availableWidth / 2;
    
    const topPadding = 20;
    const idealCenterY = availableHeight / 2;

    const time = Date.now() / 15000;
    const pulseSize = Math.sin(time * 2) * 5;
    const animatedWidth = maxWidth + pulseSize;
    let animatedHeight = maxHeight + pulseSize;

    let animatedY = idealCenterY - animatedHeight / 2;

    animatedY = Math.max(topPadding, animatedY);

    if (!isFullScreen) {
      const bottomLimit = availableHeight - topPadding;
      if (animatedY + animatedHeight > bottomLimit) {
        animatedHeight = bottomLimit - animatedY;
      }
    }

    animatedY = Math.max(topPadding, animatedY);
    const finalCenterY = animatedY + animatedHeight / 2;
    
    const animatedX = centerX - animatedWidth / 2;
    
    const innerColor = `hsla(${(time * 30) % 360}, 50%, 60%, 1)`;
    const midColor = `hsla(${((time * 30) + 30) % 360}, 50%, 65%, 1)`;
    const outerColor = `hsla(${((time * 30) + 60) % 360}, 50%, 70%, 1)`;
    const gradient = ctx.createLinearGradient(animatedX, animatedY, animatedX + animatedWidth, animatedY + animatedHeight);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.4, innerColor);
    gradient.addColorStop(0.7, midColor);
    gradient.addColorStop(1, outerColor);
    
    ctx.beginPath();
    ctx.moveTo(animatedX + borderRadius, animatedY);
    ctx.lineTo(animatedX + animatedWidth - borderRadius, animatedY);
    ctx.quadraticCurveTo(animatedX + animatedWidth, animatedY, animatedX + animatedWidth, animatedY + borderRadius);
    ctx.lineTo(animatedX + animatedWidth, animatedY + animatedHeight - borderRadius);
    ctx.quadraticCurveTo(animatedX + animatedWidth, animatedY + animatedHeight, animatedX + animatedWidth - borderRadius, animatedY + animatedHeight);
    ctx.lineTo(animatedX + borderRadius, animatedY + animatedHeight);
    ctx.quadraticCurveTo(animatedX, animatedY + animatedHeight, animatedX, animatedY + animatedHeight - borderRadius);
    ctx.lineTo(animatedX, animatedY + borderRadius);
    ctx.quadraticCurveTo(animatedX, animatedY, animatedX + borderRadius, animatedY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    const lines = currentWord.split('\n');
    
    const textCenterY = finalCenterY;
    
    if (lines.length === 1) {
      let fontSize = Math.min(animatedWidth / 10, animatedHeight / 3);
      fontSize /= styleConfig?.fontSizeFactor || 1;
      ctx.font = `bold ${fontSize}px Arial`;
      let textWidth = ctx.measureText(currentWord).width;
      const maxTextWidth = animatedWidth * 0.85;
      if (textWidth > maxTextWidth) {
        fontSize *= maxTextWidth / textWidth;
        ctx.font = `bold ${fontSize}px Arial`;
      }
      ctx.fillText(currentWord, centerX, textCenterY);
    } else {
      let fontSize = Math.min(animatedWidth / 15, animatedHeight / (2 + lines.length));
      fontSize /= styleConfig?.fontSizeFactor || 1;
      ctx.font = `bold ${fontSize}px Arial`;
      const lineHeight = fontSize * 1.2;
      const totalHeight = lineHeight * lines.length;
      const startY = textCenterY - (totalHeight / 2) + (lineHeight / 2);
      lines.forEach((line, index) => {
        const lineWidth = ctx.measureText(line).width;
        const maxLineWidth = animatedWidth * 0.85;
        if (lineWidth > maxLineWidth) {
          const scaleFactor = maxLineWidth / lineWidth;
          const adjustedSize = fontSize * scaleFactor;
          ctx.font = `bold ${adjustedSize}px Arial`;
          ctx.fillText(line, centerX, startY + (index * lineHeight));
          ctx.font = `bold ${fontSize}px Arial`;
        } else {
          ctx.fillText(line, centerX, startY + (index * lineHeight));
        }
      });
    }
    
    animationRef.current = requestAnimationFrame(() => draw());
  }, [currentWord, styleConfig, isFullScreen]);

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
            <canvas 
              ref={canvasRef} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0 
              }} 
            />
            {renderControlButtons()}
          </>
        )}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
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