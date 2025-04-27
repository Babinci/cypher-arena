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
  // --- ADD LOGS HERE ---
  // --- END LOGS ---

  const { width, height, centerX, centerY } = rectangle;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';

  // --- Contrast Mode ---
  const isContrastMode = currentWord && currentWord.includes('###VS###');
  if (isContrastMode) {
    const [item1, item2] = currentWord.split('###VS###');
    const maxTextWidth = width * 0.99;
    const minFontSize = isMobileView ? 16 : 22;
    const maxFontSize = isMobileView ? 110 : 160;

    // --- RE-INSERTED: wrapTextEnhanced function definition ---
    function wrapTextEnhanced(text, fontSize, maxWidth, maxLines = 3, maxCharsPerLine = 18) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const words = text.trim().split(/\s+/);
      let lines = [];
      let currentLine = '';
      for (let i = 0; i < words.length; i++) {
        let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        let testWidth = ctx.measureText(testLine).width;
        // Check if adding this word would exceed pixel width or character count
        if (testWidth > maxWidth || testLine.length > maxCharsPerLine) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            // Single word too long, force break by both pixel width and char count
            let word = words[i];
            let part = '';
            for (let c = 0; c < word.length; c++) {
              part += word[c];
              // Check both pixel width and char count for the chunk
              if (ctx.measureText(part + '-').width > maxWidth || part.length > maxCharsPerLine) {
                if (part.length > 1) {
                  lines.push(part.slice(0, -1) + '-');
                  part = word[c];
                }
              }
            }
            if (part) currentLine = part;
          }
        } else {
          currentLine = testLine;
        }
        if (lines.length >= maxLines) break;
      }
      if (currentLine && lines.length < maxLines) lines.push(currentLine);
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        let last = lines[maxLines - 1];
        while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
          last = last.slice(0, -1);
        }
        lines[maxLines - 1] = last + '...';
      }
      return lines;
    }
    // --- END RE-INSERTED wrapTextEnhanced ---

    // ADJUSTED: Consider height in initial estimate
    let initialFontSizeEstimate = Math.min(width / 9, height / 6); // Rough estimate: ~5 lines total + spacing
    let fontSize = Math.min(initialFontSizeEstimate, maxFontSize);
    fontSize = Math.max(minFontSize, fontSize);
    
    // Initial height fitting logic (adjusting bestFontSize)
    let bestFontSize = fontSize;
    let fits = false;
    while (!fits && bestFontSize > minFontSize) {
      // Wrap text for both items
      const item1LinesTemp = wrapTextEnhanced(item1, bestFontSize, maxTextWidth, 3, 18);
      const item2LinesTemp = wrapTextEnhanced(item2, bestFontSize, maxTextWidth, 3, 18);
      // ADJUSTED: Use smaller line height multiplier for mobile
      const lineHeightTemp = bestFontSize * (isMobileView ? 1.15 : 1.3);
      const vsFontSizeTemp = Math.max(bestFontSize * 1.2, bestFontSize + 4);
      // ADJUSTED: Use smaller line height multiplier for mobile
      const vsLineHeightTemp = vsFontSizeTemp * (isMobileView ? 1.3 : 1.5);
      const totalHeightTemp = (item1LinesTemp.length * lineHeightTemp) + vsLineHeightTemp + (item2LinesTemp.length * lineHeightTemp);
      if (totalHeightTemp <= height * 0.98) {
        fits = true;
      } else {
        bestFontSize -= 1;
      }
    }
    fontSize = bestFontSize;
    
    // Declare with LET now, as they will be modified in the width check loop
    let vsFontSize = Math.max(fontSize * 1.2, fontSize + 4);
    let lineHeight = fontSize * (isMobileView ? 1.15 : 1.3);
    let vsLineHeight = vsFontSize * (isMobileView ? 1.3 : 1.5);
    let item1Lines = wrapTextEnhanced(item1, fontSize, maxTextWidth, 3, 18);
    let item2Lines = wrapTextEnhanced(item2, fontSize, maxTextWidth, 3, 18);

    // --- ADD FINAL WIDTH CHECK FOR CONTRAST MODE (Refactored loop) ---
    let widestContrast = 0;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    // Use for...of loop instead of forEach
    for (const line of item1Lines) {
      widestContrast = Math.max(widestContrast, ctx.measureText(line).width);
    }
    for (const line of item2Lines) {
      widestContrast = Math.max(widestContrast, ctx.measureText(line).width);
    }

    while (widestContrast > maxTextWidth && fontSize > minFontSize) {
      fontSize -= 1;
      // Recalculate dependent sizes and re-wrap - NO const
      vsFontSize = Math.max(fontSize * 1.2, fontSize + 4);
      // ADJUSTED: Use smaller line height multiplier for mobile
      lineHeight = fontSize * (isMobileView ? 1.15 : 1.3);
      item1Lines = wrapTextEnhanced(item1, fontSize, maxTextWidth, 3, 18);
      item2Lines = wrapTextEnhanced(item2, fontSize, maxTextWidth, 3, 18);
      widestContrast = 0;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      // Use for...of loop instead of forEach inside loop
      for (const line of item1Lines) {
        widestContrast = Math.max(widestContrast, ctx.measureText(line).width);
      }
      for (const line of item2Lines) {
        widestContrast = Math.max(widestContrast, ctx.measureText(line).width);
      }
    }
    // Update final sizes after potential width adjustment - NO const
    vsFontSize = Math.max(fontSize * 1.2, fontSize + 4);
    // ADJUSTED: Use smaller line height multiplier for mobile
    lineHeight = fontSize * (isMobileView ? 1.15 : 1.3);
    // ADJUSTED: Use smaller line height multiplier for mobile
    vsLineHeight = vsFontSize * (isMobileView ? 1.3 : 1.5);
    // Re-wrap just in case - NO const
    item1Lines = wrapTextEnhanced(item1, fontSize, maxTextWidth, 3, 18);
    item2Lines = wrapTextEnhanced(item2, fontSize, maxTextWidth, 3, 18);
    // Calculate final heights with updated lineHeight - NO const
    let item1Height = item1Lines.length * lineHeight;
    let item2Height = item2Lines.length * lineHeight;
    let vsHeight = vsLineHeight;
    const finalTotalHeight = item1Height + vsHeight + item2Height; // Keep const for this final calculation
    // --- END FINAL WIDTH CHECK ---

    let currentY = centerY - (finalTotalHeight / 2);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    item1Lines.forEach(line => {
      ctx.save();
      ctx.shadowOffsetX = fontSize * 0.03;
      ctx.shadowOffsetY = fontSize * 0.03;
      ctx.shadowBlur = fontSize * 0.07;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(line, centerX, currentY);
      ctx.restore();
      currentY += lineHeight;
    });
    ctx.save();
    ctx.font = `bold ${vsFontSize}px ${fontFamily}`;
    ctx.shadowOffsetX = vsFontSize * 0.03;
    ctx.shadowOffsetY = vsFontSize * 0.03;
    ctx.shadowBlur = vsFontSize * 0.1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillText('vs', centerX, currentY);
    ctx.restore();
    currentY += vsLineHeight;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    item2Lines.forEach(line => {
      ctx.save();
      ctx.shadowOffsetX = fontSize * 0.03;
      ctx.shadowOffsetY = fontSize * 0.03;
      ctx.shadowBlur = fontSize * 0.07;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(line, centerX, currentY);
      ctx.restore();
      currentY += lineHeight;
    });
    return;
  }

  // --- Normal Mode ---
  function wrapText(text, fontSize, maxWidth, maxLines = 5, minFontSize = 14) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const words = text.split(/\s+/);
    let lines = [];
    let currentLine = '';
    let i = 0;
    while (i < words.length) {
      let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      let testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        } else {
          let word = words[i];
          let part = '';
          for (let c = 0; c < word.length; c++) {
            part += word[c];
            if (ctx.measureText(part + '-').width > maxWidth) {
              if (part.length > 1) {
                lines.push(part.slice(0, -1) + '-');
                part = word[c];
              }
            }
          }
          if (part) currentLine = part;
          i++;
          continue;
        }
      } else {
        currentLine = testLine;
        i++;
      }
      if (lines.length >= maxLines) break;
    }
    if (currentLine && lines.length < maxLines) lines.push(currentLine);
    if (lines.length > maxLines && fontSize > minFontSize) {
      return wrapText(text, fontSize - 2, maxWidth, maxLines, minFontSize);
    }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1];
      while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + '...';
    }
    return lines;
  }
  const minFontSize = isMobileView ? 16 : 22;
  const maxFontSize = isMobileView ? 120 : 180;
  // ADJUSTED: Consider height in initial estimate
  let initialFontSizeEstimate = Math.min(width / 8, height / 5); // Rough estimate: ~4 lines + spacing
  let fontSize = Math.min(initialFontSizeEstimate, maxFontSize);
  fontSize = Math.max(minFontSize, fontSize);
  const maxTextWidth = width * 0.99;
  const maxLines = isMobileView ? 4 : 5;
  let bestFontSize = fontSize;
  let fits = false;
  while (!fits && bestFontSize > minFontSize) {
    let lines = wrapText(currentWord || '', bestFontSize, maxTextWidth, maxLines, minFontSize);
    // ADJUSTED: Use smaller line height multiplier for mobile
    const lineHeight = bestFontSize * (isMobileView ? 1.15 : 1.2);
    const totalHeight = lineHeight * lines.length;
    if (totalHeight <= height * 0.98) {
      fits = true;
    } else {
      bestFontSize -= 1;
    }
  }
  fontSize = bestFontSize;
  let lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
  ctx.font = `bold ${fontSize}px ${fontFamily}`;

  // --- RE-ADD FINAL WIDTH CHECK ---
  let widest = 0;
  // Use for...of loop instead of forEach
  ctx.font = `bold ${fontSize}px ${fontFamily}`; // Set font once before loop
  for (const line of lines) {
    widest = Math.max(widest, ctx.measureText(line).width);
  }

  while (widest > maxTextWidth && fontSize > minFontSize) {
    fontSize -= 1;
    lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
    widest = 0;
    ctx.font = `bold ${fontSize}px ${fontFamily}`; // Set font once before loop
    // Use for...of loop instead of forEach inside loop
    for (const line of lines) {
      widest = Math.max(widest, ctx.measureText(line).width);
    }
  }
  // --- END RE-ADD FINAL WIDTH CHECK ---

  // ADJUSTED: Use smaller line height multiplier for mobile
  const lineHeight = fontSize * (isMobileView ? 1.15 : 1.2);
  const totalHeight = lineHeight * lines.length;
  const textCenterY = centerY;
  let startY = textCenterY - (totalHeight / 2) + (lineHeight / 2);
  lines.forEach((line, index) => {
    ctx.save();
    ctx.shadowOffsetX = fontSize * (isMobileView ? 0.02 : 0.03);
    ctx.shadowOffsetY = fontSize * (isMobileView ? 0.02 : 0.03);
    ctx.shadowBlur = fontSize * (isMobileView ? 0.05 : 0.07);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillText(line, centerX, startY + (index * lineHeight));
    ctx.restore();
  });
} 