# Word Modes Components

This directory contains various battle modes that display words, topics, and contrasting items for freestyle rap battles.

## Components Overview

- **BaseBattleVisualizer.js** - Core visualization component that handles rendering and animation
- **WordMode.js** - Simple word display mode (single words)
- **TopicMode.js** - Topic mode (multiple related words)
- **ContrastingMode.js** - Contrast mode (pairs of contrasting elements)
- **WordTextRenderer.js** - Text rendering logic for all modes
- **Gradient_Rectangle.js** - Background rendering for the text display

## Font Size Handling

The font size handling is now unified across all battle modes through the `WordTextRenderer.js` component:

- Font sizes adjust dynamically based on content length and available space
- A universal approach is used for all modes to ensure consistency
- Font size limits are now standardized:
  - Min size: 16px (mobile) / 22px (desktop)
  - Max size: 60px (mobile) / 100px (desktop)

Text is automatically wrapped and sized to:
1. Fit within the available rectangle
2. Maintain readability
3. Maximize font size for visibility
4. Be consistent across different content types (words, topics, contrast pairs)

## Responsive Design

- Responsive design adjusts for mobile and desktop viewing
- Line height and spacing are proportional to font size
- Different line wrapping behavior for mobile vs desktop

## Device Compatibility

The components are optimized for the following devices (per screen display requirements):
- Projectors (30-40px minimum font size)
- Mobile devices (16-20px minimum font size)
- Desktop computers (16-24px minimum font size)