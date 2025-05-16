// FireSmokeVisualizer.js - Animated fire/smoke effect for word display
export function drawFireSmokeBackground(ctx, { x, y, width, height, time, particleSystem }) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Clear the canvas with dark background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Apply stronger blur filter for more subtle effect
  ctx.filter = 'blur(4px)';
  
  // Update and draw particles
  particleSystem.update(time);
  particleSystem.draw(ctx);
  
  // Create glow effect across the screen
  const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
  const glowIntensity = Math.sin(time * 2) * 0.1 + 0.15;
  
  glowGradient.addColorStop(0, `rgba(255, 120, 60, ${glowIntensity * 0.7})`);
  glowGradient.addColorStop(0.2, `rgba(255, 80, 30, ${glowIntensity * 0.5})`);
  glowGradient.addColorStop(0.4, `rgba(200, 50, 20, ${glowIntensity * 0.3})`);
  glowGradient.addColorStop(0.7, `rgba(100, 30, 10, ${glowIntensity * 0.1})`);
  glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// Particle system for fire/smoke effect
export class FireSmokeParticleSystem {
  constructor(width, height) {
    this.updateDimensions(width, height);
    this.particles = [];
    this.maxParticles = 120;
  }
  
  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.emitters = [];
    
    // Create emitter points across the full width
    const emitterCount = Math.max(5, Math.floor(width / 100)); // One emitter per 100px, minimum 5
    for (let i = 0; i < emitterCount; i++) {
      this.emitters.push({
        x: (width / emitterCount) * i + (width / emitterCount) / 2,
        y: height * 0.9,
        variance: width * 0.02
      });
    }
  }
  
  createParticle(emitter) {
    return {
      x: emitter.x + (Math.random() - 0.5) * emitter.variance * 2,
      y: emitter.y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2.5 - 1,
      life: 1,
      maxLife: Math.random() * 3 + 2,
      size: Math.random() * 40 + 20,
      color: Math.random() > 0.6 ? 'fire' : 'smoke',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
  }
  
  update(time) {
    // Spawn new particles
    if (this.particles.length < this.maxParticles) {
      const emitter = this.emitters[Math.floor(Math.random() * this.emitters.length)];
      this.particles.push(this.createParticle(emitter));
    }
    
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position (slower movement)
      particle.x += particle.vx * 0.7;
      particle.y += particle.vy * 0.7;
      
      // Apply forces
      particle.vy *= 0.99; // Even slower upward deceleration
      particle.vx *= 0.98; // Less horizontal damping for smoother movement
      
      // Create more random structures with variable turbulence
      const turbulence = Math.sin(particle.life * 10 + particle.x / 50) * 0.6;
      particle.vx += (Math.random() - 0.5) * 0.3 + turbulence * 0.2;
      
      // Occasional sideways drift for more organic movement
      if (Math.random() < 0.05) {
        particle.vx += (Math.random() - 0.5) * 1.2;
      }
      
      // Update life (slower fade)
      particle.life -= 1 / (particle.maxLife * 90);
      
      // Update rotation (slower rotation)
      particle.rotation += particle.rotationSpeed * 0.7;
      
      // Randomize rotation occasionally for more chaos
      if (Math.random() < 0.02) {
        particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
      }
      
      // Remove dead particles
      if (particle.life <= 0 || particle.y < -particle.size) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    for (const particle of this.particles) {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Calculate alpha based on life
      const alpha = particle.life;
      
      if (particle.color === 'fire') {
        // Fire particles (more subtle)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, `rgba(255, 255, 120, ${alpha * 0.5})`);
        gradient.addColorStop(0.3, `rgba(255, 180, 50, ${alpha * 0.4})`);
        gradient.addColorStop(0.6, `rgba(255, 100, 20, ${alpha * 0.25})`);
        gradient.addColorStop(1, 'rgba(180, 50, 10, 0)');
        
        ctx.fillStyle = gradient;
      } else {
        // Smoke particles (more subtle)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, `rgba(100, 100, 100, ${alpha * 0.25})`);
        gradient.addColorStop(0.5, `rgba(60, 60, 60, ${alpha * 0.15})`);
        gradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
        
        ctx.fillStyle = gradient;
      }
      
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    ctx.restore();
  }
}

// Modified text renderer for fire/smoke background
export function renderFireSmokeText(ctx, { currentWord, rectangle, isMobileView }) {
  // Reset any filters before drawing text
  ctx.filter = 'none';
  const { x, y, width, height, centerX, centerY } = rectangle;
  
  ctx.save();
  
  // Calculate font size as percentage of smaller dimension
  const fontSize = Math.min(width, height) * 0.25;
  
  // Set text properties
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle contrast mode (with VS)
  if (currentWord && currentWord.includes('###VS###')) {
    const [item1, item2] = currentWord.split('###VS###').map(item => item.trim());
    
    // Calculate sizes for contrast mode
    const itemFontSize = fontSize * 0.7;
    const vsFontSize = itemFontSize * 0.8;
    
    // Position calculations for 3-element layout
    const spacing = height * 0.25;
    
    // Helper function to get scaled font size for text
    const getScaledFontSize = (text, baseSize) => {
      ctx.font = `900 ${baseSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      const padding = width * 0.05;
      const maxTextWidth = width - (padding * 2);
      
      if (textWidth > maxTextWidth) {
        return baseSize * (maxTextWidth / textWidth);
      }
      return baseSize;
    };
    
    // Draw first item with fire glow
    const item1FontSize = getScaledFontSize(item1, itemFontSize);
    ctx.font = `900 ${item1FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Add glow effect
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(item1, centerX, centerY - spacing);
    
    // Draw VS text with stronger glow
    const vsScaledFontSize = getScaledFontSize("VS", vsFontSize);
    ctx.font = `900 ${vsScaledFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#FFD700';
    ctx.fillText("VS", centerX, centerY);
    
    // Draw second item with fire glow
    const item2FontSize = getScaledFontSize(item2, itemFontSize);
    ctx.font = `900 ${item2FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(item2, centerX, centerY + spacing);
  } 
  // Regular word mode
  else if (currentWord) {
    ctx.font = `900 ${fontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Check if text fits within the rectangle width
    const textWidth = ctx.measureText(currentWord).width;
    const padding = width * 0.05;
    const maxTextWidth = width - (padding * 2);
    
    // Scale down font if text is too wide
    let actualFontSize = fontSize;
    if (textWidth > maxTextWidth) {
      actualFontSize = fontSize * (maxTextWidth / textWidth);
    }
    
    // Update font with actual size
    ctx.font = `900 ${actualFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Draw text with fire glow effect
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(currentWord, centerX, centerY);
    
    // Add extra glow layer
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(currentWord, centerX, centerY);
  }
  
  ctx.restore();
}