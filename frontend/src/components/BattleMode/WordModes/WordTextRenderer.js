// WordTextRenderer.js
// Rewritten to fit text properly in rectangle

/**
 * Word text renderer that follows screen display requirements
 */
export function renderWordText(ctx, { currentWord, rectangle, isMobileView }) {
  const { x, y, width, height, centerX, centerY } = rectangle;

  // Get screen display requirements - using Oswald font from our theme
  const fontFamily = "var(--font-display), 'Impact', sans-serif"; // Oswald font per UI design
  
  // Screen display requirements from memory-bank/screenDisplayRequirements.md
  // Set font sizes based on requirements: Projector 30-40pt, Mobile 16-20px, Desktop 16-24px
  const baseFontSize = isMobileView ? 20 : 40; // Use the upper range of requirements
  
  // Adjust font size based on container dimensions to ensure proper proportions
  const containerScale = Math.min(width, height) / (isMobileView ? 300 : 600);
  const scaledFontSize = Math.max(baseFontSize * containerScale, baseFontSize);
  
  // Setup text properties
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle contrast mode (with VS)
  if (currentWord && currentWord.includes('###VS###')) {
    const [item1, item2] = currentWord.split('###VS###').map(item => item.trim());
    
    // Calculate sizes for contrast mode
    const itemFontSize = scaledFontSize;
    const vsFontSize = itemFontSize * 1.2; // Slightly larger VS
    
    // Position calculations for 3-element layout
    const totalHeight = height * 0.8; // Use 80% of height
    const itemSpace = totalHeight / 3; // Divide into 3 equal parts
    
    // Draw first item (top third)
    ctx.save();
    ctx.font = `bold ${itemFontSize}px ${fontFamily}`;
    
    // Measure text to truncate if needed
    const maxTextWidth = width * 0.9; // 90% of container width
    let item1Text = fitTextToWidth(ctx, item1, maxTextWidth);
    
    // Draw outline for first item
    ctx.strokeStyle = 'black';
    ctx.lineWidth = itemFontSize * 0.1;
    ctx.lineJoin = 'round';
    ctx.strokeText(item1Text, centerX, centerY - itemSpace);
    
    // Draw white fill text
    ctx.fillStyle = 'white';
    ctx.fillText(item1Text, centerX, centerY - itemSpace);
    ctx.restore();
    
    // Draw VS text (middle third)
    ctx.save();
    ctx.font = `bold ${vsFontSize}px ${fontFamily}`;
    
    // Outline for VS
    ctx.strokeStyle = 'black';
    ctx.lineWidth = vsFontSize * 0.1;
    ctx.strokeText("VS", centerX, centerY);
    
    // Spotify green fill for VS
    ctx.fillStyle = '#1DB954'; // Spotify green
    ctx.fillText("VS", centerX, centerY);
    ctx.restore();
    
    // Draw second item (bottom third)
    ctx.save();
    ctx.font = `bold ${itemFontSize}px ${fontFamily}`;
    
    // Measure text to truncate if needed
    let item2Text = fitTextToWidth(ctx, item2, maxTextWidth);
    
    // Draw outline for second item
    ctx.strokeStyle = 'black';
    ctx.lineWidth = itemFontSize * 0.1;
    ctx.lineJoin = 'round';
    ctx.strokeText(item2Text, centerX, centerY + itemSpace);
    
    // Draw white fill text
    ctx.fillStyle = 'white';
    ctx.fillText(item2Text, centerX, centerY + itemSpace);
    ctx.restore();
  } 
  // Regular word mode
  else if (currentWord) {
    // For single words, use a larger font size but ensure it fits
    const wordFontSize = scaledFontSize * 2;
    
    // Measure and fit text to container width
    ctx.font = `bold ${wordFontSize}px ${fontFamily}`;
    const maxTextWidth = width * 0.9; // 90% of container width
    let displayText = fitTextToWidth(ctx, currentWord, maxTextWidth);
    
    // Draw the word with outline and fill
    ctx.save();
    
    // Draw thick black outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = wordFontSize * 0.08;
    ctx.lineJoin = 'round';
    ctx.strokeText(displayText, centerX, centerY);
    
    // Draw white fill with subtle green glow (Spotify style)
    ctx.shadowColor = 'rgba(29, 185, 84, 0.3)';
    ctx.shadowBlur = wordFontSize * 0.15;
    ctx.fillStyle = 'white';
    ctx.fillText(displayText, centerX, centerY);
    ctx.restore();
  }
}

// Helper function to make text fit within width
function fitTextToWidth(ctx, text, maxWidth) {
  const width = ctx.measureText(text).width;
  
  // If text fits, return it unchanged
  if (width <= maxWidth) {
    return text;
  }
  
  // Text is too long, truncate with ellipsis
  let truncated = text;
  let ellipsis = '...';
  
  // Binary search to find maximum text that fits with ellipsis
  while (ctx.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated + ellipsis;
}