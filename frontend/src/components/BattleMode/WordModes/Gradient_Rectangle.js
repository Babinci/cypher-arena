// Draws an animated gradient rectangle on the given canvas context
// Params: ctx (CanvasRenderingContext2D), options: { x, y, width, height, borderRadius, time }
export function drawGradientRectangle(ctx, { x, y, width, height, borderRadius, time }) {
  // Create gradient with changing color stops based on time
  const baseColorStop = time % 1; // Between 0 and 1
  
  // Define our Spotify-inspired color palette
  const bgDeep = '#121212';     // Spotify deep background
  const bgLight = '#282828';    // Spotify lighter background
  const accentColor = '#1DB954'; // Spotify green accent
  
  // Create gradient that shifts over time - use radial gradient for more dramatic effect
  const gradient = ctx.createRadialGradient(
    x + width/2, y + height/2, 0,
    x + width/2, y + height/2, width * 0.8
  );
  
  // Simple gradient for background contrast with text
  gradient.addColorStop(0, bgLight); // Lighter in center
  gradient.addColorStop(0.7, bgDeep); // Darker toward edges
  
  // Save context state
  ctx.save();
  
  // Draw rectangle with minimal rounded corners
  ctx.beginPath();
  const smallerRadius = borderRadius * 0.6; // Reduce corner radius
  ctx.moveTo(x + smallerRadius, y);
  ctx.lineTo(x + width - smallerRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + smallerRadius);
  ctx.lineTo(x + width, y + height - smallerRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - smallerRadius, y + height);
  ctx.lineTo(x + smallerRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - smallerRadius);
  ctx.lineTo(x, y + smallerRadius);
  ctx.quadraticCurveTo(x, y, x + smallerRadius, y);
  ctx.closePath();
  
  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Add subtle inner shadow
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = width * 0.07;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.fill();
  
  // Add stronger, more visible border
  const pulseIntensity = Math.sin(time * 4) * 0.4 + 0.6; // Value between 0.2 and 1
  ctx.strokeStyle = `rgba(29, 185, 84, ${pulseIntensity * 0.95})`; // Increased opacity for better visibility
  ctx.lineWidth = Math.max(width, height) * 0.02; // Doubled border thickness for better visibility
  ctx.stroke();
  
  // Add second, outer border for depth
  ctx.strokeStyle = `rgba(29, 185, 84, ${pulseIntensity * 0.4})`;
  ctx.lineWidth = Math.max(width, height) * 0.03;
  ctx.stroke();
  
  // Add spotlight effect
  const spotlightGradient = ctx.createRadialGradient(
    x + width/2, y + height/2, 0,
    x + width/2, y + height/2, width * 0.8
  );
  spotlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 * pulseIntensity})`);
  spotlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = spotlightGradient;
  ctx.fill();
  
  // Restore context state
  ctx.restore();
}