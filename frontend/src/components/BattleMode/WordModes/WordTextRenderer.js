// WordTextRenderer.js - Fixed version with proper bounds
export function renderWordText(ctx, { currentWord, rectangle, isMobileView }) {
  const { width, height, centerX, centerY } = rectangle;

  ctx.save();
  
  // Calculate font size as percentage of smaller dimension
  // This ensures text scales properly with the container
  const fontSize = Math.min(width, height) * 0.25; // 25% of smaller dimension
  
  // Set text properties
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle contrast mode (with VS)
  if (currentWord && currentWord.includes('###VS###')) {
    const [item1, item2] = currentWord.split('###VS###').map(item => item.trim());
    
    // Calculate sizes for contrast mode
    const itemFontSize = fontSize * 0.7;
    const vsFontSize = itemFontSize * 0.8; // Reduced from 1.2 to 0.8 for smaller VS
    
    // Position calculations for 3-element layout
    const spacing = height * 0.25;
    
    // Helper function to get scaled font size for text
    const getScaledFontSize = (text, baseSize) => {
      ctx.font = `700 ${baseSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      const padding = width * 0.05;
      const maxTextWidth = width - (padding * 2);
      
      if (textWidth > maxTextWidth) {
        return baseSize * (maxTextWidth / textWidth);
      }
      return baseSize;
    };
    
    // Draw first item
    const item1FontSize = getScaledFontSize(item1, itemFontSize);
    ctx.font = `700 ${item1FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.fillStyle = '#E6E6E6'; // 10% dimmer than white
    ctx.fillText(item1, centerX, centerY - spacing);
    
    // Draw VS text
    const vsScaledFontSize = getScaledFontSize("VS", vsFontSize);
    ctx.font = `800 ${vsScaledFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.fillStyle = '#1AAE4D'; // Slightly dimmer green (10% less bright)
    ctx.fillText("VS", centerX, centerY);
    
    // Draw second item
    const item2FontSize = getScaledFontSize(item2, itemFontSize);
    ctx.font = `700 ${item2FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.fillStyle = '#E6E6E6'; // 10% dimmer than white
    ctx.fillText(item2, centerX, centerY + spacing);
  } 
  // Regular word mode
  else if (currentWord) {
    ctx.font = `700 ${fontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Check if text fits within the rectangle width
    const textWidth = ctx.measureText(currentWord).width;
    const padding = width * 0.05; // 5% padding on each side
    const maxTextWidth = width - (padding * 2);
    
    // Scale down font if text is too wide
    let actualFontSize = fontSize;
    if (textWidth > maxTextWidth) {
      actualFontSize = fontSize * (maxTextWidth / textWidth);
    }
    
    // Update font with actual size
    ctx.font = `700 ${actualFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Draw text without black stroke
    ctx.fillStyle = '#E6E6E6'; // 10% dimmer than white
    ctx.fillText(currentWord, centerX, centerY);
  }
  
  ctx.restore();
}

// Helper function to make text fit within width
export function fitTextToWidth(ctx, text, maxWidth) {
  const width = ctx.measureText(text).width;
  
  if (width <= maxWidth) {
    return text;
  }
  
  let truncated = text;
  let ellipsis = '...';
  
  while (ctx.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated + ellipsis;
}