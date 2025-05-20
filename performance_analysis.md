
Okay, I will read the components in the `@WordModes` directory and analyze them for potential performance bottlenecks. I'll suggest improvements where applicable.

I'll start by examining `FireSmokeVisualizer.js` as it's the largest file and might have more complex logic.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/FireSmokeVisualizer.js
The file `FireSmokeVisualizer.js` seems to be a custom canvas animation for a fire and smoke effect. This kind of animation can be performance-intensive. I'll need to see the rest of the file to get a complete picture, but here are some initial observations and potential areas for optimization based on the first 250 lines:

**Observations & Potential Issues:**

1.  **Canvas API Usage:** The code directly manipulates the 2D canvas context (`ctx`). Canvas animations are generally performant but can become bottlenecks if not optimized, especially with many particles or complex drawing operations per frame.
2.  **Particle System:**
    *   `FireSmokeParticleSystem` manages a list of particles. The `maxParticles` is set to 150. This is a reasonable number, but the complexity of updating and drawing each particle matters.
    *   `updateDimensions`: This is called in the constructor and potentially on resize. It creates emitters. The number of emitters depends on the width.
    *   `createParticle`: This function initializes new particles with various properties (position, velocity, life, size, color, rotation, etc.). The logic involves `Math.random()` and some trigonometric functions (`Math.sin`), which are called frequently.
    *   `update`: This is the core of the particle system.
        *   It's called on each animation frame (`time` parameter).
        *   It has time-based evolving patterns for spawn rates and particle properties using `Math.sin(this.time * ...)`.
        *   It spawns new particles based on probabilities (`Math.random() < spawnRate`).
        *   It iterates through *all* existing particles (`for (let i = this.particles.length - 1; i >= 0; i--)`) in each update.
        *   **Collision/Interaction with Text Region:** There's logic to check if a particle's next position is within a `textRegion` and deflects it. This involves calculations for each particle against the text region's bounds. This can be expensive if the number of particles is high.
3.  **Drawing Operations:**
    *   `drawFireSmokeBackground`:
        *   `ctx.fillRect` to clear the canvas.
        *   `ctx.filter = 'blur(5px)'`: Applying filters like blur can be computationally expensive, especially if applied frequently or over large areas.
        *   `ctx.createRadialGradient` and `addColorStop`: Gradients are generally fine, but frequent recreation or complex gradients can add overhead.
        *   `ctx.globalCompositeOperation = 'screen'`: Composite operations can also impact performance.
4.  **Frequent Calculations:**
    *   Multiple `Math.random()` calls during particle creation and update.
    *   Multiple `Math.sin()` calls for evolving behaviors.
    *   Calculations for particle movement, deflection, and aging in the main update loop.

**Potential Optimizations (General Ideas):**

1.  **Reduce Calculations in `update` loop:**
    *   **Object Pooling:** Instead of creating and destroying particle objects frequently, use an object pool to reuse them. This can reduce garbage collection pauses.
    *   **Pre-calculate or Cache:** If some calculations are repetitive or don't change frequently, pre-calculate or cache their results.
    *   **Simplify Logic:** Review the particle behavior logic (evolution, deflection) for potential simplifications that don't drastically affect the visual outcome.
2.  **Optimize Drawing:**
    *   **Minimize Filter Usage:** If the `blur(5px)` is applied to the entire canvas on every frame, it could be a significant bottleneck. Consider if it can be applied less frequently or to a smaller, pre-rendered layer.
    *   **Layering/Offscreen Canvases:** For complex scenes, sometimes rendering static or less frequently updated parts to an offscreen canvas can improve performance. The main canvas then just composites these layers.
    *   **Integer Coordinates:** Ensure particle positions and drawing coordinates are integers (`Math.floor()`) if sub-pixel rendering isn't strictly necessary, as it can sometimes be faster.
