# Frontend Code Refactoring Tasks

## 1. Replace Inline Styles with CSS Solution

- [x] **Choose and setup CSS solution**
  - [x] Research and evaluate options (CSS Modules vs styled-components vs Emotion)
  - [x] Install chosen solution dependencies
  - [x] Configure build tools for CSS solution
  - [x] Create example component with new styling approach
  - [x] Document styling conventions

- [x] **Create global theme system**
  - [x] Define color palette variables
  - [x] Create spacing scale (4px, 8px, 16px, etc.)
  - [x] Define typography scale and fonts
  - [x] Create breakpoints for responsive design
  - [x] Define shadow and border-radius tokens

- [ ] **Migrate component styles**
  - [x] `TimerControls.js`
    - [x] Extract inline styles
    - [x] Create component-specific styles
    - [x] Replace style props with className/styled components
    - [x] Test visual appearance matches original
  - [ ] `ImagesMode.js`
    - [ ] Extract inline styles
    - [ ] Create responsive styles
    - [ ] Handle fullscreen mode styles
  - [ ] `BaseBattleVisualizer.js`
    - [ ] Extract canvas-related styles
    - [ ] Create animation-specific styles
    - [ ] Handle dynamic styling needs
  - [ ] `FireSmokeVisualizer.js`
    - [ ] Extract particle system styles
    - [ ] Create fire/smoke effect styles
  - [ ] Navigation components
    - [ ] Extract button styles
    - [ ] Create consistent hover/active states
  - [ ] Battle mode components
    - [ ] Migrate all word mode styles
    - [ ] Migrate image mode styles
    - [ ] Migrate beats mode styles

## 2. Implement Comprehensive Error Handling

- [x] **Create error infrastructure**
  - [x] Create custom Error classes
    - [x] `ApiError` for API failures
    - [x] `ValidationError` for input validation
    - [x] `NetworkError` for connectivity issues
  - [x] Create Error Boundary component
    - [x] Implement componentDidCatch
    - [x] Design fallback UI
    - [x] Add error reporting integration
  - [x] Create error notification system
    - [x] Toast notification component
    - [x] Error modal component
    - [x] Inline error message component

- [ ] **Add error handling to API calls**
  - [ ] `UserTracker.js`
    - [ ] Wrap location API call in try-catch
    - [ ] Handle network failures gracefully
    - [ ] Add fallback for blocked location access
  - [x] `ImagesMode.js`
    - [x] Handle image fetch failures
    - [x] Add retry mechanism
    - [x] Show user-friendly error messages
  - [ ] Word fetching components
    - [ ] Handle API failures
    - [ ] Implement offline fallback
  - [x] `indexedDBUtils.js`
    - [x] Add proper error handling for DB operations
    - [x] Handle quota exceeded errors
    - [x] Add fallback for unsupported browsers

- [x] **Implement retry mechanisms**
  - [x] Create exponential backoff utility
  - [x] Add retry wrapper for API calls
  - [x] Configure max retry attempts
  - [x] Add user-triggered retry option

## 3. Fix Memory Leaks

- [ ] **Clean up animation frames**
  - [ ] `BaseBattleVisualizer.js`
    - [ ] Store animation frame ID
    - [ ] Cancel on component unmount
    - [ ] Cancel on mode change
  - [ ] `FireSmokeVisualizer.js`
    - [ ] Clean up particle system on unmount
    - [ ] Remove particle references
    - [ ] Clear animation loops

- [ ] **Clean up intervals and timeouts**
  - [ ] `timerStore.js`
    - [ ] Track all interval IDs
    - [ ] Clear intervals on cleanup
    - [ ] Handle edge cases (multiple initializations)
  - [ ] `useTimerControl.js`
    - [ ] Clear timeouts on unmount
    - [ ] Remove interval references

- [ ] **Clean up event listeners**
  - [ ] Window resize listeners
    - [ ] Track listener references
    - [ ] Remove on component unmount
  - [ ] Keyboard event listeners
    - [ ] Document cleanup requirements
    - [ ] Add removal in useEffect cleanup
  - [ ] Mouse/touch event listeners
    - [ ] Audit all components
    - [ ] Add proper cleanup

- [ ] **Fix BroadcastChannel cleanup**
  - [ ] Close channels on unmount
  - [ ] Handle multiple window scenarios
  - [ ] Add error handling for channel operations

## 4. Extract Hard-coded Values

- [ ] **Create configuration structure**
  - [ ] Create `config/constants.js`
    - [ ] Timer defaults
    - [ ] Animation constants
    - [ ] UI dimensions
  - [ ] Create `config/theme.js`
    - [ ] Colors
    - [ ] Spacing
    - [ ] Typography
  - [ ] Create `config/api.js`
    - [ ] Endpoints
    - [ ] Timeouts
    - [ ] Retry counts

