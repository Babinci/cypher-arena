# Frontend Battle Mode Modules

This document provides an overview of the modules used in the Frontend Battle Mode.

## TopicMode.js

*   **Purpose:** This component is responsible for displaying topics in a visually appealing way (circles). It fetches topic data from an API endpoint and formats the text to fit within the circles.
*   **Key Functionalities:**
    *   Fetches topic data from the API.
    *   Formats long text to fit within the circles using the `formatLongText` function. This function splits long texts into multiple lines and ensures that the text is centered within the circle.
    *   Renders the `BaseBattleVisualizer` component, passing the API endpoint and a fetch function that transforms the data.
*   **Key Variables and Functions:**
    *   `formatLongText`: A function that formats long text to fit within the circles.
    *   `transformData`: A function that transforms the data fetched from the API, applying the `formatLongText` function to each word.
    *   `fetchWithTransform`: A function that fetches data from the API and applies the `transformData` function.
*   **Data Flow and State Management:**
    *   The component fetches data from the API using the `fetchWithTransform` function.
    *   The `BaseBattleVisualizer` component manages the timer and renders the data on the canvas.
*   **Potential Issues or Areas for Improvement:**
    *   The `formatLongText` function could be improved to handle different screen sizes and orientations.
*   **Relationships:**
    *   Uses `BaseBattleVisualizer` to handle the actual rendering of the topics.
    *   Uses `apiConfig` to get the API endpoint.

## BaseBattleVisualizer.js

*   **Purpose:** This component is the base visualizer for the battle mode. It handles the core logic for fetching data, managing the timer, and rendering the visual representation of the data on a canvas.
*   **Key Functionalities:**
    *   Fetches data from an API endpoint using a provided `fetchFunction`.
    *   Manages the timer using the `useTimerControl` hook.
    *   Renders the data on a canvas, creating a visually appealing animation.
    *   Provides control buttons for managing the timer and entering/exiting full-screen mode.
*   **Key Variables and Functions:**
    *   `words`: An array of words fetched from the API.
    *   `currentWord`: The word currently being displayed.
    *   `canvasRef`: A reference to the canvas element.
    *   `animationRef`: A reference to the animation frame.
    *   `endpoint`: The API endpoint to fetch data from (passed as a prop).
    *   `fetchFunction`: An optional function to fetch data from the API (passed as a prop). If not provided, the default `fetch` API is used.
    *   `draw`: A function that renders the animation on the canvas.
*   **Data Flow and State Management:**
    *   The component fetches data from the API and stores it in the `words` state.
    *   The `useTimerControl` hook manages the timer state and provides action handlers for controlling the timer.
    *   The `currentIndex` state variable (managed by `useTimerControl`) determines which word is currently displayed.
*   **Potential Issues or Areas for Improvement:**
    *   The component uses inline styles. It could be improved by using CSS classes.
    *   The canvas resizing logic could be improved to handle different screen sizes and orientations.
*   **Relationships:**
    *   Uses `useTimerControl` to manage the timer logic.
    *   Uses `TimerControls` to render the timer controls.
    *   Uses `react-full-screen` for full-screen functionality.

## TimerControls.js

*   **Purpose:** This component renders the control panel UI for managing the timer.
*   **Key Functionalities:**
    *   Displays the current timer value, interval, and round duration.
    *   Provides controls for starting, pausing, and resetting the timer.
    *   Provides controls for adjusting the interval and round duration.
*   **Key Variables and Functions:**
    *   `timer`: Current countdown timer value for items (passed as a prop).
    *   `roundTimer`: Overall round timer value (passed as a prop).
    *   `changeInterval`: Time between item changes (passed as a prop).
    *   `roundDuration`: Total duration of the round (passed as a prop).
    *   `isActive`: Whether the timer is running (passed as a prop).
    *   `handleRoundDurationChange`: Function to update round duration (passed as a prop).
    *   `getNextItem`: Function to move to next item (passed as a prop).
    *   `handleIntervalChange`: Function to update interval (passed as a prop).
    *   `toggleActive`: Function to pause/resume (passed as a prop).
    *   `handleResetRound`: Function to reset the round (passed as a prop).
    *   `isControlWindow`: Whether this is rendered in control window (passed as a prop).
    *   `isFullScreen`: Whether the main window is in fullscreen (passed as a prop).
