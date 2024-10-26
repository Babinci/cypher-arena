// components/SharedControls/useTimerControl.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

// Main hook for timer control functionality
// Handles:
// - Timer state and controls
// - Broadcasting between windows
// - Fullscreen functionality
export const useTimerControl = (initialConfig) => {
  const {
    defaultInterval = 15,
    defaultRoundDuration = 90,
    defaultIsActive = true,
    onNextItem,
    itemCount,
    channelName,
  } = initialConfig;

  // State management
  const [changeInterval, setChangeInterval] = useState(defaultInterval);
  const [roundDuration, setRoundDuration] = useState(defaultRoundDuration);
  const [isActive, setIsActive] = useState(defaultIsActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isControlWindow, setIsControlWindow] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
 
  // Custom timer hooks
  const [timer, resetItemTimer] = useWordTimer(changeInterval, isActive);
  const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => setIsActive(false), isActive);
 
  // Refs and handles
  const broadcastChannel = useRef(null);
  const fullScreenHandle = useFullScreenHandle();

  // Initialize broadcast channel for window communication
  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel(channelName);
   
    // Message handler for cross-window communication
    broadcastChannel.current.onmessage = (event) => {
      const { type, payload } = event.data;
     
      switch (type) {
        case 'NEXT_ITEM':
          if (!isControlWindow) {
            setCurrentIndex(prevIndex => (prevIndex + 1) % itemCount);
            if (onNextItem) onNextItem();
          }
          break;
        case 'CHANGE_INTERVAL':
          setChangeInterval(payload);
          resetItemTimer();
          break;
        case 'SET_ACTIVE':
          setIsActive(payload);
          break;
        case 'RESET_ROUND':
          setCurrentIndex(0);
          resetRoundTimer(roundDuration);
          resetItemTimer();
          setIsActive(true);
          break;
        case 'CHANGE_ROUND_DURATION':
          const newDuration = payload === 300 ? Infinity : payload;
          setRoundDuration(newDuration);
          resetRoundTimer(newDuration);
          break;
        case 'SYNC_STATE':
          setCurrentIndex(payload.currentIndex);
          setChangeInterval(payload.changeInterval);
          setRoundDuration(payload.roundDuration);
          setIsActive(payload.isActive);
          resetItemTimer();
          resetRoundTimer(payload.roundDuration);
          break;
        default:
          break;
      }
    };

    // Check if this is control window
    const isControl = window.name === 'controlWindow';
    setIsControlWindow(isControl);

    // Request initial state if control window
    if (isControl) {
      broadcastChannel.current.postMessage({ type: 'REQUEST_SYNC' });
    }

    return () => {
      broadcastChannel.current.close();
    };
  }, [itemCount, resetItemTimer, resetRoundTimer, roundDuration, onNextItem, isControlWindow]);

  // Helper function to send messages between windows
  const sendMessage = (type, payload = null) => {
    broadcastChannel.current.postMessage({ type, payload });
  };

  // Action handlers
  const getNextItem = useCallback(() => {
    if (!isControlWindow) {
      sendMessage('NEXT_ITEM');
    }
    setCurrentIndex(prevIndex => (prevIndex + 1) % itemCount);
    if (onNextItem) onNextItem();
  }, [itemCount, onNextItem, isControlWindow]);

  const handleIntervalChange = useCallback((value) => {
    const newInterval = value;
    setChangeInterval(newInterval);
    resetItemTimer();
    sendMessage('CHANGE_INTERVAL', newInterval);
  }, [resetItemTimer]);

  const handleRoundDurationChange = useCallback((value) => {
    sendMessage('CHANGE_ROUND_DURATION', value);
    const newDuration = value === 300 ? Infinity : value;
    setRoundDuration(newDuration);
    resetRoundTimer(newDuration);
  }, [resetRoundTimer]);

  const handleResetRound = useCallback(() => {
    sendMessage('RESET_ROUND');
    setCurrentIndex(0);
    resetRoundTimer(roundDuration);
    resetItemTimer();
    setIsActive(true);
  }, [roundDuration, resetRoundTimer, resetItemTimer]);

  const toggleActive = useCallback(() => {
    sendMessage('SET_ACTIVE', !isActive);
    setIsActive(!isActive);
  }, [isActive]);

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

  // Auto-advance timer effect
  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextItem();
      resetItemTimer();
    }
  }, [timer, isActive, getNextItem, resetItemTimer]);

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