- [ ] **Replace magic numbers**
  - [ ] Timer values
    - [ ] Default intervals (35s)
    - [ ] Round durations (90s)
    - [ ] Buffer sizes (100)
  - [ ] Animation values
    - [ ] Particle counts (150)
    - [ ] Animation speeds
    - [ ] Transition durations
  - [ ] UI measurements
    - [ ] Padding values
    - [ ] Border radius
    - [ ] Font sizes
  - [ ] API configurations
    - [ ] Page sizes
    - [ ] Timeout values
    - [ ] Retry delays

## 5. Refactor Complex Functions

- [ ] **Break down FireSmokeParticleSystem.update()**
  - [ ] Extract particle creation logic
    - [ ] `createParticleFromEmitter()`
    - [ ] `createHighFlyerParticle()`
    - [ ] `createTopParticle()`
  - [ ] Extract particle update logic
    - [ ] `updateParticlePosition()`
    - [ ] `applyParticleForces()`
    - [ ] `handleTextRegionCollision()`
  - [ ] Extract spawn rate calculations
    - [ ] `calculateSpawnRates()`
    - [ ] `shouldSpawnParticle()`
  - [ ] Create separate methods for evolution paths
    - [ ] `evolveVerticalPath()`
    - [ ] `evolveHorizontalPath()`
    - [ ] `evolveSwirlPath()`

- [ ] **Simplify timerStore state management**
  - [ ] Separate broadcast logic
    - [ ] Create `BroadcastManager` class
    - [ ] Extract message handling
  - [ ] Simplify state updates
    - [ ] Create action creators
    - [ ] Reduce nested conditionals
  - [ ] Extract timer logic
    - [ ] Create `TimerManager` class
    - [ ] Separate interval handling

- [ ] **Refactor draw functions**
  - [ ] Split rendering phases
    - [ ] Background rendering
    - [ ] Particle rendering
    - [ ] Text rendering
  - [ ] Extract calculation logic
    - [ ] Position calculations
    - [ ] Size calculations
    - [ ] Color calculations

## 6. Implement User Consent

- [ ] **Create consent UI components**
  - [ ] Create consent banner
    - [ ] Design responsive layout
    - [ ] Add accept/decline buttons
    - [ ] Include privacy policy link
  - [ ] Create consent modal
    - [ ] Detailed information view
    - [ ] Granular consent options
    - [ ] Save preferences functionality
  - [ ] Create settings page
    - [ ] View current consent status
    - [ ] Update preferences
    - [ ] Data deletion request option

- [ ] **Implement consent logic**
  - [ ] Create consent store
    - [ ] Track consent status
    - [ ] Persist to localStorage
    - [ ] Handle consent updates
  - [ ] Create consent hooks
    - [ ] `useConsent()` hook
    - [ ] `useTrackingConsent()` hook
  - [ ] Integrate with UserTracker
    - [ ] Check consent before tracking
    - [ ] Skip tracking if not consented
    - [ ] Queue events until consent given

- [ ] **Add privacy compliance**
  - [ ] Create privacy policy page
  - [ ] Add cookie policy
  - [ ] Implement data export functionality
  - [ ] Add data deletion functionality
  - [ ] Document compliance measures

## 7. Add TypeScript

- [ ] **Setup TypeScript configuration**
  - [ ] Install TypeScript dependencies
  - [ ] Create tsconfig.json
    - [ ] Configure compiler options
    - [ ] Set strict mode (start loose)
    - [ ] Configure path aliases
  - [ ] Update build scripts
  - [ ] Configure IDE for TypeScript

- [ ] **Create type definitions**
  - [ ] API response types
    - [ ] Word response types
    - [ ] Image response types
    - [ ] User data types
  - [ ] Component prop types
    - [ ] Timer component props
    - [ ] Battle mode props
    - [ ] Navigation props
  - [ ] Store types
    - [ ] Timer store state
    - [ ] Action types
    - [ ] Middleware types
  - [ ] Utility function types
    - [ ] Helper function signatures
    - [ ] Configuration types

- [ ] **Migrate files progressively**
  - [ ] Start with utilities
    - [ ] `apiConfig.js` → `apiConfig.ts`
    - [ ] `translations.js` → `translations.ts`
    - [ ] Helper functions
  - [ ] Migrate stores
    - [ ] `timerStore.js` → `timerStore.ts`
    - [ ] Create store interfaces
  - [ ] Migrate components (simple to complex)
    - [ ] Button components first
    - [ ] Timer components
    - [ ] Complex visualizers last
  - [ ] Add third-party types
    - [ ] Install @types packages
    - [ ] Create custom declarations

## 8. Performance Optimizations

