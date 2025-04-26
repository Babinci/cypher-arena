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
    
    const availableWidth = width;
    const availableHeight = height;
    const topPadding = 20;
    const isMobileView = availableWidth <= 768;
    
    let maxWidth, maxHeight;
    
    if (isMobileView) {
      maxWidth = availableWidth * 0.9;
    } else {
      maxWidth = Math.min(availableWidth * 0.75, 800);
    }
    
    maxHeight = availableHeight - (topPadding * 2);
    maxHeight = Math.max(20, maxHeight);
    
    const borderRadius = Math.min(maxWidth, maxHeight) * 0.15;
    
    const centerX = availableWidth / 2;
    
    const time = Date.now() / 15000;
    const pulseSize = Math.sin(time * 2) * 5;
    const animatedWidth = maxWidth + pulseSize;
    let animatedHeight = maxHeight + pulseSize;

    let animatedY = topPadding;
    animatedHeight = Math.min(animatedHeight, maxHeight);
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

    // --- WORD WRAPPING LOGIC ---
    const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    // Helper to wrap text to fit max width
    function wrapText(text, fontSize, maxWidth, maxLines = 5, minFontSize = 14) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const words = text.split(/\s+/);
      let lines = [];
      let currentLine = '';
      let i = 0;
      while (i < words.length) {
        let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          } else {
            // Single word too long, need to hyphenate
            let word = words[i];
            let part = '';
            for (let c = 0; c < word.length; c++) {
              part += word[c];
              if (ctx.measureText(part + '-').width > maxWidth) {
                if (part.length > 1) {
                  lines.push(part.slice(0, -1) + '-');
                  part = word[c];
                }
              }
            }
            if (part) currentLine = part;
            i++;
            continue;
          }
        } else {
          currentLine = testLine;
          i++;
        }
        if (lines.length >= maxLines) break;
      }
      if (currentLine && lines.length < maxLines) lines.push(currentLine);
      // If still too many lines, try reducing font size
      if (lines.length > maxLines && fontSize > minFontSize) {
        return wrapText(text, fontSize - 2, maxWidth, maxLines, minFontSize);
      }
      // If still too many lines, ellipsis last line
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        let last = lines[maxLines - 1];
        while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
          last = last.slice(0, -1);
        }
        lines[maxLines - 1] = last + '...';
      }
      return lines;
    }

    // Calculate font size
    const vw = window.innerWidth / 100;
    const vh = window.innerHeight / 100;
    const minFontSize = isMobileView ? 16 : 22;
    const maxFontSize = isMobileView ? 120 : 180;
    let fontSize = isMobileView
      ? Math.min(
          animatedWidth / 8,
          animatedHeight / 3,
          8 * vw,
          12 * vh,
          maxFontSize
        )
      : Math.min(
          animatedWidth / 6,
          animatedHeight / 2,
          11 * vw,
          16 * vh,
          maxFontSize
        );
    fontSize /= styleConfig?.fontSizeFactor || 1;
    fontSize = Math.max(minFontSize, fontSize);

    // Use wrapText to split into lines
    const maxTextWidth = animatedWidth * 0.9;
    const maxLines = isMobileView ? 4 : 5;
    const lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);

    // Recalculate font size if wrapping reduced it
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * (isMobileView ? 1.3 : 1.2);
    const totalHeight = lineHeight * lines.length;
    const textCenterY = finalCenterY;
    let startY = textCenterY - (totalHeight / 2) + (lineHeight / 2);

    // Draw each line with shadow
    lines.forEach((line, index) => {
      ctx.save();
      ctx.shadowOffsetX = fontSize * (isMobileView ? 0.02 : 0.03);
      ctx.shadowOffsetY = fontSize * (isMobileView ? 0.02 : 0.03);
      ctx.shadowBlur = fontSize * (isMobileView ? 0.05 : 0.07);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(line, centerX, startY + (index * lineHeight));
      ctx.restore();
    });
    // --- END WORD WRAPPING LOGIC ---

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
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a'
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