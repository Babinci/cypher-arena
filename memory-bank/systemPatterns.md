# System Patterns: Cypher Arena

## System Architecture
- **Backend**: Django/DRF for a robust and scalable API, with SQLite for initial development. Future upgrades may include PostgreSQL.
- **Frontend**: React Native for web targeting both web and potential mobile platforms.

## Key Technical Decisions
1. Use Django and DRF for backend due to familiarity and scalability.
2. Choose React Native to enable an easier transition from web to mobile apps.
3. Employ Cloudflare Tunnel for secure, low-cost hosting with Nginx as the web server.

## Design Patterns in Use
- **Modular Design**: Separate modules for battle organization, practice, login, and beat modes to maintain flexibility.
- **API-driven Architecture**: Frontend communicates with the backend via REST APIs for a decoupled design.
- **Contrast Pair System**: Implements fingerprint-based anonymous ratings with unique user+pair constraints. Missing calculated average rating field and item uniqueness validation.

## Component Relationships
- The **practice module** relies on the word/image database for prompts and integrates with beat playback.
- The **battle module** connects to the judging system and beat playback as part of the tournament flow.
- The **user module** handles registration, authentication, and rating history.
- The **contrasting_mode module** includes a `ContrastPair` model for storing pairs of items and a `ContrastPairRating` model to track user ratings based on a unique user fingerprint.