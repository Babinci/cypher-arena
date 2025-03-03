# Cypher Arena

![Cypher Arena Logo](logo.png)

## Aim

The aim of this project is to revolutionize Polish freestyle rap battles, drawing inspiration from the Spanish Latin scene with focus on reducing vulgarity and promoting the style and culture of the art of words. Cypher Arena addresses the gap in existing tools by providing a centralized platform for both fun and competitive freestyle activities. The goal is to be a tool for players, judges, organizers, and also a source of viral content.

## Current state

Cypher Arena is live at https://cypher-arena.com/. Currently, there is word mode, image mode, contrastive mode, and topic mode with customizable timer settings.

**About word mode**: There is a large (~200,000) database of Polish words, which are then grouped by occurrence and linguistic type.
**About image mode**: There is a large open-source image library, which is used. There are >2000 unique categories of images, to supply maximum diversity of topics, in about 7GB of data on the production server.
**About contrastive mode**: This mode provides AI-generated pairs for contrasting freestyle.
**About topic mode**: This mode provides more than 60000 topics generated in an agentic RAG process.

## Logo

The Cypher Arena logo represents the dynamic and competitive nature of freestyle rap battles. It symbolizes the energy, creativity, and artistry involved in the art of words.

## Core Features

*   Basic Battle System: Timer functionality, second window support, basic round management, and content display.
*   Practice Modes (Topic, Word, Image, Contrasting):  Various practice modes to hone freestyle skills.

## Goals

### Main Goals

### Introduction of New Round Types

*   **Beat Mode**: Integrating streaming services like Spotify/Soundcloud for instrumentals
*   **Hard Mode / Soft Mode**: A new random word introduced with time intervals
*   **Kick Back**: A new format one says line and second has to say 3 next lines on the same rhyme
*   **Character Fights**: Thematic battles like Superman vs Batman.

### Utilizing Scene Strengths

*   **Image Displays**: Create a community-contributed image base and develop a method to scrape images from platforms like X.
*   **GIF Displays**: Incorporating animated GIFs into performances.
*   **Classic Topics**: Maintaining the traditional elements of Polish freestyle.

## Functional Goals

*   **Judging system**: Adapted to polish conditions system of judging freestyle, taken from the FMS Series in Spanish/ Latin world.
*   **Tool for Organizing Freestyle Battles**: This includes creating tournaments and managing the judging of the elimination stage.

## Technical Specifications

*   **Frontend**: React Native for Web, targeting both web and potential mobile platforms. Key components include App, BaseBattleVisualizer, and TimerControls. State management is handled using Zustand.
*   **Backend**: Django REST framework with SQLite as the initial database. Future upgrades may include PostgreSQL.
*   **Task Queue**: Celery for asynchronous tasks like daily news searches.
*   **Deployment**: Cloudflare Tunnel with Nginx on Linux (Ubuntu Server).

## Current Work Focus

*   **Frontend UI Improvements**: Placement of word circle words, browser tab icon, timer text internationalization, and timer UX refinement.
*   **Backend Updates**: Implementing user rating averages for contrasting mode and enhancing code protection for word/image data.
*   **Next Steps**: Brainstorming judging mode configuration, researching authentication (Google, Facebook, Apple), and developing beat playback integration (Spotify/YouTube/SoundCloud).

## Frontend Documentation

Detailed frontend documentation is available in the \`memory-bank/\` directory:
*   \`frontend_documentation.md\`:  Provides an architecture overview, component hierarchy, state management details, API communication, testing strategy, performance considerations, and dependency inventory.
*   \`frontend_battle_mode.md\`:  Describes the modules used in the Frontend Battle Mode, including TopicMode.js, BaseBattleVisualizer.js, TimerControls.js, useTimerControl.js, timerStore.js, ImagesMode.js, ImagePreloader.js, indexedDBUtils.js, ContrastingMode.js, and WordMode.js.

---

*This project is a community-driven initiative aimed at enriching the Polish freestyle rap scene by blending traditional elements with innovative approaches.*
