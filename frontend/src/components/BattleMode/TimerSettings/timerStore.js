import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useTimerStore = create()(
  devtools((set, get) => {
    // Private variables to manage timer state
    let timerInterval = null;
    let isInitialized = false;
    let broadcastChannel = null;  // Moved to module scope

    // Helper to safely clear existing interval
    const clearExistingInterval = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    // Helper to safely create/recreate broadcast channel
    const createBroadcastChannel = () => {
      if (typeof window === 'undefined') return null;
      try {
        if (broadcastChannel) {
          broadcastChannel.close();
        }
        broadcastChannel = new BroadcastChannel('timer-sync');
        return broadcastChannel;
      } catch (error) {
        console.error('Error creating broadcast channel:', error);
        return null;
      }
    };

    // Timer logic centralized in one place
    const handleTimerTick = () => {
      const state = get();
      if (!state.isActive) return;
   
      // Split timer updates into separate operations
      const newTimer = Math.max(0, state.timer - 1);
      const newRoundTimer = state.roundDuration === Infinity
        ? state.roundTimer
        : Math.max(0, state.roundTimer - 1);
   
      // Always handle item timer regardless of round timer
      if (state.timer === 1) {
        const newIndex = (state.currentIndex + 1) % state.itemCount;
        set({
          currentIndex: newIndex,
          timer: state.changeInterval,
          roundTimer: newRoundTimer
        });
      } else {
        set({
          timer: newTimer,
          roundTimer: newRoundTimer
        });
      }
   
      // If round timer hits 0, just set isActive to false but don't return
      // This allows the current item timer to complete
      if (newRoundTimer === 0 && state.roundDuration !== Infinity) {
        set({ isActive: false });
      }
   
      // Only main window broadcasts timer updates
      if (!window.name) {
        broadcastState();
      }
    };
   
    // Centralized timer management
    const startTimerInterval = () => {
      clearExistingInterval();
     
      // Only main window runs the timer
      if (!window.name) {
        timerInterval = setInterval(handleTimerTick, 1000);
      }
    };

    // Utility to broadcast state changes
    const broadcastState = () => {
      if (!broadcastChannel || broadcastChannel.closed) {
        broadcastChannel = createBroadcastChannel();
      }
      if (!broadcastChannel) return;  // Skip if channel creation failed
      try {
        const state = {
          timer: get().timer,
          roundTimer: get().roundTimer,
          changeInterval: get().changeInterval,
          roundDuration: get().roundDuration,
          isActive: get().isActive,
          currentIndex: get().currentIndex,
          itemCount: get().itemCount,
        };
       
        broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          payload: state,
        });
      } catch (error) {
        console.error('Error broadcasting state:', error);
        broadcastChannel = null;  // Reset for next attempt
      }
    };

    return {
      // Timer state
      timer: 15,
      roundTimer: 90,
      changeInterval: 15,
      roundDuration: Infinity,
      isActive: true,
      currentIndex: 0,
      itemCount: 0,

      // Initialization
      initializeStore: (config = {}) => {
        if (typeof window === 'undefined' || isInitialized) {
          return () => {};
        }
       
        isInitialized = true;
        if (config.itemCount) {
          set({ itemCount: config.itemCount });
        }
        broadcastChannel = createBroadcastChannel();
       
        if (broadcastChannel) {
          broadcastChannel.onmessage = (event) => {
            const { type, payload } = event.data;
            const isControlWindow = window.name === 'controlWindow';
           
            switch (type) {
              case 'STATE_UPDATE':
                if (isControlWindow) {
                  set(payload);
                }
                break;
              case 'REQUEST_SYNC':
                if (!isControlWindow) {
                  broadcastChannel.postMessage({
                    type: 'STATE_UPDATE',
                    payload: {
                      timer: get().timer,
                      roundTimer: get().roundTimer,
                      changeInterval: get().changeInterval,
                      roundDuration: get().roundDuration,
                      isActive: get().isActive,
                      currentIndex: get().currentIndex,
                      itemCount: get().itemCount,
                    },
                  });
                }
                break;
              case 'CONTROL_ACTION':
                if (!isControlWindow) {
                  const { actionType, value } = payload;
                  switch (actionType) {
                    case 'SET_TIMER':
                      set({ timer: value });
                      break;
                    case 'SET_CHANGE_INTERVAL':
                      set({ changeInterval: value });
                      break;
                    case 'SET_ROUND_DURATION':
                      const newDuration = value === 300 ? Infinity : value;
                      set({ roundDuration: newDuration, roundTimer: newDuration });
                      break;
                    case 'SET_ACTIVE':
                      if (value) {
                        startTimerInterval();
                      } else {
                        clearExistingInterval();
                      }
                      set({ isActive: value });
                      break;
                    case 'RESET_ROUND':
                      clearExistingInterval();
                      const newIndex = (get().currentIndex + 1) % get().itemCount;
                      set({
                        currentIndex: newIndex,
                        timer: get().changeInterval,
                        roundTimer: get().roundDuration,
                        isActive: true,
                      });
                      startTimerInterval();
                      broadcastState();
                      break;
                    case 'GET_NEXT_ITEM':
                      set({
                        currentIndex: (get().currentIndex + 1) % get().itemCount,
                        timer: get().changeInterval
                      });
                      break;
                  }
                  broadcastState();
                }
                break;
            }
          };
        }
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({ type: 'REQUEST_SYNC' });
        } else {
          if (get().isActive) {
            startTimerInterval();
          }
        }
        return () => {
          clearExistingInterval();
          if (broadcastChannel) {
            broadcastChannel.close();
            broadcastChannel = null;
          }
          isInitialized = false;
        };
      },

      // Action methods exposed to components
      setTimer: (value) => {
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'SET_TIMER', value }
          });
        } else {
          set({ timer: value });
          broadcastState();
        }
      },

      setChangeInterval: (value) => {
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'SET_CHANGE_INTERVAL', value }
          });
        } else {
          set({ changeInterval: value });
          broadcastState();
        }
      },

      setRoundDuration: (value) => {
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'SET_ROUND_DURATION', value }
          });
        } else {
          const newDuration = value === 300 ? Infinity : value;
          set({
            roundDuration: newDuration,
            roundTimer: newDuration
          });
          broadcastState();
        }
      },

      setIsActive: (value) => {
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'SET_ACTIVE', value }
          });
        } else {
          if (value) {
            startTimerInterval();
          } else {
            clearExistingInterval();
          }
          set({ isActive: value });
          broadcastState();
        }
      },

      getNextItem: () => {
        if (window.name === 'controlWindow') {
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'GET_NEXT_ITEM' }
          });
        } else {
          set({
            currentIndex: (get().currentIndex + 1) % get().itemCount,
            timer: get().changeInterval
          });
          broadcastState();
        }
      },

      resetRound: () => {
        if (window.name === 'controlWindow') {
          if (!broadcastChannel || broadcastChannel.closed) {
            broadcastChannel = createBroadcastChannel();
          }
          broadcastChannel?.postMessage({
            type: 'CONTROL_ACTION',
            payload: { actionType: 'RESET_ROUND' }
          });
        } else {
          clearExistingInterval();
          const newIndex = (get().currentIndex + 1) % get().itemCount;
          set({
            currentIndex: newIndex,
            timer: get().changeInterval,
            roundTimer: get().roundDuration,
            isActive: true,
          });
          startTimerInterval();
          broadcastState();
        }
      },
    };
  })
);

export default useTimerStore;