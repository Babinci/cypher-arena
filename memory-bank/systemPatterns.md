# System Patterns: Cypher Arena

## System Architecture
- **Backend**: Django/DRF for a robust and scalable API, with SQLite for initial development. Future upgrades may include PostgreSQL.
- **Frontend**: React Native for web targeting both web and potential mobile platforms.
- **Task Queue**: Celery for asynchronous tasks, including daily news searches for new topics and contrast pairs.

## Key Technical Decisions
1. Use Django and DRF for backend due to familiarity and scalability.
2. Choose React Native to enable an easier transition from web to mobile apps.
3. Employ Cloudflare Tunnel for secure, low-cost hosting with Nginx as the web server.
4. Implement Zustand for frontend state management, particularly for timer functionality.
5. Use canvas-based rendering for text battle modes to optimize performance.
6. Leverage IndexedDB for client-side image caching to improve performance.

## Design Patterns in Use
- **Modular Design**: Separate modules for battle organization, practice, login, and beat modes to maintain flexibility.
- **API-driven Architecture**: Frontend communicates with the backend via REST APIs for a decoupled design.
- **Contrast Pair System**: Implements fingerprint-based anonymous ratings with unique user+pair constraints. Missing calculated average rating field and item uniqueness validation.
- **Component Composition**: Frontend uses a BaseBattleVisualizer that is extended for different battle modes.
- **Custom Hooks Pattern**: Frontend uses custom hooks (useTimerControl, useTimers) to encapsulate reusable logic.
- **BroadcastChannel Pattern**: Uses the BroadcastChannel API for cross-window state synchronization.

## Component Relationships
- The **practice module** relies on the word/image database for prompts and integrates with beat playback.
- The **battle module** connects to the judging system and beat playback as part of the tournament flow.
- The **user module** handles registration, authentication, and rating history.
- The **contrasting_mode module** includes a `ContrastPair` model for storing pairs of items and a `ContrastPairRating` model to track user ratings based on a unique user fingerprint.
- The **Celery tasks** perform daily news searches to update the topic and contrast pair databases.
- The **frontend battle modes** (WordMode, TopicMode, ContrastingMode, ImagesMode, BeatsMode) share timer and control functionality while implementing mode-specific visualizations.
- The **TimerControls component** works with the timerStore (Zustand) to provide consistent timing across all battle modes.