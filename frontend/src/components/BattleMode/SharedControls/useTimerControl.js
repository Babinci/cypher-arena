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
    actions,
    initializeStore
  } = useTimerStore();

  // Initialize store and check window type on mount
  useEffect(() => {
    const cleanup = initializeStore();
    setIsControlWindow(window.name === 'controlWindow');
    return cleanup;
  }, [initializeStore]);

  // Action handlers
  const getNextItem = useCallback(() => {
    if (onNextItem) onNextItem();
    actions.setCurrentIndex((currentIndex + 1) % itemCount);
    actions.setTimer(changeInterval);
  }, [actions, currentIndex, itemCount, changeInterval, onNextItem]);

  const handleIntervalChange = useCallback((value) => {
    actions.setChangeInterval(value);
    actions.setTimer(value);
  }, [actions]);

  const handleRoundDurationChange = useCallback((value) => {
    actions.setRoundDuration(value);
  }, [actions]);

  const handleResetRound = useCallback(() => {
    actions.resetRound();
  }, [actions]);

  const toggleActive = useCallback(() => {
    actions.setIsActive(!isActive);
  }, [actions, isActive]);

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

  // Auto-advance effect
  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextItem();
    }
  }, [timer, isActive, getNextItem]);

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
    getNextItem,
    handleIntervalChange,
    handleRoundDurationChange,
    handleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  };
};