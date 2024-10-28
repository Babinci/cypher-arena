// components/SharedControls/useTimerControl.js
import { useState, useEffect, useCallback } from 'react';
import { useFullScreenHandle } from 'react-full-screen';
import useTimerStore from '../TimerSettings/timerStore';

export const useTimerControl = (initialConfig) => {
  const {
    onNextItem,
    itemCount,
  } = initialConfig;

  // Local UI state only
  const [isControlWindow, setIsControlWindow] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenHandle = useFullScreenHandle();

  // Get all timer-related state and actions from Zustand store
  const {
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,
    initializeStore,
    setTimer,
    setChangeInterval,
    setRoundDuration,
    setIsActive,
    getNextItem,
    resetRound,
  } = useTimerStore();

  // Initialize store and check window type on mount
  useEffect(() => {
    const cleanup = initializeStore({ itemCount });
    setIsControlWindow(window.name === 'controlWindow');
    return cleanup;
  }, [initializeStore, itemCount]);

  // Action handlers
  const handleNextItem = useCallback(() => {
    if (onNextItem) onNextItem();
    getNextItem();
  }, [getNextItem, onNextItem]);

  const handleIntervalChange = useCallback((value) => {
    setChangeInterval(value);
    setTimer(value);
  }, [setChangeInterval, setTimer]);

  const handleRoundDurationChange = useCallback((value) => {
    setRoundDuration(value);
  }, [setRoundDuration]);

  const handleResetRound = useCallback(() => {
    resetRound();
  }, [resetRound]);

  const toggleActive = useCallback(() => {
    setIsActive(!isActive);
  }, [setIsActive, isActive]);

  const openControlWindow = useCallback(() => {
    const controlWindow = window.open('', 'controlWindow', 'width=800,height=400');
    controlWindow.location = window.location.href;
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (isFullScreen) {
      fullScreenHandle.exit();
    } else {
      fullScreenHandle.enter();
    }
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen, fullScreenHandle]);

  return {
    // State
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,
    isControlWindow,
    isFullScreen,
    fullScreenHandle,
   
    // Actions
    getNextItem: handleNextItem,
    handleIntervalChange,
    handleRoundDurationChange,
    handleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  };
};