- [ ] **Optimize React rendering**
  - [ ] Add React.memo
    - [ ] Identify pure components
    - [ ] Wrap with React.memo
    - [ ] Define comparison functions
  - [ ] Implement useMemo
    - [ ] Heavy calculations
    - [ ] Object creation in renders
    - [ ] Array transformations
  - [ ] Use useCallback
    - [ ] Event handlers
    - [ ] Passed callbacks
    - [ ] Dependencies optimization

- [ ] **Optimize particle system**
  - [ ] Implement object pooling
    - [ ] Reuse particle objects
    - [ ] Reduce garbage collection
  - [ ] Add frame rate limiting
    - [ ] Target 30/60 FPS
    - [ ] Skip frames if needed
  - [ ] Optimize calculations
    - [ ] Cache trigonometric results
    - [ ] Reduce sqrt operations
    - [ ] Use lookup tables

- [ ] **Implement code splitting**
  - [ ] Route-based splitting
    - [ ] Lazy load battle modes
    - [ ] Split admin components
  - [ ] Component-based splitting
    - [ ] Heavy visualizers
    - [ ] Optional features
  - [ ] Library splitting
    - [ ] Separate vendor bundles
    - [ ] Extract common chunks

- [ ] **Optimize images**
  - [ ] Implement lazy loading
    - [ ] Use Intersection Observer
    - [ ] Add loading placeholders
  - [ ] Add image optimization
    - [ ] Compress images
    - [ ] Use appropriate formats
    - [ ] Implement srcSet

## 9. Clean Up Codebase

- [ ] **Remove dead code**
  - [ ] Delete commented imports
    - [ ] `BaseBattleVisualizer.js` unused imports
    - [ ] `App.js` debug imports
  - [ ] Remove unused components
    - [ ] Find unreferenced files
    - [ ] Delete safely
  - [ ] Clean up console.logs
    - [ ] Remove debug logs
    - [ ] Convert to proper logging

- [ ] **Standardize code style**
  - [ ] Configure ESLint
    - [ ] Choose style guide
    - [ ] Add custom rules
    - [ ] Fix all warnings
  - [ ] Configure Prettier
    - [ ] Set formatting rules
    - [ ] Format all files
    - [ ] Add pre-commit hooks
  - [ ] Standardize naming
    - [ ] Component names
    - [ ] File names
    - [ ] Variable names

- [ ] **Organize file structure**
  - [ ] Group related components
  - [ ] Create feature folders
  - [ ] Move utilities to utils/
  - [ ] Separate concerns

## 10. Testing Implementation

- [ ] **Setup testing infrastructure**
  - [ ] Configure Jest
    - [ ] Install dependencies
    - [ ] Create jest.config.js
    - [ ] Setup test scripts
  - [ ] Configure React Testing Library
    - [ ] Install RTL
    - [ ] Create test utilities
    - [ ] Setup custom renders
  - [ ] Add coverage reporting
    - [ ] Configure coverage thresholds
    - [ ] Add coverage badges
    - [ ] CI integration

- [ ] **Write unit tests**
  - [ ] Utility functions
    - [ ] API utilities
    - [ ] Format functions
    - [ ] Calculations
  - [ ] Custom hooks
    - [ ] Timer hooks
    - [ ] API hooks
    - [ ] State hooks
  - [ ] Small components
    - [ ] Buttons
    - [ ] Inputs
    - [ ] Display components

- [ ] **Write integration tests**
  - [ ] Timer functionality
    - [ ] Start/stop behavior
    - [ ] Reset functionality
    - [ ] Interval changes
  - [ ] Battle modes
    - [ ] Mode switching
    - [ ] Data flow
    - [ ] User interactions
  - [ ] API integration
    - [ ] Data fetching
    - [ ] Error handling
    - [ ] Retry logic

- [ ] **Add E2E tests**
  - [ ] Setup Playwright/Cypress
  - [ ] Critical user paths
    - [ ] Mode selection
    - [ ] Timer operations
    - [ ] Fullscreen toggle
  - [ ] Cross-browser testing
  - [ ] Mobile testing

## 11. Documentation

- [ ] **Code documentation**
  - [ ] Add JSDoc comments
    - [ ] All public functions
    - [ ] Complex algorithms
    - [ ] Component props
  - [ ] Add inline comments
    - [ ] Complex logic
    - [ ] Business rules
    - [ ] Workarounds

- [ ] **User documentation**
  - [ ] Update README
    - [ ] Installation steps
    - [ ] Development setup
    - [ ] Deployment guide
  - [ ] Create user guides
    - [ ] Feature documentation
    - [ ] Troubleshooting
  - [ ] API documentation
    - [ ] Endpoint descriptions
    - [ ] Request/response examples

- [ ] **Developer documentation**
  - [ ] Architecture overview
  - [ ] Component hierarchy
  - [ ] State management guide
  - [ ] Contributing guidelines
  - [ ] Code style guide

