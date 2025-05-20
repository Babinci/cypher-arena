// components/BattleMode/SharedControls/FireSliderStyles.js
import React from 'react';
import theme from '../../../config/theme';

// Custom fire slider styles as a reusable component
const FireSliderStyles = () => {
  return (
    <style>{`
      /* Reset all default focus styles to avoid green outlines */
      *:focus {
        outline-color: rgba(255, 140, 70, 0.8) !important;
        box-shadow: 0 0 0 2px rgba(255, 140, 70, 0.3) !important;
      }
      
      /* Specific rule for the slider focus outline */
      input[type="range"]:focus {
        outline-color: rgba(255, 140, 70, 0.8) !important;
        box-shadow: 0 0 0 2px rgba(255, 140, 70, 0.3) !important;
      }
      
      /* Enhanced fire slider styling */
      .fire-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, rgba(217, 119, 6, 0.9), rgba(146, 64, 14, 0.3)) !important;
        border-radius: 2px;
        outline: none;
        margin: 0;
        position: relative;
      }
      
      .fire-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: ${theme.dimensions.sliders.thumbSize};
        height: ${theme.dimensions.sliders.thumbSize};
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(217, 119, 6, 0.8)) !important;
        border: 2px solid rgba(217, 119, 6, 0.8) !important;
        box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      
      .fire-slider::-moz-range-thumb {
        width: ${theme.dimensions.sliders.thumbSize};
        height: ${theme.dimensions.sliders.thumbSize};
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 180, 100, 0.9), rgba(217, 119, 6, 0.8)) !important;
        border: 2px solid rgba(217, 119, 6, 0.8) !important;
        box-shadow: 0 0 8px rgba(255, 140, 70, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3) !important;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      
      .fire-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 12px rgba(255, 160, 80, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4) !important;
        background: radial-gradient(circle, rgba(255, 200, 120, 0.95), rgba(237, 139, 26, 0.85)) !important;
      }
      
      .fire-slider::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 12px rgba(255, 160, 80, 0.7), 0 2px 4px rgba(0, 0, 0, 0.4) !important;
        background: radial-gradient(circle, rgba(255, 200, 120, 0.95), rgba(237, 139, 26, 0.85)) !important;
      }
      
      .fire-slider:active::-webkit-slider-thumb {
        transform: scale(1.2);
        box-shadow: 0 0 15px rgba(255, 180, 100, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5) !important;
        background: radial-gradient(circle, rgba(255, 220, 140, 1), rgba(255, 160, 80, 0.9)) !important;
      }
      
      .fire-slider:active::-moz-range-thumb {
        transform: scale(1.2);
        box-shadow: 0 0 15px rgba(255, 180, 100, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5) !important;
        background: radial-gradient(circle, rgba(255, 220, 140, 1), rgba(255, 160, 80, 0.9)) !important;
      }
      
      /* Progress fill effect */
      .fire-slider::-webkit-slider-runnable-track {
        background: linear-gradient(to right, 
          rgba(255, 160, 80, 0.8) 0%, 
          rgba(255, 160, 80, 0.8) var(--value), 
          rgba(0, 0, 0, 0.2) var(--value), 
          rgba(0, 0, 0, 0.2) 100%) !important;
        height: 4px;
        border-radius: 2px;
      }
      
      .fire-slider::-moz-range-progress {
        background: linear-gradient(90deg, rgba(255, 120, 60, 0.6), rgba(255, 160, 80, 0.9)) !important;
        height: 4px;
        border-radius: 2px;
      }
      
      .fire-slider::-moz-range-track {
        width: 100%;
        height: 4px;
        background: rgba(0, 0, 0, 0.2) !important;
        border-radius: 2px;
        border: none;
      }
      
      /* Infinity button styling with enhanced hover states */
      .infinity-button {
        position: absolute;
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all ${theme.animation.fast} ${theme.animation.easing.default};
      }
      
      .infinity-button.active {
        background: rgba(255, 180, 100, 0.9) !important;
        color: rgba(255, 240, 180, 1) !important;
        border: 2px solid rgba(255, 180, 100, 0.8) !important;
        box-shadow: 0 0 8px rgba(255, 160, 80, 0.5) !important;
      }
      
      .infinity-button.inactive {
        background: rgba(40, 40, 40, 0.6) !important;
        color: rgba(255, 180, 100, 0.7) !important;
        border: 1px solid rgba(255, 120, 60, 0.3) !important;
      }
      
      .infinity-button:hover {
        background: rgba(255, 140, 60, 0.3) !important;
        color: rgba(255, 220, 160, 0.9) !important;
        border-color: rgba(255, 140, 60, 0.5) !important;
        box-shadow: 0 0 8px rgba(255, 140, 60, 0.3) !important;
      }
      
      .infinity-button.inactive:hover {
        background: rgba(60, 40, 20, 0.7) !important;
        color: rgba(255, 200, 120, 0.8) !important;
      }
      
      .infinity-button:active {
        transform: translateY(-50%) scale(0.95);
        box-shadow: 0 0 5px rgba(255, 160, 80, 0.3) !important;
      }
      
      /* Button hover and focus overrides to ensure no green colors */
      button:hover, button:focus {
        background: linear-gradient(to bottom, rgba(255, 120, 60, 0.8), rgba(200, 80, 20, 0.9)) !important;
        color: rgba(255, 240, 200, 1) !important;
        border-color: rgba(255, 140, 70, 0.6) !important;
        box-shadow: 0 0 10px rgba(255, 140, 60, 0.3) !important;
      }
      
      /* Make sure interval buttons match fire theme */
      .interval-badge button {
        background: transparent !important;
        color: rgba(255, 180, 100, 0.8) !important;
        border: 1px solid rgba(255, 120, 60, 0.3) !important;
      }
      
      .interval-badge button:hover {
        background: rgba(255, 120, 60, 0.2) !important;
        color: rgba(255, 220, 160, 1) !important;
        border-color: rgba(255, 140, 60, 0.5) !important;
      }
      
      /* Round Time Slider Thumb Display */
      .round-time-thumb-display {
        position: absolute;
        width: 44px;
        height: 28px;
        background: linear-gradient(to bottom, #F8A932, #DD7D1B);
        color: #fff;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5), 0 0 8px rgba(255, 140, 60, 0.5);
        font-size: 16px;
        z-index: 10; /* Higher z-index to ensure it's always clickable */
        font-family: var(--font-display);
        transition: transform 0.1s ease; /* Only animate transform for better dragging */
        border: 2px solid rgba(255, 220, 160, 0.4);
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        cursor: grab;
        user-select: none; /* Prevent text selection */
        touch-action: none; /* Better touch handling */
        /* Remove pointer and let the thumb sit directly on the track line */
        top: -14px; /* Position thumb centered on the track */
        margin-top: 0; /* Reset any margins */
      }
      
      /* Add drag arrows to indicate it's adjustable */
      .round-time-thumb-display::before {
        content: "⇄";
        position: absolute;
        bottom: -15px;
        font-size: 12px;
        color: rgba(255, 180, 100, 0.9);
        text-shadow: 0 1px 1px rgba(0,0,0,0.6);
      }
      }
      
      .round-time-thumb-display:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      }
      
      .round-time-thumb-display:active, 
      .round-time-thumb-display.dragging {
        cursor: grabbing !important;
        transform: scale(0.98);
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      }
      
      /* Round Time Track Styling - Simplified with one track */
      .round-time-track {
        position: absolute;
        height: 4px;
        top: 50%;
        margin-top: -2px; /* Center the track vertically */
        background: rgba(40, 20, 10, 0.6);
        border-radius: 2px;
        width: 100%;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.3);
        cursor: pointer; /* Make track clickable */
      }
      
      /* Time markers/ticks - with exact step positions */
      .round-time-track::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 4px;
        height: 10px;
        /* Add markers at each step value position */
        background-image: 
          /* 30s */
          linear-gradient(to bottom, rgba(255, 180, 100, 0.7), rgba(255, 180, 100, 0.7)),
          /* 60s */
          linear-gradient(to bottom, rgba(255, 180, 100, 0.7), rgba(255, 180, 100, 0.7)),
          /* 120s (2m) */
          linear-gradient(to bottom, rgba(255, 180, 100, 0.7), rgba(255, 180, 100, 0.7));
        background-position: 
          calc(1/13 * 100% + 0%) 0,  /* 30s = 2nd element (index 1) of 14 steps */
          calc(6/13 * 100% + 0%) 0,  /* 60s = 7th element (index 6) of 14 steps */
          calc(10/13 * 100% + 0%) 0; /* 120s = 11th element (index 10) of 14 steps */
        background-size: 
          2px 6px,  /* 30s */
          2px 8px,  /* 60s */
          2px 8px;  /* 120s */
        background-repeat: no-repeat;
        pointer-events: none;
      }
      
      /* Tick labels with exact positioning */
      .round-time-track::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 16px;
        height: 14px;
        font-size: 10px;
        font-weight: 600;
        pointer-events: none;
      }
      
      /* Individual tick labels with exact positioning */
      .round-time-track .tick-30s,
      .round-time-track .tick-60s,
      .round-time-track .tick-120s {
        position: absolute;
        top: 16px;
        transform: translateX(-50%);
        font-size: 10px;
        color: rgba(255, 180, 100, 0.7);
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
      }
      
      .round-time-track .tick-30s {
        left: calc(1/13 * 100% + 0%);
        content: "30s";
      }
      
      .round-time-track .tick-60s {
        left: calc(6/13 * 100% + 0%);
        content: "1m";
      }
      
      .round-time-track .tick-120s {
        left: calc(10/13 * 100% + 0%);
        content: "2m";
      }
      
      .round-time-track-fill {
        position: absolute;
        height: 4px;
        top: 50%;
        margin-top: -2px; /* Center the track fill vertically */
        background: linear-gradient(to right, #F8A932, #DD7D1B);
        border-radius: 2px;
        transition: width 0.1s ease-out;
        pointer-events: none; /* Allow clicks to pass through to track */
      }
      
      /* Make track visually clear it's interactive */
      .round-time-track:hover {
        background: rgba(50, 25, 12, 0.7);
      }
      
      .round-time-track:active {
        background: rgba(60, 30, 15, 0.75);
      }
      
      /* Round Time Label Styling */
      .round-time-label {
        font-size: 12px;
        color: rgba(255, 200, 120, 0.85) !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        letter-spacing: 0.5px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      /* Very specific override for the round time slider to ensure no green focus effects */
      .round-time-slider-control input[type="range"]:focus,
      input.fire-slider:focus,
      input[type="range"].fire-slider:focus {
        outline-color: rgba(255, 140, 70, 0.8) !important;
        box-shadow: 0 0 0 2px rgba(255, 140, 70, 0.3) !important;
        border-color: rgba(255, 140, 70, 0.5) !important;
      }
    `}</style>
  );
};

export default FireSliderStyles;