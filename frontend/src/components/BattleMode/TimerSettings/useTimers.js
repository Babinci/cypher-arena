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





//this will be main timer

const useModularTimer = (initialInterval, initialDuration, onIntervalEnd, onRoundEnd) => {
  const [interval, setInterval] = useState(initialInterval);
  const [duration, setDuration] = useState(initialDuration);
  const [isActive, setIsActive] = useState(true);
  const [timer, setTimer] = useState(initialInterval);
  const [roundTimer, setRoundTimer] = useState(initialDuration);

  useEffect(() => {
    let intervalId;
    if (isActive) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) return prevTimer - 1;
          onIntervalEnd();
          return interval;
        });

        setRoundTimer((prevRoundTimer) => {
          if (prevRoundTimer === Infinity) return prevRoundTimer;
          if (prevRoundTimer > 0) return prevRoundTimer - 1;
          if (prevRoundTimer === 0) {
            setIsActive(false);
            onRoundEnd();
          }
          return prevRoundTimer;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, interval, duration, onIntervalEnd, onRoundEnd]);

  const resetTimer = useCallback(() => {
    setTimer(interval);
  }, [interval]);

  const resetRoundTimer = useCallback((newDuration = duration) => {
    setRoundTimer(newDuration);
    setDuration(newDuration);
  }, [duration]);

  const setIntervalDuration = useCallback((newInterval) => {
    setInterval(newInterval);
    setTimer(newInterval);
  }, []);

  const setRoundDuration = useCallback((newDuration) => {
    setDuration(newDuration);
    setRoundTimer(newDuration);
  }, []);

  const toggleActive = useCallback(() => {
    setIsActive((prevIsActive) => !prevIsActive);
  }, []);

  return {
    timer,
    roundTimer,
    isActive,
    resetTimer,
    resetRoundTimer,
    setIntervalDuration,
    setRoundDuration,
    toggleActive,
    setIsActive,
  };
};

export default useModularTimer;