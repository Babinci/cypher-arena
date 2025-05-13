// WordTextRenderer.js
// Handles all word text rendering logic for battle modes

/**
 * Renders word text (normal or contrast mode) into a canvas context, fitting and centering it in the given rectangle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 *   - currentWord: string
 *   - rectangle: { x, y, width, height, centerX, centerY }
 *   - isMobileView: boolean
 *   - styleConfig: object (optional)
 */
export function renderWordText(ctx, { currentWord, rectangle, isMobileView, styleConfig }) {

  // --- CONSTANTS ---
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

  // Set minimum font sizes based on device requirements (from screenDisplayRequirements.md)
  // Projector: 30-40px (body), Mobile: 16-20px, Desktop: 16-24px
  const minFontSize = isMobileView ? 16 : 22; // Minimum reasonable font size

  // Unified maximum font sizes across all modes
  // Using slightly reduced values for consistent appearance
  const maxFontSize = isMobileView ? 60 : 100; // Universal max size for all modes

  const maxTextWidthFactor = 0.98; // Use 98% of rectangle width for text to avoid touching edges
  const maxHeightFactor = 0.98; // Use 98% of rectangle height for text

  // Consistent line limits across all modes, adjusted by content type
  const maxLinesNormal = isMobileView ? 4 : 5; // Single words or topics
  const maxLinesContrast = 3; // Max lines per item in contrast mode

  // Line height multipliers - ADJUSTED FOR BETTER PROPORTIONS
  const lineHeightMultiplierNormal = isMobileView ? 1.25 : 1.35;
  const lineHeightMultiplierContrastItem = isMobileView ? 1.2 : 1.3;
  const lineHeightMultiplierContrastVS = isMobileView ? 1.35 : 1.5;
  // --- END CONSTANTS ---


  const { width, height, centerX, centerY } = rectangle;
  const maxTextWidth = width * maxTextWidthFactor;
  const maxTextHeight = height * maxHeightFactor;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000'; // Base text color

  // --- Shared Wrap Function ---
  // Enhanced wrapText function to handle edge cases better
  function wrapText(text, fontSize, currentMaxWidth, currentMaxLines, charBreak = true) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const words = text ? text.trim().split(/(\s+)/) : []; // Keep spaces as separate elements
    let lines = [];
    let currentLine = '';
    let space = '';

    for (const word of words) {
            if (word.match(/^\s+$/)) { // It's a space
                space = ' ';
                continue;
            }

            let testLine = currentLine + space + word;
            let testWidth = ctx.measureText(testLine.trim()).width;

            if (testWidth <= currentMaxWidth || currentLine === '') {
                currentLine = testLine;
            } else {
                // Word doesn't fit, push the previous line (if any)
                if (currentLine) {
                    lines.push(currentLine.trim());
                }

                // Now check the single word
                let wordWidth = ctx.measureText(word).width;
                if (wordWidth <= currentMaxWidth) {
                  // Word fits on a new line by itself
                  currentLine = word;
                } else if (charBreak) {
                  // Word is too long, needs character wrapping
                  let tempWord = '';
                  for (let i = 0; i < word.length; i++) {
                    let char = word[i];
                    let tempWordWidth = ctx.measureText(tempWord + char).width;
                    if (tempWordWidth <= currentMaxWidth) {
                      tempWord += char;
                    } else {
                      lines.push(tempWord); // Push the fitting part
                      tempWord = char; // Start new line part with current char
                    }
                  }
                  currentLine = tempWord; // Remaining part becomes the current line
                } else {
                  // Character breaking not allowed, push the long word as is
                  lines.push(word);
                  currentLine = ''; // Start fresh
                }
            }
            space = ' '; // Reset space after processing a word

            // Early exit if max lines reached
            if (lines.length >= currentMaxLines) {
                // Truncate if needed
                if (currentLine) { // If there's content for the next line
                    lines.push(currentLine.trim().substring(0, 15) + '...'); // Add truncated content
                } else if (lines.length > 0) { // Ensure last line gets ellipsis if cut short
                    let lastLine = lines[lines.length - 1];
                    if (lastLine.length > 15) lastLine = lastLine.substring(0, 15);
                    lines[lines.length - 1] = lastLine + '...';
                }
                return lines.slice(0, currentMaxLines);
            }
        }

    // Add the last line if it exists
    if (currentLine) {
        lines.push(currentLine.trim());
    }

    // Final check for max lines just in case
    return lines.slice(0, currentMaxLines);
  }
  // --- END Shared Wrap Function ---


  // --- Contrast Mode ---
  const isContrastMode = currentWord && currentWord.includes('###VS###');
  if (isContrastMode) {
    const [item1Raw, item2Raw] = currentWord.split('###VS###');
    const item1 = item1Raw.trim();
    const item2 = item2Raw.trim();

    // Find optimal font size
    let bestFontSize = minFontSize;
    for (let currentFontSize = maxFontSize; currentFontSize >= minFontSize; currentFontSize -= 1) {
      const currentLineHeight = currentFontSize * lineHeightMultiplierContrastItem;
      const currentVsFontSize = Math.max(currentFontSize * 1.2, currentFontSize + 4); // VS size relative to item font size
      const currentVsLineHeight = currentVsFontSize * lineHeightMultiplierContrastVS;

      // Wrap text for both items
      const item1Lines = wrapText(item1, currentFontSize, maxTextWidth, maxLinesContrast);
      const item2Lines = wrapText(item2, currentFontSize, maxTextWidth, maxLinesContrast);

      // Check width constraint (widest line overall)
      let widestLine = 0;
      ctx.font = `${currentFontSize}px ${fontFamily}`; // Remove bold for contrast items
      item1Lines.forEach(line => widestLine = Math.max(widestLine, ctx.measureText(line).width));
      item2Lines.forEach(line => widestLine = Math.max(widestLine, ctx.measureText(line).width));
      ctx.font = `${currentVsFontSize}px ${fontFamily}`; // Remove bold for VS
      widestLine = Math.max(widestLine, ctx.measureText('vs').width); // Check 'vs' width

      if (widestLine > maxTextWidth) {
        continue; // Font size too large for width, try smaller
      }

      // Check height constraint
      const totalHeight = (item1Lines.length * currentLineHeight) + currentVsLineHeight + (item2Lines.length * currentLineHeight);

      if (totalHeight <= maxTextHeight) {
        bestFontSize = currentFontSize; // Found the largest size that fits both width and height
        break; // Exit loop
      }
    }

    // Final values based on bestFontSize
    const finalFontSize = bestFontSize;
    const finalLineHeight = finalFontSize * lineHeightMultiplierContrastItem;
    const finalVsFontSize = Math.max(finalFontSize * 1.2, finalFontSize + 4);
    const finalVsLineHeight = finalVsFontSize * lineHeightMultiplierContrastVS;
    const finalItem1Lines = wrapText(item1, finalFontSize, maxTextWidth, maxLinesContrast);
    const finalItem2Lines = wrapText(item2, finalFontSize, maxTextWidth, maxLinesContrast);
    const finalTotalHeight = (finalItem1Lines.length * finalLineHeight) + finalVsLineHeight + (finalItem2Lines.length * finalLineHeight);

    // --- Drawing Contrast Mode ---
    let currentY = centerY - (finalTotalHeight / 2) + (finalLineHeight / 2); // Start Y adjusted for baseline
    // Slightly reduce spacing between items for compactness
    const itemSpacing = finalLineHeight * 0.95;

    // Draw Item 1
    ctx.font = `${finalFontSize}px ${fontFamily}`; // Remove bold
    // Note: Canvas does not support letterSpacing directly. For future: implement manual letter spacing if needed.
    finalItem1Lines.forEach(line => {
      ctx.save();
      // Apply lighter shadow
      ctx.shadowOffsetX = finalFontSize * 0.02;
      ctx.shadowOffsetY = finalFontSize * 0.02;
      ctx.shadowBlur = finalFontSize * 0.05;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; // More transparent shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(line, centerX, currentY);
      ctx.restore();
      currentY += itemSpacing;
    });

    // Draw VS (adjusted Y position to be centered in its own line height)
    currentY -= itemSpacing / 2; // Move back half item line height
    currentY += finalVsLineHeight / 2; // Move forward half vs line height
    ctx.save();
    ctx.font = `${finalVsFontSize}px ${fontFamily}`; // Remove bold
    ctx.shadowOffsetX = finalVsFontSize * 0.02;
    ctx.shadowOffsetY = finalVsFontSize * 0.02;
    ctx.shadowBlur = finalVsFontSize * 0.05;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText('vs', centerX, currentY);
    ctx.restore();
    currentY += finalVsLineHeight / 2; // Move forward half vs line height
    currentY += itemSpacing / 2; // Move forward half item line height for item 2 start

    // Draw Item 2
    ctx.font = `${finalFontSize}px ${fontFamily}`; // Remove bold
    finalItem2Lines.forEach(line => {
      ctx.save();
      ctx.shadowOffsetX = finalFontSize * 0.02;
      ctx.shadowOffsetY = finalFontSize * 0.02;
      ctx.shadowBlur = finalFontSize * 0.05;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(line, centerX, currentY);
      ctx.restore();
      currentY += itemSpacing;
    });

    return; // End contrast mode rendering
  }
  // --- END Contrast Mode ---


  // --- Normal Mode ---
  if (currentWord) {
      // Find optimal font size
    let bestFontSize = minFontSize;
    for (let currentFontSize = maxFontSize; currentFontSize >= minFontSize; currentFontSize -= 1) {
      const currentLineHeight = currentFontSize * lineHeightMultiplierNormal;

      // Wrap text
      const lines = wrapText(currentWord, currentFontSize, maxTextWidth, maxLinesNormal);

      // Check width constraint
      let widestLine = 0;
      ctx.font = `bold ${currentFontSize}px ${fontFamily}`;
      lines.forEach(line => widestLine = Math.max(widestLine, ctx.measureText(line).width));

      if (widestLine > maxTextWidth) {
        continue; // Font size too large for width, try smaller
      }

      // Check height constraint
      const totalHeight = lines.length * currentLineHeight;

      if (totalHeight <= maxTextHeight) {
        bestFontSize = currentFontSize; // Found the largest size that fits both width and height
        break; // Exit loop
      }
    }

    // Final values
    const finalFontSize = bestFontSize;
    const finalLineHeight = finalFontSize * lineHeightMultiplierNormal;
    const finalLines = wrapText(currentWord, finalFontSize, maxTextWidth, maxLinesNormal);
    const finalTotalHeight = finalLines.length * finalLineHeight;

    // --- Drawing Normal Mode ----
    const startY = centerY - (finalTotalHeight / 2) + (finalLineHeight / 2); // Adjust start Y for middle baseline

    ctx.font = `bold ${finalFontSize}px ${fontFamily}`;
    finalLines.forEach((line, index) => {
      ctx.save();
      // Adjusted shadow based on font size and view
      ctx.shadowOffsetX = finalFontSize * (isMobileView ? 0.02 : 0.03);
      ctx.shadowOffsetY = finalFontSize * (isMobileView ? 0.02 : 0.03);
      ctx.shadowBlur = finalFontSize * (isMobileView ? 0.05 : 0.07);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Slightly transparent black
      ctx.fillText(line, centerX, startY + (index * finalLineHeight));
      ctx.restore();
    });
  }
  // --- END Normal Mode ---
} 