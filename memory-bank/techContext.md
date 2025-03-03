# Technical Context: Cypher Arena

## Technologies Used
- **Backend**: Django, Django REST Framework, SQLite (for initial implementation).
- **Frontend**: React Native for web; potential for mobile app conversion later.
- **Deployment**: Cloudflare Tunnel with Nginx on Linux (Ubuntu Server). Current setup is for backend API as reverse proxy.

## Development Setup
1. Backend: Python 3.x environment with Django and DRF dependencies.
    - server: http://localhost:8000
    - running on cypher_arena_backend screen session
    - for now as runserver for fast development
2. Frontend: React Native for web development setup using npm/yarn for dependencies.
    - server: http://localhost:3000
    - running on cypher_arena_frontend screen session
3. Deployment: Linux server configuration with Cloudflare Tunnel for domain routing.

## API Configuration
### Frontend
- **File**: `frontend/src/config/apiConfig.js`
### Backend
- **File**: `backend/core/urls.py`


## Technical Constraints
- Proprietary data (word/image database) must be well-protected to prevent theft.
- SQLite is sufficient for the MVP but may demand migration to PostgreSQL as the user base grows.

## Dependencies
- Django/DRF for backend development.
- React Native for responsive and scalable front-end development.
- Cloudflare Tunnel for secure hosting and Nginx for server configuration.
- django-user-agents for identifying user agents.