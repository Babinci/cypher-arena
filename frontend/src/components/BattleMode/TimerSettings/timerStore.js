// components/TimerSettings/timerStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useTimerStore = create()(
  devtools((set, get) => {
    // Private variables to manage timer state
    let timerInterval = null;
    let isInitialized = false;

    // Helper to safely clear existing interval
    const clearExistingInterval = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    // Timer logic centralized in one place
    const handleTimerTick = () => {
      const state = get();
      if (!state.isActive) return;

      // Update timers
      const newTimer = Math.max(0, state.timer - 1);
      const newRoundTimer = state.roundDuration === Infinity 
        ? state.roundTimer 
        : Math.max(0, state.roundTimer - 1);

      // Only broadcast if values actually changed
      if (newTimer !== state.timer || newRoundTimer !== state.roundTimer) {
        set({ 
          timer: newTimer,
          roundTimer: newRoundTimer
        });
        // Only main window broadcasts timer updates
        if (!window.name) {
          get().broadcastState();
        }
      }
    };

    // Centralized timer management
    const startTimerInterval = () => {
      // Ensure only one timer runs at a time
      clearExistingInterval();
      
      // Only main window runs the timer
      if (!window.name) {
        timerInterval = setInterval(handleTimerTick, 1000);
      }
    };

    return {
      // Timer state
      timer: 15,
      roundTimer: 90,
      changeInterval: 15,
      roundDuration: 90,
      isActive: true,
      currentIndex: 0,
      
      // Broadcast channel for window sync
      broadcastChannel: typeof window !== 'undefined' ? new BroadcastChannel('timer-sync') : null,

      // Initialize store and setup broadcast listeners
      initializeStore: () => {
        if (typeof window === 'undefined' || isInitialized) return;
        
        isInitialized = true;
        const channel = get().broadcastChannel;
        
        // Set up message handling
        channel.onmessage = (event) => {
          const { type, payload } = event.data;
          const isControlWindow = window.name === 'controlWindow';
          
          switch (type) {
            case 'STATE_UPDATE':
              // Control window just updates its state
              if (isControlWindow) {
                set(payload);
              }
              break;

            case 'REQUEST_SYNC':
              // Only main window responds to sync requests
              if (!isControlWindow) {
                channel.postMessage({
                  type: 'STATE_UPDATE',
                  payload: {
                    timer: get().timer,
                    roundTimer: get().roundTimer,
                    changeInterval: get().changeInterval,
                    roundDuration: get().roundDuration,
                    isActive: get().isActive,
                    currentIndex: get().currentIndex,
                  },
                });
              }
              break;

            case 'CONTROL_ACTION':
              // Only main window processes control actions
              if (!isControlWindow) {
                const { action, value } = payload;
                get().actions[action](value);
              }
              break;
          }
        };

        // Initial setup based on window type
        if (window.name === 'controlWindow') {
          // Control window requests initial state
          channel.postMessage({ type: 'REQUEST_SYNC' });
        } else {
          // Main window starts timer if active
          if (get().isActive) {
            startTimerInterval();
          }
        }

        // Cleanup function
        return () => {
          clearExistingInterval();
          channel.close();
          isInitialized = false;
        };
      },

      // Action creators
      actions: {
        setTimer: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            // Control window broadcasts action to main window
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setTimer', value }
            });
          } else {
            // Main window executes action and broadcasts state
            set({ timer: value });
            get().broadcastState();
          }
        },

        setRoundTimer: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setRoundTimer', value }
            });
          } else {
            set({ roundTimer: value });
            get().broadcastState();
          }
        },

        setChangeInterval: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setChangeInterval', value }
            });
          } else {
            set({ changeInterval: value });
            get().broadcastState();
          }
        },

        setRoundDuration: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setRoundDuration', value }
            });
          } else {
            const newDuration = value === 300 ? Infinity : value;
            set({ 
              roundDuration: newDuration,
              roundTimer: newDuration
            });
            get().broadcastState();
          }
        },

        setIsActive: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setIsActive', value }
            });
          } else {
            if (value) {
              startTimerInterval();
            } else {
              clearExistingInterval();
            }
            set({ isActive: value });
            get().broadcastState();
          }
        },

        setCurrentIndex: (value) => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'setCurrentIndex', value }
            });
          } else {
            set({ currentIndex: value });
            get().broadcastState();
          }
        },

        resetRound: () => {
          const isControlWindow = window.name === 'controlWindow';
          
          if (isControlWindow) {
            get().broadcastChannel?.postMessage({
              type: 'CONTROL_ACTION',
              payload: { action: 'resetRound' }
            });
          } else {
            clearExistingInterval();
            set({
              currentIndex: 0,
              timer: get().changeInterval,
              roundTimer: get().roundDuration,
              isActive: true,
            });
            startTimerInterval();
            get().broadcastState();
          }
        },
      },

      // Utility to broadcast state changes
      broadcastState: () => {
        const state = {
          timer: get().timer,
          roundTimer: get().roundTimer,
          changeInterval: get().changeInterval,
          roundDuration: get().roundDuration,
          isActive: get().isActive,
          currentIndex: get().currentIndex,
        };
        
        get().broadcastChannel?.postMessage({
          type: 'STATE_UPDATE',
          payload: state,
        });
      },
    };
  })
);

export default useTimerStore;