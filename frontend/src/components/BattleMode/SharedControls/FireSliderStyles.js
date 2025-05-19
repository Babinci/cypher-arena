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