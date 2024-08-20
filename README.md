# polish_freestyle_app


## Aim
The aim of this project is to revolutionize Polish freestyle rap battles, drawing inspiration from the Spanish Latin scene with focus on reducing vulgarity and promoting the style and culture of the art of words.

## Current state

Actually there is word mode and image mode with customisable timer settings, frontend with backend works under one gunicorn process.   
You can check demo here: http://194.146.39.250/freestyle_app/

**About word mode**: 
There is big (~200 000) database of polish words, which are then grouped by occurency and linguistic type.
**About image mode**: There is big open source image library, which is used. There are >2000 unique categories of images, to supply maximum diversiWty of topics, in about 7GB of data on the production server


## Goals

### Main Goals

### Introduction of New Round Types
- **Beat Mode**: Integrating streaming services like Spotify/Soundcloud for instrumentals
- **Hard Mode / Soft Mode**: A new random word introduced with time intervals
- **Kick Back**: A new format one says line and second has to say 3 next lines on the same rhyme
- **Character Fights**: Thematic battles like Superman vs Batman.

### Utilizing Scene Strengths
- **Image Displays**: Create a community-contributed image base and develop a method to scrape images from platforms like X.
- **GIF Displays**: Incorporating animated GIFs into performances.
- **Classic Topics**: Maintaining the traditional elements of Polish freestyle.

## Functional Goals
- **Judging system**: Adapted to polish conditions system of judging freestyle, taken from the FMS Series in Spanish/ Latin world,
- **Tool for Organizing Freestyle Battles**: This includes creating tournaments and managing the judging of elimination stage.

## Technical Specifications
- **Frontend**: React Native for Web to support different devices in the future
- **Backend**: Django REST framework with SQLite as the initial database.

---
*This project is a community-driven initiative aimed at enriching the Polish freestyle rap scene by blending traditional elements with innovative approaches.*
