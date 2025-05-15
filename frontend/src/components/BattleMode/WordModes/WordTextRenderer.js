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
  // Increased base font size for better visibility
  const baseFontSize = isMobileView ? 24 : 48; // Increased from 20/40 for better visibility
  
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
    
    // Draw thicker outline for first item
    ctx.strokeStyle = 'black';
    ctx.lineWidth = itemFontSize * 0.15; // Increased from 0.1 for better visibility
    ctx.lineJoin = 'round';
    ctx.strokeText(item1Text, centerX, centerY - itemSpace);
    
    // Draw white fill text with green glow
    ctx.shadowColor = 'rgba(29, 185, 84, 0.4)';
    ctx.shadowBlur = itemFontSize * 0.2;
    ctx.fillStyle = 'white';
    ctx.fillText(item1Text, centerX, centerY - itemSpace);
    ctx.restore();
    
    // Draw VS text (middle third)
    ctx.save();
    ctx.font = `bold ${vsFontSize}px ${fontFamily}`;
    
    // Thicker outline for VS
    ctx.strokeStyle = 'black';
    ctx.lineWidth = vsFontSize * 0.15; // Increased from 0.1
    ctx.strokeText("VS", centerX, centerY);
    
    // Spotify green fill for VS with glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = vsFontSize * 0.2;
    ctx.fillStyle = '#1DB954'; // Spotify green
    ctx.fillText("VS", centerX, centerY);
    ctx.restore();
    
    // Draw second item (bottom third)
    ctx.save();
    ctx.font = `bold ${itemFontSize}px ${fontFamily}`;
    
    // Measure text to truncate if needed
    let item2Text = fitTextToWidth(ctx, item2, maxTextWidth);
    
    // Draw thicker outline for second item
    ctx.strokeStyle = 'black';
    ctx.lineWidth = itemFontSize * 0.15; // Increased from 0.1
    ctx.lineJoin = 'round';
    ctx.strokeText(item2Text, centerX, centerY + itemSpace);
    
    // Draw white fill text with green glow
    ctx.shadowColor = 'rgba(29, 185, 84, 0.4)';
    ctx.shadowBlur = itemFontSize * 0.2;
    ctx.fillStyle = 'white';
    ctx.fillText(item2Text, centerX, centerY + itemSpace);
    ctx.restore();
  } 
  // Regular word mode
  else if (currentWord) {
    // For single words, use a larger font size but ensure it fits
    const wordFontSize = scaledFontSize * 2.2; // Increased from 2 for better visibility
    
    // Measure and fit text to container width
    ctx.font = `bold ${wordFontSize}px ${fontFamily}`;
    const maxTextWidth = width * 0.9; // 90% of container width
    let displayText = fitTextToWidth(ctx, currentWord, maxTextWidth);
    
    // Draw the word with outline and fill
    ctx.save();
    
    // Draw thicker black outline (double layer for better visibility)
    // First outer shadow for better contrast against background
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = wordFontSize * 0.12; // Increased from 0.08
    ctx.lineJoin = 'round';
    ctx.strokeText(displayText, centerX, centerY);
    
    // Second inner stroke
    ctx.strokeStyle = 'black';
    ctx.lineWidth = wordFontSize * 0.06;
    ctx.strokeText(displayText, centerX, centerY);
    
    // Draw white fill with stronger green glow
    ctx.shadowColor = 'rgba(29, 185, 84, 0.5)'; // Increased from 0.3
    ctx.shadowBlur = wordFontSize * 0.25; // Increased from 0.15
    ctx.fillStyle = 'white';
    ctx.fillText(displayText, centerX, centerY);
    
    // Extra highlight for better readability
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
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