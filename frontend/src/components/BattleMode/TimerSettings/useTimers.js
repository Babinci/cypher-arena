import { useState, useEffect, useCallback } from 'react';

const useWordTimer = (initialInterval, isActive) => {
    const [timer, setTimer] = useState(initialInterval);
  
    useEffect(() => {
      if (!isActive) return;
  
      const interval = setInterval(() => {
        setTimer(timer => {
          if (timer > 0) return timer - 1;
          return 0;  // Ensure it doesn't go below zero
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }, [isActive, initialInterval]); // Add initialInterval to dependency array
  
    const resetTimer = useCallback(() => {
      setTimer(initialInterval);
    }, [initialInterval]);
  
    return [timer, resetTimer];
  };

const useRoundTimer = (initialDuration, handleRoundEnd) => {
  const [roundTimer, setRoundTimer] = useState(initialDuration);

  useEffect(() => {
    if (roundTimer > 0) {
      const interval = setInterval(() => {
        setRoundTimer(roundTimer => roundTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (roundTimer === 0) {
      handleRoundEnd();
    }
  }, [roundTimer, handleRoundEnd]);

  const resetRoundTimer = useCallback((newDuration) => {
    setRoundTimer(newDuration);
  }, []);

  return [roundTimer, resetRoundTimer];
};

export { useWordTimer, useRoundTimer };