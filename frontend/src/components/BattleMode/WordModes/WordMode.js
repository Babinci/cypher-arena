import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiConfig from '../../../config/apiConfig';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';

function FreestyleBattleVisualizer() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [changeInterval, setChangeInterval] = useState(10);
  const [roundDuration, setRoundDuration] = useState(90);
  const [isActive, setIsActive] = useState(true);
  const [timer, resetWordTimer] = useWordTimer(changeInterval, isActive);
  const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => setIsActive(false));

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const fetchWords = useCallback(() => {
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`)
      .then(response => response.json())
      .then(data => {
        setWords(data.words);
        setCurrentWord(data.words[0]);
      })
      .catch(error => console.error('Error fetching words:', error));
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const getNextWord = useCallback(() => {
    let wordIndex = words.indexOf(currentWord) + 1;
    if (wordIndex < words.length) {
      setCurrentWord(words[wordIndex]);
    } else {
      fetchWords();
    }
  }, [words, currentWord, fetchWords]);

  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextWord();
      resetWordTimer();
    }
  }, [timer, isActive, getNextWord, resetWordTimer]);

  const handleIntervalChange = useCallback((increment) => {
    const intervals = [5, 10, 20, 30, 40, 60, 90, 120, 180, 300];
    let index = intervals.indexOf(changeInterval);
    if (increment && index < intervals.length - 1) {
      setChangeInterval(intervals[index + 1]);
    } else if (!increment && index > 0) {
      setChangeInterval(intervals[index - 1]);
    }
  }, [changeInterval]);

  const handleRoundDurationChange = (event) => {
    const value = event.target.value === "300" ? Infinity : parseInt(event.target.value);
    setRoundDuration(value);
    resetRoundTimer(value);
  };

  const resetRound = () => {
    resetRoundTimer(roundDuration);
    resetWordTimer(changeInterval);
    setIsActive(true);
    getNextWord();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
  
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;
    const time = Date.now() / 15000; // Even slower animation
  
    // Softer colors with less saturation and higher lightness
    const innerColor = `hsla(${(time * 30) % 360}, 50%, 60%, 1)`;
    const midColor = `hsla(${((time * 30) + 30) % 360}, 50%, 65%, 1)`;
    const outerColor = `hsla(${((time * 30) + 60) % 360}, 50%, 70%, 1)`;
  
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.5, innerColor); // Extend the inner color
    gradient.addColorStop(0.8, midColor); // Add a middle color for smoother transition
    gradient.addColorStop(1, outerColor);
  
    ctx.beginPath();
    const radiusOffset = Math.sin(time * 2) * 2; // Even more subtle pulsing
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // Leave space for controls
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}>
        <p style={{ color: 'white', margin: '5px 0', textAlign: 'center' }}>
          Interval: {changeInterval}s | Time Left: {roundDuration === Infinity ? 'Infinity' : `${roundTimer}s`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <button onClick={() => handleIntervalChange(false)} style={buttonStyle}>Decrease Interval</button>
          <input
            type="range"
            min="10"
            max="300"
            value={roundDuration === Infinity ? 300 : roundDuration}
            onChange={handleRoundDurationChange}
            style={{ width: '40%', margin: '0 10px' }}
          />
          <button onClick={() => handleIntervalChange(true)} style={buttonStyle}>Increase Interval</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={resetRound} style={buttonStyle}>Reset Round</button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  color: 'white',
  padding: '8px 12px',
  margin: '5px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default FreestyleBattleVisualizer;