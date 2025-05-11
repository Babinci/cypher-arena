# Active Context: Cypher Arena

## Current Work Focus
-- placement of word circle words
   - brainstorming circle
   - browser tab icon and cypher arena text
   - ✅ Complete UI internationalization (English and Polish)
   - server bitwer connection
      - youtubers judges bitwer battles statistics
   - users types (judge, player, freestyle peace, battle organizer)
      - personalization
      - default round time infinity in practice modes with round duration more ux visible
   ### Challenges
   - Server migration is complete for now. Future plans include:
     - Backend on Gunicorn
     - Restart server system command

2. **Backend Updates**
   - Implement a feature for contrasting mode to calculate user rating averages.
   - Enhance code protection to prevent unauthorized access to proprietary word/images data.
   - Integrated Celery for daily news searches to find new topics and contrast pairs.
   ### Challenges
   - In contrasting mode, the challenge is to implement good filtering based on ratings from the ContrastPairRating model.
   - Code protection for the word/image data: Need to discuss how to protect a large database (80k images and 80k words), where part of the content is intellectual property and should not be scraped by competitors.

3. **Frontend Updates**
   - Remove unnecessary routes to simplify the user interface.
   - Refine timer UX for a smoother experience during battles.
   - ✅ Implemented multilingual support system with translations for all UI elements
   - ✅ Added language switcher on main page with Polish as default
   
   ### Challenges
   - Continue expanding translations for any new features added to the application.
   - Ensure consistent language usage across all components.

## Next Steps
- Finalize server migration and deploy the live application.
- Brainstorm configuration for judging mode.
- Research and implement authentication via Google, Facebook, and Apple.
- Develop beat playback integration (e.g., Spotify/YouTube/SoundCloud).

## Active Decisions and Considerations
- Prioritize web-based functionality over mobile apps for MVP.
- Focus on gathering user feedback post-launch to refine judging and beat playback systems.
