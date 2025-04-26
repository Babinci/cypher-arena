import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import apiConfig from '../../../config/apiConfig';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

function ContrastingMode() {
  const [pairs, setPairs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const [actualControlsHeight, setActualControlsHeight] = useState(100);

  // Initialize timer control with pair-specific configuration
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
    handleResetRound: baseHandleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  } = useTimerControl({
    defaultInterval: 60,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: pairs.length,
    onNextItem: () => {
      // No action needed for pagination in this simplified implementation
    },
  });

  const fetchPairs = useCallback(async () => {
    // If we've already fetched or are currently loading, don't fetch again
    if (isLoading || hasFetched) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const url = new URL(`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}`);
      url.searchParams.append('count', 100); // Fixed count of 100
      
      console.log('Fetching contrast pairs');
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // Check if data has the expected structure
        if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
          // Use the results array from the response
          setPairs(data.results);
          console.log('Set pairs:', data.results.length, 'items');
        } else {
          console.warn('API returned unexpected data structure');
          setPairs([{ item1: "Example", item2: "Contrast" }]);
        }
      } else {
        console.error('Error fetching pairs:', await response.text());
        setHasError(true);
        setPairs([{ item1: "Example", item2: "Contrast" }]);
      }
    } catch (error) {
      console.error('Error fetching pairs:', error);
      setHasError(true);
      setPairs([{ item1: "Example", item2: "Contrast" }]);
    } finally {
      setIsLoading(false);
      setHasFetched(true); // Mark that we've completed a fetch
    }
  }, [isLoading, hasFetched]);

  // Custom reset handler that resets everything
  const handleResetRound = useCallback(() => {
    setPairs([]);
    setHasFetched(false); // Allow fetching again after reset
    baseHandleResetRound();
  }, [baseHandleResetRound]);

  useEffect(() => {
    // Only fetch once when the component mounts
    fetchPairs();
    
    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format a contrast pair to fit in the circle
  const formatContrastPair = useCallback((item1, item2) => {
    // Don't combine the items into a single string first
    // Instead, format each item individually and then arrange them
    
    // Format each item individually
    const formatSingleItem = (text) => {
      if (!text) return '';
      // Always wrap by words, no truncation or line limit
      const words = text.split(' ');
      const maxCharsPerLine = 20; // Allow more chars per line for better wrapping
      let lines = [];
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      // No line limit, no ellipsis
      return lines.join('\n');
    };
    
    const formattedItem1 = formatSingleItem(item1);
    const formattedItem2 = formatSingleItem(item2);
    
    // Combine with "vs" in the middle
    return `${formattedItem1}\nvs\n${formattedItem2}`;
  }, []);

  // Draw the circular visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    if (width <= 0 || height <= 0) return; // Guard against invalid dimensions
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Define approximate controls height for non-fullscreen mode
    const controlsApproxHeight = 120; // Increased approximation
    const availableHeight = height - (isFullScreen ? 0 : controlsApproxHeight);
    const availableWidth = width;
    
    const isMobileView = availableWidth <= 768;
    
    // Calculate rectangle dimensions with more padding
    let maxWidth, maxHeight;
    if (isMobileView) {
      maxWidth = availableWidth * 0.9;
    } else {
      maxWidth = Math.min(availableWidth * 0.75, 800);
    }
    maxHeight = Math.min(availableHeight * 0.85, 600);
    
    const borderRadius = Math.min(maxWidth, maxHeight) * 0.15;
    
    // Center X coordinate
    const centerX = availableWidth / 2;
    
    // Calculate Y positioning
    const topPadding = 20; // Desired padding from the top edge
    const idealCenterY = availableHeight / 2;

    const time = Date.now() / 15000;
    const pulseSize = Math.sin(time * 2) * 5;
    const animatedWidth = maxWidth + pulseSize;
    let animatedHeight = maxHeight + pulseSize; // Use let for potential adjustment

    // Calculate initial animatedY based on ideal center
    let animatedY = idealCenterY - animatedHeight / 2;

    // Ensure top padding
    animatedY = Math.max(topPadding, animatedY);

    // Ensure bottom edge doesn't overlap controls (in non-fullscreen)
    if (!isFullScreen) {
      const bottomLimit = availableHeight - topPadding; // Leave padding at bottom too
      if (animatedY + animatedHeight > bottomLimit) {
          // Shrink height to fit
          animatedHeight = bottomLimit - animatedY;
      }
    }
    // Ensure Y is not negative after adjustments
    animatedY = Math.max(topPadding, animatedY);
    // Recalculate actual centerY based on final position and height for text
    const finalCenterY = animatedY + animatedHeight / 2;
    
    // Final X position
    const animatedX = centerX - animatedWidth / 2;
    
    // Gradient and drawing logic (using animatedX, animatedY, animatedWidth, animatedHeight)
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
    
    // Use the finalCenterY for text positioning
    const textCenterY = finalCenterY;

    if (pairs.length > 0 && currentIndex < pairs.length) {
      const currentPair = pairs[currentIndex];
      const item1 = currentPair?.item1 || "Item1";
      const item2 = currentPair?.item2 || "Item2";
      const formattedText = formatContrastPair(item1, item2);
      const lines = formattedText.split('\n');
      if (lines.length === 1) {
        let fontSize = Math.min(animatedWidth / 10, animatedHeight / 3);
        ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = ctx.measureText(formattedText).width;
        const maxTextWidth = animatedWidth * 0.85;
        if (textWidth > maxTextWidth) {
          fontSize *= maxTextWidth / textWidth;
          ctx.font = `bold ${fontSize}px Arial`;
        }
        ctx.fillText(formattedText, centerX, textCenterY);
      } else {
        let fontSize = Math.min(animatedWidth / 15, animatedHeight / (2.5 + lines.length * 0.7));
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
    } else if (isLoading) {
      let fontSize = Math.min(animatedWidth / 12, animatedHeight / 5);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText("Loading...", centerX, textCenterY);
    } else if (hasError) {
      let fontSize = Math.min(animatedWidth / 15, animatedHeight / 6);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText("Error loading contrast pairs", centerX, textCenterY);
    } else if (pairs.length === 0) {
      let fontSize = Math.min(animatedWidth / 12, animatedHeight / 5);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText("No contrast pairs found", centerX, textCenterY);
    }
    
    animationRef.current = requestAnimationFrame(() => draw()); 
  }, [currentIndex, pairs, isLoading, hasError, formatContrastPair, isFullScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isControlWindow) return;

    const resizeCanvas = () => {
      canvas.width = Math.max(100, window.innerWidth);
      canvas.height = Math.max(100, window.innerHeight);
      // Trigger initial draw with the new height
      requestAnimationFrame(() => draw()); // Call draw without height
    };

    resizeCanvas(); // Initial size calculation and draw
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
      <div 
        className="contrasting-mode" 
        style={{ 
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a'
        }}
        ref={containerRef}
        tabIndex={0}
      >
        {!isControlWindow && (
          <div style={{ }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0 
              }} 
            />
            {renderControlButtons()}
          </div>
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
}

export default ContrastingMode;