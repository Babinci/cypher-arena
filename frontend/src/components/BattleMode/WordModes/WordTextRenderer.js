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
  const { x, y, width, height, centerX, centerY } = rectangle;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';

  // Helper to fit font size to rectangle width
  function fitFontSizeToWidth(text, initialFontSize, maxWidth, minFontSize = 14, isBold = true) {
    let fontSize = initialFontSize;
    ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
    let measured = ctx.measureText(text);
    while (measured.width > maxWidth && fontSize > minFontSize) {
      fontSize -= 1;
      ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      measured = ctx.measureText(text);
    }
    return fontSize;
  }

  // --- Contrast Mode ---
  const isContrastMode = currentWord && currentWord.includes('###VS###');
  if (isContrastMode) {
    const [item1, item2] = currentWord.split('###VS###');
    const maxTextWidth = width * 0.99;
    const minFontSize = isMobileView ? 16 : 22;
    const maxFontSize = isMobileView ? 110 : 160;
    let fontSize = Math.min(width / 9, maxFontSize);
    fontSize = Math.max(minFontSize, fontSize);
    // Enhanced: always wrap long phrases to next line for better readability
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
    const item1FontSize = fitFontSizeToWidth(item1.trim(), fontSize, maxTextWidth);
    const item2FontSize = fitFontSizeToWidth(item2.trim(), fontSize, maxTextWidth);
    fontSize = Math.min(item1FontSize, item2FontSize);
    const vsFontSize = Math.max(fontSize * 1.2, fontSize + 4);
    const lineHeight = fontSize * 1.3;
    const vsLineHeight = vsFontSize * 1.5;
    // Use enhanced wrapping for both items, with char threshold
    const item1Lines = wrapTextEnhanced(item1, fontSize, maxTextWidth, 3, 18);
    const item2Lines = wrapTextEnhanced(item2, fontSize, maxTextWidth, 3, 18);
    const item1Height = item1Lines.length * lineHeight;
    const item2Height = item2Lines.length * lineHeight;
    const vsHeight = vsLineHeight;
    const totalHeight = item1Height + vsHeight + item2Height;
    let currentY = centerY - (totalHeight / 2);
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
  let fontSize = Math.min(width / 8, maxFontSize);
  fontSize = Math.max(minFontSize, fontSize);
  const maxTextWidth = width * 0.99;
  const maxLines = isMobileView ? 4 : 5;
  let lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
  let widest = 0;
  lines.forEach(line => {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    widest = Math.max(widest, ctx.measureText(line).width);
  });
  while (widest > maxTextWidth && fontSize > minFontSize) {
    fontSize -= 1;
    lines = wrapText(currentWord || '', fontSize, maxTextWidth, maxLines, minFontSize);
    widest = 0;
    lines.forEach(line => {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      widest = Math.max(widest, ctx.measureText(line).width);
    });
  }
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const lineHeight = fontSize * (isMobileView ? 1.3 : 1.2);
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