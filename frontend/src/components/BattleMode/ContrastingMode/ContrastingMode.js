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

  // Log whenever pairs or currentIndex changes
  useEffect(() => {
    console.log('Current pairs state:', pairs.length, 'items, currentIndex:', currentIndex);
    if (pairs.length > 0 && currentIndex < pairs.length) {
      console.log('Current pair:', pairs[currentIndex]);
    }
  }, [pairs, currentIndex]);

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
  
    const centerX = width / 2;
    // Adjust centerY to account for controls height
    const centerY = (height - 150) / 2;  
    const maxRadius = Math.max(10, Math.min(width, height - 100) * 0.45); // Ensure positive radius
    const time = Date.now() / 15000;
  
    const innerColor = `hsla(${(time * 30) % 360}, 50%, 60%, 1)`;
    const midColor = `hsla(${((time * 30) + 30) % 360}, 50%, 65%, 1)`;
    const outerColor = `hsla(${((time * 30) + 60) % 360}, 50%, 70%, 1)`;
  
    try {
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
    
      // Check if we have pairs and a valid current index
      if (pairs.length > 0 && currentIndex < pairs.length) {
        // Format the contrast pair text
        const currentPair = pairs[currentIndex];
        
        // Make sure we're accessing the right properties
        const item1 = currentPair?.item1 || "Item1";
        const item2 = currentPair?.item2 || "Item2";
        
        const displayText = `${item1} vs ${item2}`;
        
        // Format text to fit properly in the circle
        let formattedText = displayText;
        if (displayText.length > 20) {
          // Split into multiple lines if it's too long
          const words = displayText.split(' ');
          let lines = [];
          let currentLine = '';
          
          for (let word of words) {
            if ((currentLine + ' ' + word).length > 16) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = currentLine ? `${currentLine} ${word}` : word;
            }
          }
          
          if (currentLine) {
            lines.push(currentLine);
          }
          
          formattedText = lines.join('\n');
        }
        
        const lines = formattedText.split('\n');
        
        if (lines.length === 1) {
          let fontSize = maxRadius / 2.5;
          ctx.font = `bold ${fontSize}px Arial`;
          
          let textWidth = ctx.measureText(formattedText).width;
          if (textWidth > maxRadius * 1.5) {
            fontSize *= (maxRadius * 1.5) / textWidth;
            ctx.font = `bold ${fontSize}px Arial`;
          }
          
          ctx.fillText(formattedText, centerX, centerY);
        } else {
          let fontSize = maxRadius / (1.5 + lines.length * 0.5);
          ctx.font = `bold ${fontSize}px Arial`;
          
          const lineHeight = fontSize * 1.2;
          const totalHeight = lineHeight * lines.length;
          const startY = centerY - (totalHeight / 2) + (lineHeight / 2);
          
          lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            ctx.fillText(line, centerX, y);
          });
        }
      } else if (isLoading) {
        // Draw loading text if data is being fetched
        ctx.font = `bold ${maxRadius / 6}px Arial`;
        ctx.fillText("Loading...", centerX, centerY);
      } else if (hasError) {
        // Draw error text if there was a problem fetching data
        ctx.font = `bold ${maxRadius / 8}px Arial`;
        ctx.fillText("Error loading contrast pairs", centerX, centerY);
      } else if (pairs.length === 0) {
        // Draw a default message if no pairs are available
        ctx.font = `bold ${maxRadius / 6}px Arial`;
        ctx.fillText("No contrast pairs found", centerX, centerY);
      }
    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  
    animationRef.current = requestAnimationFrame(draw);
  }, [currentIndex, pairs, isLoading, hasError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isControlWindow) return;

    const resizeCanvas = () => {
      // Set a minimum size to prevent canvas errors
      canvas.width = Math.max(100, window.innerWidth);
      canvas.height = Math.max(100, window.innerHeight - (isFullScreen ? 0 : 100));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

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

export default ContrastingMode;