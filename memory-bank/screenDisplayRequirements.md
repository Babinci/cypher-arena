# Screen Display Requirements

## User Stories

- **As a battle organizer:**
  - I want to launch the web app on a full-screen projector or slide projector to present to people during a battle.

- **As an audience member:**
  - I must be able to clearly see the topic from the middle of the audience.

- **As a freestyler:**
  - I want to launch the web app on:
    - iPhone or Samsung Android and clearly see images/words.
    - PC monitor and clearly see images/words.

## Device Matrix

| Device                | Screen Size / Resolution |
|-----------------------|-------------------------|
| iPhone 12             | 6.1" (1170 x 2532 px)   |
| Samsung Galaxy S21    | 6.2" (1080 x 2400 px)   |
| 1080p Projector       | 1920 x 1080 px          |
| 4K TV                 | 3840 x 2160 px          |
| 22-inch PC Monitor    | ~1920 x 1080 px         |
| 13-inch Laptop        | ~1920 x 1080 px         |

## What Works Well

- **Images Mode:**
  - Scaled images display well on mobile, monitor, and TV (tested, looks nice).
- **Second Window Feature with full screen:**
  - Works correctly with browser, ready for MVP.

## Current Issues

- **Words Mode:**
  - Uses a static circle with the word displayed.
  - Problem: Sometimes words go outside the circle in Contrasting Mode.
  - Problem: Words are not always properly vertically placed in Topics Mode.

- **General:**
  - All word-based modes (Word Mode, Topics Mode, Contrasting Mode) use a circle with a placed word.
  - **Open Question:** Should we reconsider/brainstorm changing from the circle? The challenge is to present the word well on all needed devices.

## Open Questions / To Be Decided

- Should the word display remain in a circle, or should we explore alternative layouts for better cross-device compatibility?
- What are the minimum and recommended font sizes for words/topics on each device type (projector, mobile, desktop)?
- Should there be a "test display" or preview mode for organizers to check visibility before starting a battle?
- Are there accessibility requirements (contrast, color blindness, etc.) for word and image display?
- Should we support dynamic resizing or responsive scaling for all display elements?
- Do we need to support dark mode or high-contrast mode for better visibility in different lighting conditions?

## Suggestions for Additional Information

- **Visibility Guidelines:**
  - Minimum font size, recommended contrast ratios, and padding/margin requirements for each mode.
- **Screenshots or Mockups:**
  - Example images of what "good" and "bad" displays look like for each mode.
- **User Feedback:**
  - Any feedback from real users about display issues or successes.
- **Acceptance Criteria:**
  - Clear, testable criteria for "display is good enough" on each device.

