# Technical Context: Cypher Arena

## Technologies Used
- **Backend**: Django, Django REST Framework, SQLite (for initial implementation).
- **Frontend**: 
  - React Native for web; potential for mobile app conversion later.
  - Zustand for state management
  - React Router v6 for routing
  - Canvas API for battle mode visualization
  - IndexedDB for image caching
  - BroadcastChannel API for cross-window communication
  - Oswald font family for consistent text display
- **Deployment**: Cloudflare Tunnel with Nginx on Linux (Ubuntu Server). Current setup is for backend API as reverse proxy.
- **Task Queue**: Celery for asynchronous task processing.

## Development Setup
1. Backend: Python 3.x environment with Django and DRF dependencies.
    - server: http://localhost:8000
    - running on cypher_arena_backend screen session
    - for now as runserver for fast development
2. Frontend: React Native for web development setup using npm/yarn for dependencies.
    - server: http://localhost:3000
    - running on cypher_arena_frontend screen session
3. Deployment: Linux server configuration with Cloudflare Tunnel for domain routing.
4. Celery:
    - Celery worker: `celery -A core worker -l info` (runs in `cypher_arena_celery_worker` screen session)
    - Celery beat: `celery -A core beat -l info` (runs in `cypher_arena_celery_beat` screen session)

## API Configuration
### Frontend
- **File**: `frontend/src/config/apiConfig.js`
  - Centralized configuration for all API endpoints
  - Environment-aware base URL (REACT_APP_API_BASE_URL)
  - Endpoint definitions for each feature area
### Backend
- **File**: `backend/core/urls.py`

## Frontend Architecture
1. **Component Structure**:
   - Feature-based organization (`/components/Account`, `/components/BattleMode`, etc.)
   - Battle modes organized by type (WordModes, ImagesMode, BeatsMode)
   - Shared components extracted to dedicated folders (SharedControls, TimerSettings)

2. **State Management**:
   - Zustand store for global timer state
   - Custom hooks for encapsulating logic
   - Cross-window state synchronization via BroadcastChannel

3. **Battle Mode System**:
   - BaseBattleVisualizer as foundation for text-based modes
   - Canvas-based rendering for performance
   - Content-aware text sizing and formatting
   - IndexedDB for image caching in Images mode

## Technical Constraints
- Proprietary data (word/image database) must be well-protected to prevent theft.
- SQLite is sufficient for the MVP but may demand migration to PostgreSQL as the user base grows.
- Cross-browser compatibility for Canvas and IndexedDB usage.
- Mobile responsiveness with touch controls support.

## Dependencies
- Django/DRF for backend development.
- React Native for responsive and scalable front-end development.
- Cloudflare Tunnel for secure hosting and Nginx for server configuration.
- django-user-agents for identifying user agents.
- Zustand for frontend state management.
- React Router v6 for routing.
- Axios for HTTP requests.
- React Full Screen for fullscreen battle mode display.