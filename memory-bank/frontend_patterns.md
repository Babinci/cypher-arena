# Frontend System Patterns: Cypher Arena

## Component Architecture

The frontend follows a feature-based component structure:

1. **Feature-Based Directory Organization**:
   - `/components/` organized by feature (Account, BattleMode, Home, etc.)
   - Battle modes separated by type (WordModes, ImagesMode, BeatsMode)
   - Shared functionality extracted to dedicated folders (SharedControls, TimerSettings)

2. **Component Hierarchy**:
   - `BaseBattleVisualizer`: Core component for text-based visualizations
   - Specialized implementations for different modes (WordMode, TopicMode, ContrastingMode)
   - Independent implementations for media-based modes (ImagesMode, BeatsMode)

3. **Composition Pattern**:
   - Components composed from smaller, reusable pieces
   - Separation of controls from visualization
   - Shared timer functionality across battle modes

## State Management

1. **Zustand Implementation**:
   - Central `timerStore.js` for timer-related state
   - Clean store creation pattern with DevTools integration
   - Organized actions and selectors

2. **State Broadcasting**:
   - BroadcastChannel API for cross-window state synchronization
   - Main window as state authority, control windows as receivers
   - Action message pattern for cross-window requests

3. **Custom Hooks**:
   - `useTimerControl`: Wraps Zustand store consumption with UI logic
   - `useTimers`: Traditional React hooks for simple timer state
   - Clear separation of concerns between UI and state logic

## Battle Mode Implementation

1. **Base Architecture**:
   - Canvas-based rendering for text modes (`BaseBattleVisualizer`)
   - Responsive design with viewport-aware sizing
   - Content-aware text rendering system (`WordTextRenderer`)

2. **Mode-Specific Implementations**:
   - **WordMode**: Simple single-word display
   - **TopicMode**: Topic phrase display 
   - **ContrastingMode**: Split-format display with "vs" between items
   - **ImagesMode**: IndexedDB-cached image display with preloading
   - **BeatsMode**: Spotify player integration

3. **Shared Features**:
   - Timer controls (play/pause, interval adjustment)
   - Fullscreen support
   - External control window
   - Mobile responsiveness

## Client-Side Data Handling

1. **API Integration**:
   - Centralized configuration in `apiConfig.js`
   - Component-specific API calls
   - Error handling with try/catch blocks
   - CSRF token integration for Django compatibility

2. **Image Caching**:
   - IndexedDB for local image storage
   - Preloading system for smooth transitions
   - Buffer management to prevent memory issues

## Routing Structure

1. **React Router v6 Implementation**:
   - Centralized route configuration in App.js
   - Simple route-to-component mapping
   - Back button navigation component

2. **Main Routes**:
   - Home page
   - Battle mode views (Word, Topic, Image, Beats, Contrasting)
   - User management views (Account, Report Feedback)
   - Battle organization views (Judging, Organize)

## Technical Design Strengths

1. **Responsive Design**:
   - Adapts to different screen sizes
   - Mobile-specific optimizations
   - Dynamic text sizing based on viewport and content

2. **Performance Optimizations**:
   - Canvas-based rendering for smooth animations
   - Image preloading and caching
   - RequestAnimationFrame for efficient animations

3. **Extensibility**:
   - Easy addition of new battle modes
   - Pluggable data fetching
   - Reusable timing system

4. **Development Patterns**:
   - Consistent file structure
   - Component composition over inheritance
   - Clear separation of concerns
   - Custom hooks for reusable logic

## Font Standardization

- Oswald font implemented consistently across all battle modes
- Improves visual coherence between different visualization types
- Ensures proper text rendering on all devices

## Canvas Text Rendering Patterns

### Word Visibility Issues and Solutions

When rendering text on canvas elements, several issues can impact visibility:

1. **Font Size Scaling**:
   - Issue: Text too small relative to large canvas dimensions
   - Solution: Calculate font size as a percentage (25%) of the smaller dimension
   - Implementation: `const fontSize = Math.min(width, height) * 0.25;`

2. **Container Height Constraints**:
   - Issue: Timer controls taking excessive screen space (94vh)
   - Solution: Fixed height for timer panel (60px)
   - Location: `src/components/BattleMode/SharedControls/TimerControls.js`

3. **Text Bounds Checking**:
   - Issue: Text overflowing rectangle boundaries
   - Solution: Auto-scale font size based on text width
   ```javascript
   const textWidth = ctx.measureText(text).width;
   const maxTextWidth = width - (padding * 2);
   if (textWidth > maxTextWidth) {
     actualFontSize = fontSize * (maxTextWidth / textWidth);
   }
   ```

4. **Z-Index Hierarchy**:
   - Issue: UI elements overshadowing canvas content
   - Solution: Proper z-index ordering
   - Timer controls: 500
   - Control buttons: 500
   - Canvas: 10
   - Back button: 2000

5. **Font Loading**:
   - Issue: Canvas rendering before fonts load
   - Solution: Use simple font fallbacks for consistent rendering
   - Font family: `Arial` (removed CSS variables for canvas compatibility)

### Debugging Process

When debugging canvas text visibility issues:

1. Create minimal test components to verify basic canvas rendering
2. Add comprehensive logging to track calculations
3. Use visual debugging aids (rectangles, crosshairs)
4. Test with static values before implementing dynamic calculations
5. Scale font sizes appropriately for different canvas dimensions
6. Ensure proper z-index hierarchy to prevent UI overlap

### Final Implementation

The fixed `WordTextRenderer.js` includes:
- Dynamic font sizing based on container dimensions
- Automatic text scaling to fit within bounds
- Proper contrast with black stroke on white text
- Special handling for contrast mode with VS separator
- Consistent rendering across different canvas sizes