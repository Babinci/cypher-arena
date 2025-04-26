// Draws an animated gradient rectangle on the given canvas context
// Params: ctx (CanvasRenderingContext2D), options: { x, y, width, height, borderRadius, time }
export function drawGradientRectangle(ctx, { x, y, width, height, borderRadius, time }) {
  // Calculate animated colors
  const innerColor = `hsla(${(time * 30) % 360}, 50%, 60%, 1)`;
  const midColor = `hsla(${((time * 30) + 30) % 360}, 50%, 65%, 1)`;
  const outerColor = `hsla(${((time * 30) + 60) % 360}, 50%, 70%, 1)`;
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.4, innerColor);
  gradient.addColorStop(0.7, midColor);
  gradient.addColorStop(1, outerColor);

  ctx.beginPath();
  ctx.moveTo(x + borderRadius, y);
  ctx.lineTo(x + width - borderRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
  ctx.lineTo(x + width, y + height - borderRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
  ctx.lineTo(x + borderRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
  ctx.lineTo(x, y + borderRadius);
  ctx.quadraticCurveTo(x, y, x + borderRadius, y);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}