*   **Data Flow and State Management:**
    *   Receives timer state and action handlers from `useTimerControl` (via props).
*   **Potential Issues or Areas for Improvement:**
    *   The component uses inline styles. It could be improved by using CSS classes.
*   **Relationships:**
    *   Receives timer state and action handlers from `useTimerControl`.

## useTimerControl.js

*   **Purpose:** This hook encapsulates the timer logic and provides state and action handlers for managing the timer.
*   **Key Functionalities:**
    *   Manages the timer state using the `useTimerStore` Zustand store.
    *   Provides action handlers for starting, pausing, resetting, and adjusting the timer.
    *   Handles full-screen functionality using the `react-full-screen` library.
    *   Manages communication between the main window and the control window.
*   **Key Variables and Functions:**
    *   `timer`: Current countdown timer value for items (from `useTimerStore`).
    *   `roundTimer`: Overall round timer value (from `useTimerStore`).
    *   `changeInterval`: Time between item changes (from `useTimerStore`).
    *   `roundDuration`: Total duration of the round (from `useTimerStore`).
    *   `isActive`: Whether the timer is running (from `useTimerStore`).
    *   `currentIndex`: The index of the current item (from `useTimerStore`).
    *   `isControlWindow`: A boolean indicating whether the component is rendered in the control window.
    *   `isFullScreen`: A boolean indicating whether the component is in full-screen mode.
    *   `fullScreenHandle`: The full-screen handle from `react-full-screen`.
    *   `getNextItem`: Function to move to the next item (from `useTimerStore`).
    *   `handleIntervalChange`: Function to update the interval.
    *   `handleRoundDurationChange`: Function to update the round duration.
    *   `handleResetRound`: Function to reset the round.
    *   `toggleActive`: Function to pause/resume the timer.
    *   `openControlWindow`: Function to open the control window.
    *   `toggleFullScreen`: Function to toggle full-screen mode.
*   **Data Flow and State Management:**
    *   Uses `useTimerStore` to manage the timer state.
    *   Uses `react-full-screen` for full-screen functionality.
*   **Potential Issues or Areas for Improvement:**
    *   None identified.
*   **Relationships:**
    *   Uses `useTimerStore` to manage the timer state.
    *   Uses `react-full-screen` for full-screen functionality.

## timerStore.js

*   **Purpose:** This Zustand store manages the global timer state and provides actions for updating the state. It also handles communication between the main window and a control window using the Broadcast Channel API.
*   **Key Functionalities:**
    *   Stores the timer value, round timer, interval, round duration, active state, current index, and item count.
    *   Provides actions for setting the timer value, interval, round duration, and active state.
    *   Manages the timer interval using `setInterval` and `clearInterval`.
    *   Handles communication between the main window and the control window using the Broadcast Channel API.
*   **Key Variables and Functions:**
    *   `timer`: Current countdown timer value for items.
    *   `roundTimer`: Overall round timer value.
    *   `changeInterval`: Time between item changes.
    *   `roundDuration`: Total duration of the round.
    *   `isActive`: Whether the timer is running.
    *   `currentIndex`: The index of the current item.
    *   `itemCount`: The total number of items.
    *   `initializeStore`: Initializes the store with the item count and sets up the Broadcast Channel.
    *   `setTimer`: Sets the timer value.
    *   `setChangeInterval`: Sets the change interval.
    *   `setRoundDuration`: Sets the round duration.
    *   `setIsActive`: Sets the active state.
    *   `getNextItem`: Moves to the next item.
    *   `resetRound`: Resets the round.
*   **Data Flow and State Management:**
    *   The store manages the timer state using Zustand.
    *   The store uses the Broadcast Channel API to communicate with the control window.
*   **Potential Issues or Areas for Improvement:**
    *   The Broadcast Channel API might not be supported in all browsers.
*   **Relationships:**
    *   Used by `useTimerControl` to manage the timer state.

## ImagesMode.js

