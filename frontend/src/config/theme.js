// config/theme.js
// Global theme system for styled-components

const theme = {
  // Colors from CSS variables
  colors: {
    // Background colors
    bgDeep: 'var(--bg-deep, #131313)',
    bgMedium: 'var(--bg-medium, #191919)',
    bgLight: 'var(--bg-light, #292929)',
    
    // Accent colors
    accentPrimary: 'var(--accent-primary, #1DB954)',
    accentSecondary: 'var(--accent-secondary, #1ED760)',
    accentTertiary: 'var(--accent-tertiary, #FC5658)',
    
    // Battle mode-specific colors (fire theme)
    fire: {
      light: 'rgba(255, 180, 100, 0.9)',
      medium: 'rgba(255, 120, 60, 0.8)',
      dark: 'rgba(255, 80, 30, 0.7)',
      accent: 'rgba(255, 220, 160, 0.95)',
      border: 'rgba(255, 120, 60, 0.4)',
      highlight: 'rgba(255, 200, 100, 1)',
    },
    
    // Transparency utilities
    overlay: {
      light: 'var(--overlay-light, rgba(255, 255, 255, 0.1))',
      dark: 'rgba(0, 0, 0, 0.5)',
      medium: 'rgba(0, 0, 0, 0.3)',
    }
  },
  
  // Typography
  fonts: {
    display: 'var(--font-display, "Oswald", "Oswald Fallback", "Impact", sans-serif)',
    body: 'var(--font-body, "Space Grotesk", sans-serif)',
  },
  
  // Font sizes
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Borders
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.25rem',    // 4px
    lg: '0.5rem',     // 8px
    xl: '1rem',       // 16px
    full: '9999px',   // Full circular
  },
  
  // Shadows
  shadows: {
    sm: 'var(--shadow-soft, 0 4px 12px rgba(0, 0, 0, 0.25))',
    md: 'var(--shadow-hard, 0 8px 20px rgba(0, 0, 0, 0.35))',
    lg: '0 10px 25px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
    glow: {
      primary: '0 0 15px var(--accent-primary)',
      fire: '0 0 15px rgba(255, 120, 60, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7)',
    },
  },
  
  // Gradients
  gradients: {
    main: 'var(--gradient-main, linear-gradient(135deg, var(--bg-deep), var(--bg-medium)))',
    accent: 'var(--gradient-accent, linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)))',
    button: 'var(--gradient-button, linear-gradient(to right, var(--accent-primary), var(--accent-secondary)))',
    // Battle mode fire gradients
    fire: {
      panel: 'linear-gradient(to top, rgba(10, 10, 10, 0.95), rgba(20, 10, 5, 0.85))',
      active: 'linear-gradient(135deg, rgba(255, 60, 60, 0.8), rgba(200, 40, 40, 0.7))',
      inactive: 'linear-gradient(135deg, rgba(255, 120, 60, 0.8), rgba(255, 80, 30, 0.7))',
      badge: 'linear-gradient(135deg, rgba(255, 120, 60, 0.15), rgba(255, 80, 30, 0.1))',
      button: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.7))',
    },
  },
  
  // Z-index 
  zIndices: {
    hidden: -1,
    base: 0,
    raised: 1,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
    // App-specific
    timerPanel: 500,
  },
  
  // Animation durations
  animation: {
    fast: '0.2s',
    medium: '0.3s',
    slow: '0.5s',
    easing: {
      default: 'ease',
      bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
    },
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '480px',   // Extra small devices
    sm: '640px',   // Small devices
    md: '768px',   // Medium devices
    lg: '1024px',  // Large devices
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // 2x Extra large devices
  },

  // UI dimensions
  dimensions: {
    timer: {
      height: '88px',
      padding: '15px 10px 8px 10px',
      fontSize: '53px',
      badgeHeight: '48px',
      buttonFontSize: '13px',
    },
    sliders: {
      width: '150px',
      height: '8px',
      thumbSize: '20px',
    }
  },
};

export default theme;