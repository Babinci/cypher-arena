// components/TimerSettings/useTimers.js
import { useState, useEffect, useCallback } from 'react';

// Hook for managing item change timer
// Parameters:
// - initialInterval: time between item changes
// - isActive: whether timer is running
const useWordTimer = (initialInterval, isActive) => {
  const [timer, setTimer] = useState(initialInterval);

  // Reset timer when interval changes
  useEffect(() => {
    setTimer(initialInterval);
  }, [initialInterval]);

  // Timer countdown effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer(timer => {
        if (timer > 0) return timer - 1;
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const resetTimer = useCallback(() => {
    setTimer(initialInterval);
  }, [initialInterval]);

  return [timer, resetTimer];
};

// Hook for managing round duration timer
// Parameters:
// - initialDuration: total round time
// - handleRoundEnd: callback for when round ends
// - isActive: whether timer is running
const useRoundTimer = (initialDuration, handleRoundEnd, isActive) => {
  const [roundTimer, setRoundTimer] = useState(initialDuration);

  // Reset timer when duration changes
  useEffect(() => {
    setRoundTimer(initialDuration);
  }, [initialDuration]);

  // Round timer countdown effect
  useEffect(() => {
    if (!isActive) return;

    if (roundTimer > 0) {
      const interval = setInterval(() => {
        setRoundTimer(roundTimer => roundTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (roundTimer === 0) {
      handleRoundEnd();
    }
  }, [roundTimer, handleRoundEnd, isActive]);

  const resetRoundTimer = useCallback((newDuration) => {
    setRoundTimer(newDuration);
  }, []);

  return [roundTimer, resetRoundTimer];
};

export { useWordTimer, useRoundTimer };