*   **Purpose:** This component is responsible for displaying images in the battle mode. It fetches images from an API endpoint, manages the timer, and displays the images on the screen. It also includes an `ImagePreloader` component to preload images for a smoother experience and uses `indexedDBUtils` to cache images.
*   **Key Functionalities:**
    *   Fetches images from the API using the `fetchImages` function.
    *   Manages the timer using the `useTimerControl` hook.
    *   Displays the current image using the `displayImage` function, which retrieves the image from the IndexedDB cache if available.
    *   Renders control buttons for managing the timer and entering/exiting full-screen mode.
    *   Uses the `ImagePreloader` component to preload images.
*   **Key Variables and Functions:**
    *   `images`: An array of image objects fetched from the API.
    *   `nextPage`: The URL for the next page of images, used for pagination.
    *   `fetchImages`: A function that fetches images from the API and updates the `images` state.
    *   `displayImage`: A function that retrieves an image from the IndexedDB cache or fetches it from the network if it's not cached.
    *   `BUFFER_SIZE`: A constant defining the number of images to keep in the buffer.
    *   `imagesPreloaded`: A state variable indicating whether the images have been preloaded.
    *   `fetchManyImages`: A function that fetches a large number of images for preloading.
*   **Data Flow and State Management:**
    *   The component fetches images from the API and stores them in the `images` state.
    *   The `useTimerControl` hook manages the timer state and provides action handlers for controlling the timer.
    *   The `currentIndex` state variable (managed by `useTimerControl`) determines which image is currently displayed.
    *   The `displayImage` function retrieves the image from the IndexedDB cache or fetches it from the network.
*   **Potential Issues or Areas for Improvement:**
    *   The component fetches a limited number of images initially. While it implements pagination, the preloading could be improved.
    *   The component uses a fixed buffer size for images. This could be made configurable to allow users to adjust the buffer size based on their network speed and device capabilities.
    *   The component uses inline styles. It could be improved by using CSS classes.
*   **Relationships:**
    *   Uses `useTimerControl` to manage the timer logic.
    *   Uses `TimerControls` to render the timer controls.
    *   Uses `react-full-screen` for full-screen functionality.
    *   Uses `ImagePreloader` to preload images.
    *   Uses `apiConfig` to get the API endpoint.
    *   Uses `indexedDBUtils` to cache and retrieve images from IndexedDB.

## ImagePreloader.js

*   **Purpose:** This component is responsible for preloading images in the background to improve the user experience. It fetches images from the network and stores them in the IndexedDB cache. It provides options to preload the current set of images or a larger set of 2000 images.
*   **Key Functionalities:**
    *   Fetches images from the network using the `fetch` API.
    *   Stores images in the IndexedDB cache using the `storeImage` function from `indexedDBUtils.js`.
    *   Displays a progress indicator to show the user how many images have been preloaded.
    *   Provides two preloading options: "Preload Current" (current set of images) and "Preload 2000" (fetches and preloads 2000 images).
*   **Key Variables and Functions:**
    *   `images`: An array of image objects to preload (passed as a prop).
    *   `onProgress`: A callback function to report the preloading progress (passed as a prop).
    *   `fetchManyImages`: A function to fetch a large number of images (passed as a prop).
    *   `preloadImages`: A function that fetches images from the network and stores them in the IndexedDB cache.
    *   `progress`: A state variable that tracks the progress of the image preloading process.
    *   `isPreloading`: A state variable indicating whether the images are currently being preloaded.
    *   `isExpanded`: A state variable controlling the visibility of the preloading options.
    *   `isPreloaded`: A state variable indicating whether the images have been preloaded.
*   **Data Flow and State Management:**
    *   The component receives an array of image objects as a prop.
    *   The `preloadImages` function fetches each image from the network and stores it in the IndexedDB cache.
    *   The `progress` state variable is updated as each image is preloaded.
    *   The `onProgress` callback is called to report the preloading progress to the parent component.
*   **Potential Issues or Areas for Improvement:**
    *   The component uses inline styles. It could be improved by using CSS classes.
    *   Error handling could be improved to provide more specific feedback to the user.
*   **Relationships:**
    *   Uses `indexedDBUtils` to store images in IndexedDB.

## indexedDBUtils.js