3.  **Particle System Specifics:**
    *   **Spatial Partitioning (if many particles and complex interactions):** For more complex particle interactions (e.g., particle-to-particle collision, which doesn't seem to be the case here but is relevant for the text region interaction), spatial partitioning (like quadtrees) can optimize finding nearby particles. However, for 150 particles interacting only with a rectangular text region, it might be overkill.
    *   **Limit Particle Updates:** Consider if all particles need to be updated every frame or if some can be updated less frequently if they are far off-screen or moving slowly.
4.  **General JavaScript Optimizations:**
    *   **Avoid anonymous functions in loops if they cause new closures every time** (though modern JS engines are good at optimizing this).
    *   **Be mindful of `this.time += 0.006;`**: This makes `this.time` grow indefinitely. While `Math.sin` handles large numbers, consider if it should be reset or use a modulo operator if the patterns are meant to be cyclical over a shorter period, to prevent potential precision issues with very large numbers over extremely long runtimes (though likely not a practical issue here).

I need to see the `draw` method of the `FireSmokeParticleSystem` and the `renderFireSmokeText` function to give more specific advice. The `draw` method will reveal how each particle is rendered, and `renderFireSmokeText` will show how text is integrated, which is crucial given the particle deflection logic.

I'll read the rest of the file now.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/FireSmokeVisualizer.js
Okay, I've reviewed the rest of `FireSmokeVisualizer.js`. The `draw` method of `FireSmokeParticleSystem` and the `renderFireSmokeText` function provide more clarity.

**Analysis of `FireSmokeParticleSystem.draw()`:**

*   **Looping through Particles:** It iterates through all particles to draw them.
*   **Skipping Particles in Text Region:** `if (textRegion && ... particle.x >= textRegion.x ...)` - This is good, it avoids drawing occluded particles.
*   **`ctx.save()` and `ctx.restore()` per particle:** This is expensive. `save()` and `restore()` store and retrieve the entire canvas drawing state (transformations, styles, etc.). Doing this for every particle (up to 150 times per frame) can significantly impact performance.
*   **`ctx.translate()`, `ctx.rotate()` per particle:** These transformations are necessary for individual particle orientation.
*   **Complex Color and Gradient Calculations per Particle:**
    *   `rgba()` strings are constructed dynamically with calculations involving `Math.sin`, `ageProgress`, `hueShift`, etc. String construction and parsing can be slower than using numerical color components if possible.
    *   `ctx.createRadialGradient()` is called for *every single particle* in *every frame*. This is a major performance bottleneck. Gradients are relatively expensive to create.
    *   Multiple `addColorStop` calls per particle.
*   **Drawing Shapes:** `ctx.ellipse()` or `ctx.arc()` followed by `ctx.fill()`. These are standard drawing operations. The conditional logic for `ellipse` vs `arc` adds a small overhead but is likely minor compared to gradient creation and context saves/restores.

**Analysis of `renderFireSmokeText()`:**

*   **Resets Filter:** `ctx.filter = 'none';` - This is good to ensure text isn't blurred.
*   **Font Size Calculation:** Based on dimensions, seems reasonable.
*   **Text Splitting for 'VS' mode:** `currentWord.split('###VS###')` - Standard string operation.
*   **`getScaledFontSize` Helper:**
    *   Sets `ctx.font` and then uses `ctx.measureText()`. This is a common pattern for fitting text.
    *   `ctx.measureText()` can have performance implications if called excessively or with very complex fonts/strings, but here it seems to be used to scale text appropriately before drawing, which is often necessary.
*   **Drawing Text:** Uses `ctx.fillText()`. Standard.
*   **Shadows for Text:** `ctx.shadowColor`, `ctx.shadowBlur`, `ctx.shadowOffsetX/Y`. Shadows can be expensive. The blur radius (10 or 15) is notable.

**Major Performance Bottlenecks Identified in `FireSmokeVisualizer.js`:**

1.  **`ctx.save()` / `ctx.restore()` per particle in `draw()`:** This is likely the most significant issue.
2.  **`ctx.createRadialGradient()` per particle in `draw()`:** Creating gradients repeatedly in a tight loop is very inefficient.
3.  **Complex String Concatenation for `rgba()` colors per particle in `draw()`:** While perhaps not as impactful as the above, it contributes.
4.  **Frequent `Math.random()` and `Math.sin()` calls:** Especially in the `update()` loop for particle physics and in `draw()` for color evolutions.
5.  **Canvas-wide `blur(5px)` in `drawFireSmokeBackground()`:** This is applied every frame to the background before particles are drawn.
6.  **Text Shadows in `renderFireSmokeText()`:** Shadows, especially blurred ones, can be costly.

**Recommendations for `FireSmokeVisualizer.js`:**

1.  **Optimize `ctx.save()` / `ctx.restore()` in `draw()`:**
    *   **Minimize State Changes:** If many particles share similar states (e.g., no rotation or same fill style for a batch), group them.
    *   **Manual State Management:** Instead of `save/restore`, manually reset transformations and styles if feasible. For example, after drawing a particle:
        *   `ctx.rotate(-particle.rotation)`
        *   `ctx.translate(-particle.x, -particle.y)`
        *   This avoids the overhead of saving/restoring the entire context stack but requires careful management.
    *   Alternatively, if particles don't rotate or have simple fill, you might avoid `translate/rotate` and draw them directly at `particle.x, particle.y`. However, rotation is used here.
2.  **Optimize Gradient Creation in `draw()`:**
    *   **Pre-render Particle Sprites:** Create a few small offscreen canvases for common particle appearances (e.g., a typical fire particle, a typical smoke particle) with their gradients. Then, in the main draw loop, use `ctx.drawImage()` to render these pre-rendered sprites. You can still scale and tint them if needed (`globalAlpha`, `drawImage` with scaling). This would drastically reduce gradient creation.
    *   **Gradient Caching:** If dynamic gradients are essential, cache them. If a particle's color/alpha combination is likely to repeat or change slowly, store the created gradient and reuse it until the properties change significantly. The key would be `evolvedSize` and the color stops.
3.  **Optimize Color Calculations:**
    *   If using pre-rendered sprites, this becomes less of an issue for the main loop.
    *   If not, try to work with numerical color components as much as possible and convert to string only at the very end.
4.  **Review `Math.random()` and `Math.sin()` Usage:**
    *   **Seeded Randomness or Perlin Noise:** For some effects, if true randomness isn't essential per frame, consider using a seeded random number generator or Perlin noise functions which can produce more organic-looking, less computationally intensive patterns over time. This is a more advanced change.
    *   **Lookup Tables (LUTs) for `sin()`:** If `Math.sin()` is called with values from a limited range or with a certain periodicity, you could pre-calculate sine values into a LUT. This is often a micro-optimization and might not be worth the complexity unless profiling shows `Math.sin` as a major hot spot.
5.  **Optimize Background Blur:**
    *   **Render background blur once to an offscreen canvas** if the background doesn't change dynamically beyond the glow. Then just draw this pre-blurred canvas. The glow effect seems to change with `time`, so this might be tricky.
    *   Consider if a less expensive blur or a different visual effect could achieve a similar aesthetic.
6.  **Optimize Text Shadows:**
    *   Reduce blur radius if possible.
    *   Consider drawing the text twice with a slight offset and a darker color for a cheaper "shadow" effect, instead of using `ctx.shadowBlur`.
    *   If text doesn't change often, render it (with shadow) to an offscreen canvas and draw that image. (The `currentWord` changes, so this is less applicable here).
7.  **General Particle System Optimizations:**
    *   **Object Pooling for Particles:** As mentioned before, reuse particle objects to reduce garbage collection.
    *   **Quadtree/Spatial Hashing (for deflection logic):** While 150 particles isn't huge, if the `textRegion` collision detection becomes a bottleneck (many particles needing deflection), a simple spatial grid might help quickly find particles near the text region's edges, rather than checking all particles. For a single rectangle, direct checks are probably fine for 150 particles.

**Confidence Score for `FireSmokeVisualizer.js` analysis:** 8/10 (High confidence in identified bottlenecks related to canvas rendering practices).

Next, I will analyze `BaseBattleVisualizer.js`.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/BaseBattleVisualizer.js
I've reviewed the first 250 lines of `BaseBattleVisualizer.js`. This component seems to be the main orchestrator for the battle visualization, handling fetching words, timer logic, and rendering either a 'rectangle' mode or the 'fire' mode (which uses `FireSmokeVisualizer.js`).

**Observations & Potential Issues:**

1.  **React Component Structure:**
    *   Uses `useState`, `useEffect`, `useCallback`, `useRef`. Standard React hooks.
    *   Manages state for `words`, `currentWord`.
    *   Integrates a custom hook `useTimerControl`.
2.  **Canvas Management:**
    *   `canvasRef` to get the canvas element.
    *   `animationRef` to store the `requestAnimationFrame` ID.
    *   `particleSystemRef` to hold the `FireSmokeParticleSystem` instance.
3.  **Data Fetching:**
    *   `fetchWords` function wrapped in `useCallback` to fetch words. Dependencies: `[endpoint, fetchFunction]`. This is good.
    *   `useEffect` calls `fetchWords` on mount and when `fetchWords` changes.
    *   Another `useEffect` updates `currentWord` when `currentIndex` (from `useTimerControl`) or `words` array changes.
4.  **Particle System Initialization:**
    *   `useEffect` initializes `particleSystemRef.current` when `visualMode` changes to `'fire'` and the canvas is available. This is correct.
5.  **Main Draw Loop (`draw` function):**
    *   Wrapped in `useCallback`. This is crucial because `draw` is a dependency of a `useEffect` that sets up the animation loop and resize listener.
    *   **Dependencies of `draw`:** `[currentWord, styleConfig, visualMode]`.
        *   When `currentWord` changes, the canvas will re-render to display the new word. This is expected.
        *   When `styleConfig` changes, it re-renders. If `styleConfig` is an object and its reference changes frequently (even if its content is the same), it will cause the `draw` function to be recreated and potentially trigger extra re-renders or effect re-runs. **This is a common source of performance issues in React if `styleConfig` is not memoized or is inadvertently recreated on parent renders.**
        *   When `visualMode` changes (e.g., from 'rectangle' to 'fire'), re-render is necessary.
    *   `canvas.getContext('2d')` is called in every `draw` call. While not extremely expensive, it's better to get the context once and store it, e.g., in a `useRef` or pass it around.
    *   `ctx.clearRect(0, 0, width, height)`: Standard.
    *   `Date.now() / 15000`: Used for animations.
    *   **Conditional Rendering Logic:** Switches between `'fire'` mode and default `'rectangle'` mode.
        *   In `'fire'` mode: Calls `drawFireSmokeBackground` and `renderFireSmokeText` (from `FireSmokeVisualizer.js`).
        *   In `'rectangle'` mode: Fills background, calculates a pulsing rectangle, calls `drawGradientRectangle` and `renderWordText`. The pulse animation (`Math.sin(time * 2) * 5`) will cause re-renders every frame, which is intended for the animation.
    *   `animationRef.current = requestAnimationFrame(() => draw());`: This creates the animation loop. **Critically, it's calling `draw()` directly as the callback.** This means the `draw` function itself (the one memoized by `useCallback`) is being scheduled. If `draw` is recreated (due to dependency changes), the `requestAnimationFrame` loop will start using the *new* `draw` function. This is generally correct.
6.  **`useEffect` for Animation Loop & Resize:**
    *   Dependencies: `[draw, isControlWindow, isFullScreen, visualMode]`.
    *   Sets up `requestAnimationFrame(draw)` and a resize listener.
    *   `resizeCanvas` function:
        *   Updates canvas `width` and `height`.
        *   If in `'fire'` mode, calls `particleSystemRef.current.updateDimensions()`. This is correct.
        *   **Calls `requestAnimationFrame(() => draw())` after resize.** This is okay, to ensure a redraw after dimensions change.
    *   Cleanup: `cancelAnimationFrame` and `removeEventListener`. Correct.
7.  **`styleConfig` Prop:** This is a key prop to investigate. If it's an object passed from a parent component, and that parent re-renders, `styleConfig` might get a new reference even if its deep content is the same, causing `useCallback` for `draw` to return a new function instance, and subsequently, the `useEffect` for the animation loop to re-run, tearing down and setting up the animation loop and resize listeners. This isn't necessarily a performance *bug* but can lead to unnecessary churn.
8.  **Control Buttons (`renderControlButtons`):** Standard React rendering for some UI elements. Uses inline styles. Opacity changes on mouse enter/leave in full-screen mode.

**Potential Performance Considerations for `BaseBattleVisualizer.js`:**

1.  **`styleConfig` Prop Instability:**
    *   **If `styleConfig` is an object created inline in the parent component (e.g., `<BaseBattleVisualizer styleConfig={{ color: 'blue' }} />`), it will be a new object on every parent render.** This will change the `draw` callback, and cause the animation `useEffect` to re-run.
    *   **Solution:** Ensure `styleConfig` is memoized in the parent component (e.g., using `useMemo`) or is a stable reference if it doesn't change often. If it's meant to be dynamic, then the current setup is correct, but be aware of the cost.
2.  **`getContext('2d')` in `draw`:** Minor, but can be optimized by calling it once.
3.  **Dependencies of `draw` callback:** `currentWord` changes are fine. `visualMode` changes are fine. `styleConfig` is the main concern as noted above.
4.  **Animation Loop Setup/Teardown:** If `draw` is recreated frequently due to unstable `styleConfig`, the `useEffect` managing the animation loop will tear down and set up `requestAnimationFrame` and event listeners repeatedly. This is overhead.
5.  **Fetching words on every 5th to last word:** `if (currentIndex >= words.length - 5) { fetchWords(); }`. This is a polling mechanism. If `fetchWords` itself is stable (which it seems to be due to `useCallback`), this is fine. The frequency depends on how fast words change.

**Recommendations for `BaseBattleVisualizer.js`:**

1.  **Investigate `styleConfig`:**
    *   Check where `BaseBattleVisualizer` is used and how `styleConfig` is passed.
    *   If it can be unstable, memoize it in the parent component using `useMemo` or ensure it has a stable reference.
2.  **Memoize Canvas Context:**
    *   Get the 2D context once in the `useEffect` that sets up the canvas and store it in a `useRef`. Pass this context to `draw` or have `draw` access it from the ref.
    ```javascript
    // Inside component
    const ctxRef = useRef(null);

    // In the useEffect where canvasRef.current is first available
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            ctxRef.current = canvas.getContext('2d');
            // ... rest of setup
        }
    }, []); // Or other appropriate dependencies

    // In draw function
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current; // Use the stored context
        if (!canvas || !ctx) return;
        // ...
    }, [/* ... dependencies ... */]);
    ```
3.  **Consider `useRef` for `draw` in `requestAnimationFrame`:**
    A common pattern to ensure `requestAnimationFrame` always calls the latest version of a function without needing that function in the `useEffect`'s dependency array (which can cause loop setup/teardown if the function changes often) is to use a ref:
    ```javascript
    const drawRef = useRef(draw); // draw is the useCallback memoized function

    useEffect(() => {
        drawRef.current = draw; // Keep the ref updated with the latest draw function
    }, [draw]);

    useEffect(() => {
        // ... (canvas setup)
        const loop = () => {
            drawRef.current(); // Call the function through the ref
            animationRef.current = requestAnimationFrame(loop);
        };
        animationRef.current = requestAnimationFrame(loop);
        // ... (resize listener, cleanup)
        return () => {
            cancelAnimationFrame(animationRef.current);
            // ...
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlWindow, isFullScreen, visualMode]); // draw is no longer a direct dependency here
    ```
    This decouples the animation loop's re-creation from the `draw` function's re-creation. The `draw` function itself (memoized by `useCallback`) would still update based on `currentWord`, `styleConfig`, `visualMode`. This pattern helps if the effect setup/cleanup is expensive and `draw` changes more often than the other dependencies of this effect.

**Confidence Score for `BaseBattleVisualizer.js` analysis:** 7/10 (The main potential issue hinges on `styleConfig` which I can't see, but the structure itself is mostly sound React practice. The `getContext` and `requestAnimationFrame` pattern are smaller optimizations).

I should now look at `WordTextRenderer.js` and `Gradient_Rectangle.js` as they are used by `BaseBattleVisualizer.js`.
First, `WordTextRenderer.js`.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/WordTextRenderer.js
I've analyzed `WordTextRenderer.js`. This module is responsible for rendering text onto the canvas, with logic to handle a "VS" mode (two items separated by "VS") and a regular mode. It also includes a helper `fitTextToWidth` which doesn't seem to be used by `renderWordText` but is exported.

**Analysis of `renderWordText()`:**

1.  **`ctx.save()` and `ctx.restore()`:** These are used once at the beginning and end of the function, which is fine and standard practice to isolate drawing states.
2.  **Font Size Calculation:**
    *   Initial `fontSize` is `Math.min(width, height) * 0.25;`.
    *   **Scaling Logic (`getScaledFontSize` and inline for regular mode):**
        *   It sets `ctx.font` with a base size.
        *   It calls `ctx.measureText(text).width` to get the text width.
        *   It calculates a `maxTextWidth` (width of the rectangle with padding).
        *   If `textWidth > maxTextWidth`, it scales down the `baseSize` proportionally.
        *   Then it sets `ctx.font` *again* with the potentially scaled font size.
        *   This process is done for `item1`, `"VS"`, and `item2` in VS mode, and once for `currentWord` in regular mode.
3.  **`ctx.measureText()` Calls:**
    *   In "VS" mode, `measureText` is called inside `getScaledFontSize` three times (for item1, "VS", item2).
    *   In regular mode, `measureText` is called once.
    *   `ctx.measureText()` can be relatively expensive, especially if called multiple times per frame with changing text or font settings.
4.  **Setting `ctx.font` Multiple Times:**
    *   In "VS" mode, `ctx.font` is set 3 times (once in each `getScaledFontSize` call with the base size, and then once for each item with the final scaled size if scaling occurred, or if not, it's effectively set twice with the same value for each item). More precisely, it's set initially in `getScaledFontSize`, and then `getScaledFontSize` returns the *new size*, and then `ctx.font` is set *again* outside using this new size. This is redundant if `getScaledFontSize` itself applied the final font.
    *   Looking closely at `getScaledFontSize`:
        ```javascript
        // Helper function to get scaled font size for text
        const getScaledFontSize = (text, baseSize) => {
          ctx.font = `700 ${baseSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`; // Font set here
          const textWidth = ctx.measureText(text).width;
          // ... scaling logic ...
          if (textWidth > maxTextWidth) {
            return baseSize * (maxTextWidth / textWidth); // Returns NEW size
          }
          return baseSize; // Returns original/base size
        };
        
        // Draw first item
        const item1FontSize = getScaledFontSize(item1, itemFontSize);
        ctx.font = `700 ${item1FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`; // Font set AGAIN here
        ```
        The font is indeed set once inside `getScaledFontSize` (for measurement with base size) and then again outside it with the (potentially new) returned size. This means for each text item in VS mode, `ctx.font` is set twice.
    *   In regular mode, `ctx.font` is set, then `measureText`, then `ctx.font` is set again with the potentially scaled size. So, up to two `ctx.font` settings.
5.  **Drawing Text:** Uses `ctx.fillText()`. Standard and efficient.
6.  **Font Family:** Uses `'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif'`. This is a standard font stack. Performance here usually depends on the complexity of the font itself and whether it's loaded. (Font loading was mentioned as removed for debugging in `BaseBattleVisualizer.js`, but it's relevant for overall rendering startup).

**Potential Performance Considerations & Optimizations for `WordTextRenderer.js`:**

1.  **Reduce `ctx.measureText()` Calls and Redundant `ctx.font` Settings:**
    *   The pattern of setting font, measuring, then setting font again (if scaled) is common but can be optimized.
    *   **Modify `getScaledFontSize`:** The helper `getScaledFontSize` could be modified to not only return the calculated font size but also to *apply it* if a change was needed. Or, it could return the complete font string.
    *   **Better approach for `getScaledFontSize`:**
        ```javascript
        const setFontAndMeasure = (text, baseSize, fontWeight = '700') => {
            let currentFontSize = baseSize;
            ctx.font = `${fontWeight} ${currentFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
            let textMetrics = ctx.measureText(text);
            const padding = width * 0.05;
            const maxTextWidth = width - (padding * 2);

            if (textMetrics.width > maxTextWidth) {
                currentFontSize = baseSize * (maxTextWidth / textMetrics.width);
                ctx.font = `${fontWeight} ${currentFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`; // Set font again only if scaled
            }
            return { fontSize: currentFontSize, textMetrics }; // Return metrics too if needed elsewhere
        };

        // Usage for item1:
        setFontAndMeasure(item1, itemFontSize); // Font is now set correctly
        ctx.fillStyle = '#E6E6E6';
        ctx.fillText(item1, centerX, centerY - spacing);

        // Usage for VS:
        setFontAndMeasure("VS", vsFontSize, '800');
        ctx.fillStyle = '#1AAE4D';
        ctx.fillText("VS", centerX, centerY);
        // etc.
        ```
        This ensures `ctx.font` is set optimally (once if no scaling, twice if scaling is needed) and `ctx.measureText` is called once per text item.
    *   In the "regular word mode", the same optimization applies: set font, measure, if too wide, calculate new size and set font again. This is already reasonably optimized (max 2 font sets, 1 measure).

2.  **`fitTextToWidth` function:**
    *   This function uses a `while` loop and calls `ctx.measureText()` repeatedly to truncate text. This can be very expensive if the text is long and requires many iterations.
    *   Since it's not currently used by `renderWordText` (which scales font size instead of truncating), it's not an active performance bottleneck for the main rendering path. However, if it were to be used, it would need careful consideration. Binary searching the truncation point is often more efficient than linear slicing.

**Recommendations for `WordTextRenderer.js`:**

1.  **Optimize Font Setting and Measurement:**
    *   Refactor the logic (e.g., using a helper like `setFontAndMeasure` proposed above) to minimize redundant `ctx.font` settings and ensure `ctx.measureText` is only called when necessary. The goal is one `measureText` call per unique text string whose dimensions are needed, and optimally setting `ctx.font` once before drawing if no scaling is needed, or twice if scaling requires re-setting the font.
    *   The existing code for "VS" mode sets `ctx.font` six times in total (twice per item). This can be reduced to three or four times.
    *   The existing code for "regular" mode sets `ctx.font` one or two times. This is already good.

**Confidence Score for `WordTextRenderer.js` analysis:** 8/10. The identified areas are clear canvas API usage patterns that can be made more efficient.

Next, I'll examine `Gradient_Rectangle.js`.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/Gradient_Rectangle.js
I've analyzed `Gradient_Rectangle.js`. This function is responsible for drawing the main rectangle UI element in the 'rectangle' visual mode. It includes a background gradient, rounded corners, shadows, and animated borders.

**Analysis of `drawGradientRectangle()`:**

1.  **Gradient Creation:**
    *   `ctx.createRadialGradient(...)`: A radial gradient is created for the rectangle's main fill. This is done on every call to `drawGradientRectangle`.
    *   `spotlightGradient = ctx.createRadialGradient(...)`: Another radial gradient is created for a spotlight effect. This is also done on every call.
    *   The parameters for these gradients (`x`, `y`, `width`, `height`) change if the rectangle is animated (which it is, due to the pulse effect in `BaseBattleVisualizer.js`).
2.  **`ctx.save()` and `ctx.restore()`:** Used once at the beginning and end, which is good practice.
3.  **Drawing Rounded Rectangle:**
    *   Uses `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and `ctx.quadraticCurveTo()` to draw the path for the rounded rectangle. This is a standard way to create custom shapes.
4.  **Fill and Stroke Operations:**
    *   `ctx.fill()`: Once for the main gradient.
    *   `ctx.fill()`: A second time for the inner shadow. This is interesting; usually, a shadow is applied *before* the fill that casts it, or it's part of the fill style itself. Here it seems like it's trying to fill the same path again with just shadow properties set. This might be intended to draw *only* the shadow of the existing shape.
    *   `ctx.stroke()`: Twice for two animated borders. The `strokeStyle` includes an alpha value based on `pulseIntensity (Math.sin(time * 4) ...)`, meaning the color string is reconstructed every frame.
5.  **Shadows:**
    *   `ctx.shadowOffsetX`, `ctx.shadowOffsetY`, `ctx.shadowBlur`, `ctx.shadowColor` are set for the inner shadow. `shadowBlur` is proportional to `width`, which is good for scaling. Shadow rendering can be expensive, especially with large blur radii.
6.  **`globalCompositeOperation = 'overlay'`:** Used for the spotlight effect. Composite operations can have performance costs.
7.  **Animated Properties:**
    *   Border `strokeStyle` (color and alpha) changes every frame due to `pulseIntensity`.
    *   Spotlight gradient `addColorStop` (alpha) changes every frame due to `pulseIntensity`.
    *   The `time` parameter directly influences these, ensuring animation.

**Potential Performance Bottlenecks & Optimizations for `Gradient_Rectangle.js`:**

1.  **Repeated Gradient Creation:**
    *   `ctx.createRadialGradient()` is called twice per frame (for main fill and spotlight). If the dimensions (`x, y, width, height`) of the rectangle are stable (ignoring the small pulse for a moment), the gradient objects themselves could potentially be cached and reused. However, the `pulseSize` animation in `BaseBattleVisualizer.js` *does* change `animatedWidth` and `animatedHeight` which are passed as `width` and `height` here, so the gradient structure itself (its coordinates and radius) changes each frame.
    *   **Mitigation:** For gradients, if the *shape* changes but the *color stops* are the same, there's no way to avoid recreating the gradient object. The cost is inherent to dynamic gradients on dynamic shapes. The current implementation is direct; complex caching would be difficult if `width` and `height` change constantly.
2.  **Shadow Rendering:**
    *   The `ctx.shadowBlur = width * 0.07;` can result in a large blur radius for larger rectangles, increasing rendering cost.
    *   The second `ctx.fill()` for the shadow: This is a bit unusual. Typically, shadow properties are set, then an object is drawn, and the shadow is rendered along with it. Filling again with only shadow properties might be an attempt to render *just* the shadow. It's worth verifying if this is more or less performant than standard shadow application or if it achieves a specific desired effect that can't be done otherwise. A common way to get an *inner* shadow is more complex (e.g., using clipping and drawing a larger, offset, blurred shape). If this is a simple drop shadow for the existing filled path, setting shadow props then calling `ctx.fill()` once for the gradient should render both. The current way seems like it might be drawing the gradient, then drawing a shadow of that gradient fill on top of/around it.
3.  **String Construction for Colors:**
    *   `strokeStyle = \`rgba(29, 185, 84, ${pulseIntensity * 0.95})\``: Dynamic string construction for RGBA colors. This is minor but happens every frame for two strokes and for the spotlight gradient's color stop.
4.  **Multiple Strokes:** Two `ctx.stroke()` calls for borders. This is fine if two distinct borders are needed.

**Recommendations for `Gradient_Rectangle.js`:**

1.  **Gradient Creation:** Given the animated dimensions (`width`, `height` due to pulse), recreating gradients is likely unavoidable if their size needs to match the rectangle. The impact depends on how expensive `createRadialGradient` is on target browsers. This is often a necessary cost for dynamic visuals.
2.  **Shadow Application:**
    *   Review the double `ctx.fill()` for the shadow. If the goal is a standard drop shadow for the gradient-filled rectangle, set shadow properties *before* the first `ctx.fill(gradientPath);` and remove the second `ctx.fill()`.
        ```javascript
        // ... setup path ...
        ctx.closePath();

        // Set shadow properties
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = width * 0.07;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';

        // Fill with gradient (shadow will be applied to this fill)
        ctx.fillStyle = gradient;
        ctx.fill();

        // Clear shadow for subsequent operations if they shouldn't have it
        ctx.shadowColor = 'transparent'; // or reset all shadow props
        // ... rest of drawing (borders, spotlight) ...
        ```
    *   If it's a special inner shadow technique, ensure it's the most efficient way to achieve the visual. Inner shadows are often done with clipping or by drawing an "outer" shape and then an "inner" shape on top.
3.  **Border Optimization (Minor):**
    *   If the two borders are very similar and performance is critical, consider if one slightly more complex border (perhaps drawn with an offset or a custom path) could suffice. But two `stroke()` calls are generally okay.
4.  **`globalCompositeOperation`:** Use sparingly. `'overlay'` is fine if the effect is desired, but be aware it adds to the rendering cost.

**Confidence Score for `Gradient_Rectangle.js` analysis:** 7/10. The main concerns are the shadow application method and the inherent cost of dynamic gradients.

I've now looked at the core rendering logic: `FireSmokeVisualizer.js`, `BaseBattleVisualizer.js`, `WordTextRenderer.js`, and `Gradient_Rectangle.js`.

The other files are:
*   `ContrastingMode.js` (1.5KB, 49 lines)
*   `FontPreloader.js` (1.1KB, 33 lines) - Seems relevant to initial load performance.
*   `TopicMode.js` (991B, 29 lines)
*   `WordMode.js` (820B, 28 lines)
*   `WordTextRenderer.js.old` (5.6KB, 174 lines) - Old version, likely not in use.
*   `fonts.css` (1.5KB, 53 lines) - CSS for fonts.
*   `README.md` (1.6KB, 41 lines)

Let's quickly check `ContrastingMode.js`, `TopicMode.js`, and `WordMode.js` as they seem like components, and then `FontPreloader.js`.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/ContrastingMode.js

Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/TopicMode.js

Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/WordMode.js
**Analysis of `ContrastingMode.js`, `TopicMode.js`, `WordMode.js`:**

These three components are very similar in structure. They are essentially wrappers around `BaseBattleVisualizer`.
*   They define a specific API `endpoint`.
*   They provide a custom `fetchFunction` that fetches data and formats it slightly (e.g., `formatContrastingText` in `ContrastingMode` or ensuring words are strings).
*   They pass `visualMode="fire"` to `BaseBattleVisualizer`.
*   **Crucially, they are *not* passing a `styleConfig` prop to `BaseBattleVisualizer` (the commented-out `styleConfig` props indicate this was considered but removed).** This is good from the perspective of the `styleConfig` stability issue identified in `BaseBattleVisualizer.js`. Since no `styleConfig` is passed, the `draw` callback in `BaseBattleVisualizer` will not be recreated due to changes in `styleConfig` from these parent components. Its dependencies become just `[currentWord, undefined, visualMode]`, which is stable unless `currentWord` or `visualMode` actually change.

**Performance Implication:**
The main performance characteristics of these modes will be dictated by:
1.  The performance of `BaseBattleVisualizer` itself (and by extension, `FireSmokeVisualizer`, `WordTextRenderer`, etc.).
2.  The performance of their respective `fetchFunction` and the API calls they make. These are I/O-bound and generally don't affect rendering loop performance unless they cause frequent state updates that are not batched or handled well. The current setup seems to fetch a batch of words and then cycle through them, which is a good pattern.

No specific performance bottlenecks are evident within these three small wrapper components themselves. Their main job is configuration and data fetching logic.

Now, let's look at `FontPreloader.js`.


Read file: /home/wojtek/cypher-arena/frontend/src/components/BattleMode/WordModes/FontPreloader.js
**Analysis of `FontPreloader.js`:**

This component's purpose is to help ensure that the 'Oswald' font (and potentially other fonts if they were added here) is loaded by the browser before it's used in canvas rendering. It does this by rendering text using the desired font and its variations in an off-screen, hidden `div`.

**How it works and Performance Implications:**

1.  **Forcing Font Load:** By including DOM elements (`<span>`) styled with `fontFamily: 'Oswald'` and various `fontWeight` values, it encourages the browser to download and parse the font file(s) when this component mounts.
2.  **Avoiding FOIT/FOUT in Canvas:** If fonts are not loaded when text is first drawn to a canvas, the browser might use a fallback font initially and then switch to the correct font once loaded. This can cause a "flash of unstyled text" (FOUT) or even a "flash of invisible text" (FOIT) on the canvas, or incorrect text measurements. This preloader aims to mitigate that.
3.  **Character Set:** It also includes spans with common character sets (`ABCDEFGHIJKLMNOPQRSTUVWXYZ`, etc.). This can be helpful to ensure the browser has rasterized these glyphs from the font file.
4.  **Impact:**
    *   **Positive:** Improves the visual stability of text rendering on the canvas by making it more likely the correct font is available from the start. Reduces chances of text reflowing or changing appearance after initial render.
    *   **Negative (Minor):**
        *   Adds a tiny bit to the initial DOM complexity (though the div is hidden and off-screen).
        *   Causes font files to be downloaded earlier if they weren't already cached. This is generally desired for a good user experience, but it is part of the initial page load sequence.
        *   The fonts `Montserrat` used in `WordTextRenderer.js` and `renderFireSmokeText` are not preloaded here. Only 'Oswald' is. If 'Montserrat' is the primary display font on the canvas, it should also be preloaded. The `fonts.css` file likely defines `@font-face` for 'Montserrat', but this component only explicitly preloads 'Oswald'.

**Recommendations for `FontPreloader.js`:**

1.  **Preload Actively Used Fonts:** The canvas text rendering primarily uses `'Montserrat'` (e.g., `ctx.font = \`700 ${baseSize}px Montserrat, ...\``). This `FontPreloader` component currently only preloads `'Oswald'`. It should be updated to preload 'Montserrat' in its relevant weights (e.g., 700, 800 as seen in the renderers).
    ```diff
    // FontPreloader.js
    // This component ensures fonts are loaded in the DOM before canvas operations
    
    import React from 'react';
    
    const FontPreloader = () => {
      return (
        <div style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          // General style for the container, specific fonts below
        }}>
          {/* Preload Montserrat (used in canvas) */}
          <span style={{ fontFamily: 'Montserrat', fontWeight: '700', fontSize: '72px' }}>Montserrat Bold</span>
          <span style={{ fontFamily: 'Montserrat', fontWeight: '800', fontSize: '72px' }}>Montserrat ExtraBold</span>
    
          {/* Preload Oswald (if used elsewhere or as a fallback) */}
          <span style={{ fontFamily: 'Oswald', fontWeight: '400', fontSize: '72px' }}>Oswald Regular</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: '500', fontSize: '72px' }}>Oswald Medium</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: '600', fontSize: '72px' }}>Oswald SemiBold</span>
          <span style={{ fontFamily: 'Oswald', fontWeight: '700', fontSize: '72px' }}>Oswald Bold</span>
    
          {/* Include all characters that might be used - applied to one of the preloaded fonts */}
          <div style={{ fontFamily: 'Montserrat', fontSize: '1px' }}> {/* Small font size to minimize layout shift if ever visible */}
            <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
            <span>abcdefghijklmnopqrstuvwxyz</span>
            <span>0123456789</span>
            <span>{'!@#$%^&*()_+-=[]{}|;\\':",./<?>'}</span>
          </div>
        </div>
      );
    };
    
    export default FontPreloader;
    ```
2.  **Modern Font Loading API:** For more robust font loading control, consider using the CSS Font Loading API (`document.fonts.load()`). This JavaScript API allows you to explicitly load fonts and get a promise that resolves when they are ready. This can provide more deterministic control than the hidden div trick.
    *   Example:
        ```javascript
        // In a useEffect, perhaps in BaseBattleVisualizer or a top-level component
        useEffect(() => {
          async function loadFonts() {
            try {
              await document.fonts.load('700 32px Montserrat');
              await document.fonts.load('800 32px Montserrat');
              // setFontLoaded(true); // If you need a state to gate rendering
              console.log('Montserrat font loaded');
            } catch (e) {
              console.error('Font loading error:', e);
            }
          }
          loadFonts();
        }, []);
        ```
    Using `document.fonts.load()` would be a more modern and reliable approach than the hidden div technique for ensuring fonts are ready before canvas rendering. The `FontPreloader` component could then potentially be removed or simplified.

**Confidence Score for `FontPreloader.js` analysis:** 9/10. The component's intent is clear, and the mismatch with used fonts is a direct observation.

The `fonts.css` file would define the `@font-face` rules, which are essential for any font loading strategy to work.

**Overall Summary of Potential Performance Bottlenecks and Recommendations:**

**Critical Bottlenecks in `FireSmokeVisualizer.js` (Canvas Animation):**

1.  **`ctx.save()` / `ctx.restore()` per particle:** Major overhead.
    *   **Fix:** Minimize state changes, use manual state resets, or draw particles in batches with similar states.
2.  **`ctx.createRadialGradient()` per particle, per frame:** Extremely expensive.
    *   **Fix:** Pre-render particle sprites to offscreen canvases and draw them using `drawImage`. Cache gradients if dynamic ones are absolutely necessary and some parameters are stable.
3.  **Canvas-wide blur filter (`ctx.filter = 'blur(5px)')` if applied every frame in `drawFireSmokeBackground`:** Can be very slow.
    *   **Fix:** Apply to a pre-rendered static background layer if possible, or use less expensive blur techniques/alternative visuals.
4.  **Text Shadows in `renderFireSmokeText`:** Can be costly.
    *   **Fix:** Reduce blur radius, or use alternative cheaper shadow techniques (e.g., offset duplicated text).

**Moderate Concerns & Optimizations:**

*   **`BaseBattleVisualizer.js`:**
    *   Potential instability of `styleConfig` prop causing `draw` callback and animation effect to re-run. (Currently not an issue with `WordMode`, `TopicMode`, `ContrastingMode` as they don't pass `styleConfig`).
    *   Getting `canvas.getContext('2d')` in every `draw` call (minor).
        *   **Fix:** Cache context in `useRef`.
    *   Consider `useRef` pattern for `requestAnimationFrame` callback to decouple loop from `draw` function re-creation.
*   **`WordTextRenderer.js`:**
    *   Multiple `ctx.font` settings and `ctx.measureText()` calls for scaling text.
        *   **Fix:** Refactor to set font optimally (once if no scale, twice if scaled) and measure once per text item.
*   **`Gradient_Rectangle.js`:**
    *   Repeated gradient creation (though potentially necessary due to animated dimensions).
    *   Unusual shadow application (`ctx.fill()` twice).
        *   **Fix:** Use standard shadow application (set shadow props before the main fill).
    *   Shadow blur radius can be large.
*   **`FontPreloader.js`:**
    *   Currently preloads 'Oswald' but canvas uses 'Montserrat'.
        *   **Fix:** Update to preload 'Montserrat' and its used weights. Consider using CSS Font Loading API for more robust control.

**General Recommendations:**

1.  **Profiling:** Use browser developer tools (Performance tab) to profile the animations. This will pinpoint the exact JavaScript functions and rendering operations that take the most time.
2.  **Micro-optimizations:** Focus on the major bottlenecks first (like those in `FireSmokeVisualizer.js`). Micro-optimizations (e.g., `Math.sin` LUTs, string concat for colors) should only be considered if profiling shows them as significant after addressing larger issues.
3.  **Object Pooling:** For the particle system in `FireSmokeVisualizer.js`, implement object pooling for particles to reduce garbage collection overhead.
4.  **Frame Rate Monitoring:** Display an FPS counter during development to objectively measure the impact of optimizations.
5.  **Test on Target Devices:** Performance can vary significantly across devices and browsers. Test on representative hardware.

I believe I have covered all the components in the `@WordModes` directory and provided actionable insights for performance improvements. The most significant gains will likely come from optimizing the `FireSmokeVisualizer.js` due to its per-frame, per-particle canvas operations.I've analyzed the components in the `frontend/src/components/BattleMode/WordModes` directory. Here's a summary of potential performance bottlenecks and recommendations:

**1. `FireSmokeVisualizer.js` (High Impact Potential)**

This component handles a complex canvas-based particle animation and has several areas that are likely performance bottlenecks:

*   **Bottleneck:** Calling `ctx.save()` and `ctx.restore()` for *each particle* in the `draw()` method. This is very expensive as it saves and restores the entire canvas state repeatedly.
    *   **Recommendation:** Minimize the number of save/restore calls. If possible, group particles that share similar drawing states or manually reset transformations (`ctx.translate`, `ctx.rotate`) and styles after drawing each particle. This requires careful state management but can yield significant performance gains.
*   **Bottleneck:** Creating radial gradients (`ctx.createRadialGradient()`) for *each particle* in *each frame* within the `draw()` method. Gradient creation is a costly operation.
    *   **Recommendation:** Pre-render common particle appearances (fire, smoke with their gradients) to small off-screen canvases. Then, in the main animation loop, draw these pre-rendered sprites using `ctx.drawImage()`. This drastically reduces the number of gradient creations per frame. If particles have evolving appearances, you might need a few variations of these sprites or update them less frequently.
*   **Bottleneck:** Applying a canvas-wide blur filter (`ctx.filter = 'blur(5px)';`) in `drawFireSmokeBackground()` on every frame. Full-screen filters, especially blur, are computationally intensive.
    *   **Recommendation:** If the background elements under the blur don't change every frame, consider rendering the blurred background once to an off-screen canvas and then drawing this cached image. If the glow effect must be dynamic, explore if the blur can be less intense or applied to a smaller region.
*   **Bottleneck:** Complex RGBA string construction and multiple `Math.sin()` / `Math.random()` calls within the particle update and draw loops.
    *   **Recommendation:** While secondary to the above, for colors, work with numerical components and convert to string only when setting `fillStyle` or `strokeStyle`. For `Math.sin` or `Math.random` heavy logic, ensure they are truly necessary for the visual effect on every particle every frame. Sometimes, patterns can be pre-calculated or simplified.
*   **Bottleneck:** Text shadows (`ctx.shadowBlur`) in `renderFireSmokeText` can be expensive.
    *   **Recommendation:** Reduce the blur radius if possible. For a simpler shadow, consider drawing the text twice: once offset and in a darker color, then the main text on top.
*   **General Recommendation:** Implement object pooling for particles. Instead of creating new particle objects and letting them be garbage collected, reuse a pool of particle objects. This reduces GC pauses, which can cause stutter in animations.

**2. `BaseBattleVisualizer.js` (Orchestrator)**

This component manages the main animation loop and state.

*   **Potential Issue:** The `styleConfig` prop. If this object is recreated in a parent component on every render (e.g., an inline object `{...}`), it will cause the `draw` `useCallback` hook to return a new function instance. This, in turn, causes the `useEffect` responsible for the animation loop (`requestAnimationFrame`) and resize listeners to tear down and set up repeatedly.
    *   **Observation:** Currently, the `ContrastingMode`, `TopicMode`, and `WordMode` components do *not* pass a `styleConfig` prop (they have it commented out), so this specific issue is likely dormant with the current usage. If `styleConfig` were to be used, ensure it's memoized (`useMemo`) in the parent or has a stable reference.
*   **Minor Optimization:** `canvas.getContext('2d')` is called in every `draw` call.
    *   **Recommendation:** Get the context once (e.g., in a `useEffect` after the canvas is available) and store it in a `useRef`. The `draw` function can then access the context from this ref.
*   **Minor Optimization:** Consider using the `useRef` pattern for the `requestAnimationFrame` callback. This involves storing the `draw` function in a ref and having the animation loop call `drawRef.current()`. This can prevent the animation `useEffect` from needing `draw` in its dependency array, reducing loop restarts if `draw` itself changes for reasons unrelated to the effect's other dependencies.

**3. `WordTextRenderer.js` (Text on Canvas)**

*   **Potential Issue:** Multiple `ctx.font` settings and `ctx.measureText()` calls when scaling text, especially in the "VS" mode.
    *   **Recommendation:** Refactor the text scaling logic. The goal should be to call `ctx.measureText()` once per text item that needs measuring. `ctx.font` should be set once if no scaling is needed, or twice if scaling requires recalculating the font size (once for measurement, once with the final size). A helper function could encapsulate this logic efficiently.

**4. `Gradient_Rectangle.js` (Rectangle UI)**

*   **Potential Issue:** Recreating two radial gradients (`ctx.createRadialGradient`) on every frame. The rectangle's dimensions are animated (pulse effect), making caching difficult if the gradient size must precisely match.
    *   **Consideration:** This might be a necessary cost for the dynamic visual.
*   **Potential Issue:** The method for drawing inner shadows (`ctx.fill()` called a second time after setting shadow properties).
    *   **Recommendation:** Review this. A standard drop shadow is usually applied by setting shadow properties *before* the primary fill operation. If this is a specific inner shadow technique, ensure it's efficient. Standard inner shadows on canvas are often achieved via clipping.
*   **Consideration:** Shadow blur (`ctx.shadowBlur`) can be expensive, especially if the radius becomes large.

**5. `FontPreloader.js` (Initial Load)**

*   **Issue:** The component preloads the 'Oswald' font, but the canvas text renderers (`WordTextRenderer.js`, `renderFireSmokeText` in `FireSmokeVisualizer.js`) primarily use 'Montserrat'.
    *   **Recommendation:** Update `FontPreloader.js` to preload 'Montserrat' with the weights used in the canvas (e.g., 700, 800). For more robust font loading, consider using the CSS Font Loading API (`document.fonts.load('1em Montserrat').then(...)`) which provides better control and feedback on font load status. This could replace or augment the hidden div technique.

**6. `ContrastingMode.js`, `TopicMode.js`, `WordMode.js` (Wrappers)**

*   These components primarily configure `BaseBattleVisualizer` (endpoint, fetch function, visual mode). They do not introduce performance bottlenecks themselves. Their non-use of `styleConfig` currently helps `BaseBattleVisualizer`'s stability.

**Overall Steps for Improvement:**

1.  **Profile:** Use browser developer tools to identify the most time-consuming operations during animation. This will confirm the impact of the suspected bottlenecks.
2.  **Address `FireSmokeVisualizer.js` First:** Optimizations here (particle drawing, gradient creation, blur) will likely yield the largest performance improvements.
3.  **Implement Object Pooling:** For the particle system.
4.  **Refine Text Rendering:** Optimize `WordTextRenderer.js` and review text shadows.
5.  **Font Loading:** Ensure correct fonts are preloaded effectively using `FontPreloader.js` or the CSS Font Loading API.
6.  **Review `BaseBattleVisualizer.js`:** Apply minor optimizations like context caching. Be mindful of the `styleConfig` prop if it's used in the future.

By addressing these points, especially the canvas rendering techniques in `FireSmokeVisualizer.js`, you should see a noticeable improvement in rendering performance and smoothness of the animations.
