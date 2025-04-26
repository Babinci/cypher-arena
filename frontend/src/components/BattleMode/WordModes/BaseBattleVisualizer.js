// BaseBattleVisualizer.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';
import { drawGradientRectangle } from './Gradient_Rectangle';

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

    // Use the new rectangle drawing function
    drawGradientRectangle(ctx, {
      x: animatedX,
      y: animatedY,
      width: animatedWidth,
      height: animatedHeight,
      borderRadius,
      time
    });

    // --- WORD WRAPPING LOGIC ---
    const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    // Special handling for contrast mode with "vs" separator
    const isContrastMode = currentWord && currentWord.includes('###VS###');
    
    // Helper to fit font size to rectangle width
    function fitFontSizeToWidth(text, initialFontSize, maxWidth, minFontSize = 14, isBold = true) {
      let fontSize = initialFontSize;
      ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      let measured = ctx.measureText(text);
      while (measured.width > maxWidth && fontSize > minFontSize) {
        fontSize -= 1;
        ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        measured = ctx.measureText(text);
      }
      return fontSize;
    }

    if (isContrastMode) {
      // Split the content around our special VS marker
      const [item1, item2] = currentWord.split('###VS###');
      // Calculate maximum text width (slightly narrower than the box)
      const maxTextWidth = animatedWidth * 0.85;
      // Initial font size based on rectangle width only
      const minFontSize = isMobileView ? 16 : 22;
      const maxFontSize = isMobileView ? 110 : 160;
      let fontSize = Math.min(animatedWidth / 9, maxFontSize);
      fontSize = Math.max(minFontSize, fontSize);
      // Fit font size for both items
      const item1FontSize = fitFontSizeToWidth(item1.trim(), fontSize, maxTextWidth);
      const item2FontSize = fitFontSizeToWidth(item2.trim(), fontSize, maxTextWidth);
      fontSize = Math.min(item1FontSize, item2FontSize);
      // Setup for VS text (which should be larger and distinct)
      const vsFontSize = Math.max(fontSize * 1.2, fontSize + 4);
      // Helper function to wrap and fit text
      function wrapText(text, fontSize, maxWidth, maxLines = 3) {
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const words = text.trim().split(/\s+/);
        let lines = [];
        let currentLine = '';
        for (let i = 0; i < words.length; i++) {
          let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
          let testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          let last = lines[maxLines - 1];
          if (ctx.measureText(last + '...').width <= maxWidth) {
            lines[maxLines - 1] = last + '...';
          }
        }
        return lines;
      }
      // Calculate line height based on font size
      const lineHeight = fontSize * 1.3;
      const vsLineHeight = vsFontSize * 1.5;
      // Wrap both items
      const item1Lines = wrapText(item1, fontSize, maxTextWidth, 3);
      const item2Lines = wrapText(item2, fontSize, maxTextWidth, 3);
      // Calculate total height needed
      const item1Height = item1Lines.length * lineHeight;
      const item2Height = item2Lines.length * lineHeight;
      const vsHeight = vsLineHeight;
      const totalHeight = item1Height + vsHeight + item2Height;
      // Start drawing from the top of the calculated space
      let currentY = finalCenterY - (totalHeight / 2);
      // Draw item1
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      item1Lines.forEach(line => {
        ctx.save();
        ctx.shadowOffsetX = fontSize * 0.03;
        ctx.shadowOffsetY = fontSize * 0.03;
        ctx.shadowBlur = fontSize * 0.07;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillText(line, centerX, currentY);
        ctx.restore();
        currentY += lineHeight;
      });
      // Draw "vs" with a different style
      ctx.save();
      ctx.font = `bold ${vsFontSize}px ${fontFamily}`;
      ctx.shadowOffsetX = vsFontSize * 0.03;
      ctx.shadowOffsetY = vsFontSize * 0.03;
      ctx.shadowBlur = vsFontSize * 0.1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillText("vs", centerX, currentY);
      ctx.restore();
      currentY += vsLineHeight;
      // Draw item2
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      item2Lines.forEach(line => {
        ctx.save();
        ctx.shadowOffsetX = fontSize * 0.03;
        ctx.shadowOffsetY = fontSize * 0.03;
        ctx.shadowBlur = fontSize * 0.07;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillText(line, centerX, currentY);
        ctx.restore();
        currentY += lineHeight;
      });
    } else {
      // Normal mode
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
      // Calculate font size based only on rectangle width
      const minFontSize = isMobileView ? 16 : 22;
      const maxFontSize = isMobileView ? 120 : 180;
      let fontSize = Math.min(animatedWidth / 8, maxFontSize);
      fontSize = Math.max(minFontSize, fontSize);
      // Use wrapText to split into lines
      const maxTextWidth = animatedWidth * 0.9;
      const maxLines = isMobileView ? 4 : 5;
      // Fit font size for all lines
      let lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
      // If any line is too wide, reduce font size
      let widest = 0;
      lines.forEach(line => {
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        widest = Math.max(widest, ctx.measureText(line).width);
      });
      while (widest > maxTextWidth && fontSize > minFontSize) {
        fontSize -= 1;
        lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
        widest = 0;
        lines.forEach(line => {
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          widest = Math.max(widest, ctx.measureText(line).width);
        });
      }
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
    }
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