*   **Purpose:** This module provides utility functions for interacting with the IndexedDB database. It allows you to store and retrieve images from the cache.
*   **Key Functionalities:**
    *   Opens a connection to the IndexedDB database using the `openDB` function.
    *   Stores an image in the database using the `storeImage` function.
    *   Retrieves an image from the database using the `getImage` function.
*   **Key Variables and Functions:**
    *   `DB_NAME`: The name of the IndexedDB database ('ImageCache').
    *   `STORE_NAME`: The name of the object store in the database ('images').
    *   `openDB`: A function that opens a connection to the IndexedDB database.
    *   `storeImage`: A function that stores an image in the database.
    *   `getImage`: A function that retrieves an image from the database.
*   **Data Flow and State Management:**
    *   The module uses the IndexedDB API to store and retrieve images from the database.
*   **Potential Issues or Areas for Improvement:**
    *   The module does not handle database upgrades gracefully. If the database schema changes, the module should provide a mechanism for upgrading the database.
    *   The module does not handle errors gracefully. If an error occurs while interacting with the database, the module should log the error and display an error message to the user.
*   **Relationships:**
    *   Used by `ImagePreloader` and `ImagesMode` to store and retrieve images from IndexedDB.

## ContrastingMode.js

*   **Purpose:** This component displays contrasting pairs of items (words or images) and allows users to rate them and add tags. It fetches pairs from an API endpoint, manages the timer, and displays the pairs on the screen.
*   **Key Functionalities:**
    *   Fetches contrasting pairs from the API using the `fetchPairs` function.
    *   Manages the timer using the `useTimerControl` hook.
    *   Displays the current pair of items.
    *   Allows users to rate the current pair using a star rating system.
    *   Submits the user's rating to the API.
    *   Allows users to add tags to the current pair.
    *   Handles key press events for rating.
*   **Key Variables and Functions:**
    *   `pairs`: An array of contrasting pairs fetched from the API.
    *   `fetchPairs`: A function that fetches contrasting pairs from the API and updates the `pairs` state.
    *   `handleRating`: A function that submits the user's rating to the API.
    *   `handleAddTag`: A function that adds a tag to the current pair.
    *   `csrfToken`: The CSRF token used for API requests.
    *   `getCsrfToken`: A function to retrieve the CSRF token from cookies.
    *   `highlightedRating`: State variable to manage the highlighted star when rating.
    *   `showRatingMessage`: State variable to show a message after rating.
*   **Data Flow and State Management:**
    *   The component fetches contrasting pairs from the API and stores them in the `pairs` state.
    *   The `useTimerControl` hook manages the timer state and provides action handlers for controlling the timer.
    *   The `currentIndex` state variable (managed by `useTimerControl`) determines which pair is currently displayed.
    *   The `handleRating` function submits the user's rating to the API and updates the rating in the local state.
*   **Potential Issues or Areas for Improvement:**
    *   The component fetches a limited number of pairs initially. It could be improved by implementing infinite scrolling or lazy loading to fetch more pairs as the user progresses through the battle.
    *   The component retrieves the CSRF token from a cookie. This could be improved by retrieving the CSRF token from a hidden form field or a JavaScript variable.
    *   The component uses inline styles. It could be improved by using CSS classes.
*   **Relationships:**
    *   Uses `useTimerControl` to manage the timer logic.
    *   Uses `TimerControls` to render the timer controls.
    *   Uses `react-full-screen` for full-screen functionality.
    *   Uses `apiConfig` to get the API endpoint.

## WordMode.js

*   **Purpose:** This component is responsible for displaying random words in the battle mode. It fetches word data from an API endpoint and renders it using the `BaseBattleVisualizer` component.
*   **Key Functionalities:**
    *   Fetches word data from the API.
    *   Renders the `BaseBattleVisualizer` component, passing the API endpoint.
*   **Key Variables and Functions:**
    *   None.
*   **Data Flow and State Management:**
    *   The component fetches data from the API using the `BaseBattleVisualizer` component.
*   **Potential Issues or Areas for Improvement:**
    *   None.
*   **Relationships:**
    *   Uses `BaseBattleVisualizer` to handle the actual rendering of the words.
    *   Uses `apiConfig` to get the API endpoint.