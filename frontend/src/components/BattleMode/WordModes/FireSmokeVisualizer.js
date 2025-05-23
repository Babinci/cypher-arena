// FireSmokeVisualizer.js - Animated fire/smoke effect for word display
export function drawFireSmokeBackground(ctx, { x, y, width, height, time, particleSystem }) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Clear the canvas with dark background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Apply stronger blur filter for more subtle, smooth effect
  ctx.filter = 'blur(5px)';
  
  // Define text region bounds (used to avoid particles in text area)
  const textRegion = {
    x: centerX - width * 0.4,
    y: centerY - height * 0.3,
    width: width * 0.8,
    height: height * 0.6
  };
  
  // Update and draw particles, passing text region to avoid
  particleSystem.update(time, textRegion);
  particleSystem.draw(ctx, textRegion);
  
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
    this.maxParticles = 150; // Reduced from 180 for smoother performance and less chaotic appearance
    this.time = 0;
  }
  
  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.emitters = [];
    
    // Create emitter points across the full width
    const emitterCount = Math.max(7, Math.floor(width / 80)); // One emitter per 80px, minimum 7
    for (let i = 0; i < emitterCount; i++) {
      this.emitters.push({
        x: (width / emitterCount) * i + (width / emitterCount) / 2,
        y: height * 0.9,
        variance: width * 0.03 // Increased variance for wider spread
      });
    }
    
    // Add some mid-height emitters for better vertical distribution
    const midEmitterCount = Math.max(3, Math.floor(emitterCount / 2));
    for (let i = 0; i < midEmitterCount; i++) {
      this.emitters.push({
        x: (width / midEmitterCount) * i + (width / midEmitterCount) / 2,
        y: height * 0.6, // Positioned higher up
        variance: width * 0.05,
        isAuxiliary: true // Mark as auxiliary emitter
      });
    }
  }
  
  createParticle(emitter) {
    // Create evolving particle types based on time
    const fireChance = Math.sin(this.time * 0.7) * 0.2 + 0.4; // Varies between 0.2 and 0.6
    
    // Create evolving speeds based on time
    const speedFactor = Math.sin(this.time * 0.3) * 0.3 + 0.7; // Varies between 0.4 and 1.0
    
    // Adjust properties based on emitter type
    let initialVelocity, particleSize, lifespan;
    
    if (emitter.isAuxiliary) {
      // Higher emitters create different types of particles
      initialVelocity = -Math.random() * 2 * speedFactor - 0.8; // Slower for mid-emitters
      particleSize = Math.random() * 30 + 15; // Slightly smaller particles
      lifespan = Math.random() * 6 + 6; // Longer lifespan for higher particles
    } else {
      // Base emitters at the bottom
      initialVelocity = -Math.random() * 3 * speedFactor - 1; // Faster initial upward movement
      particleSize = Math.random() * 40 + 20; // Regular size
      lifespan = Math.random() * 5 + 5; // Regular lifespan
    }
    
    // Increase initial upward velocity to reach higher
    return {
      x: emitter.x + (Math.random() - 0.5) * emitter.variance * 2,
      y: emitter.y,
      vx: (Math.random() - 0.5) * 2 * speedFactor,
      vy: initialVelocity,
      life: 1,
      maxLife: lifespan,
      size: particleSize,
      color: Math.random() > fireChance ? 'fire' : 'smoke',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1 * speedFactor,
      // Add properties for evolution
      age: 0,
      evolutionRate: Math.random() * 0.02 + 0.01,
      evolutionPath: Math.floor(Math.random() * 3), // Different evolution paths
      // Add initial upward boost chance
      hasInitialBoost: Math.random() < (emitter.isAuxiliary ? 0.5 : 0.3), // Higher chance for auxiliary emitters
      // Track emitter type
      fromAuxiliary: emitter.isAuxiliary || false
    };
  }
  
  update(time, textRegion = null) {
    // Keep track of time for evolving patterns (slower time progression for smoother changes)
    this.time += 0.006; // Reduced from 0.01
    
    // Create evolving spawn patterns - lower rates for slower animation
    const baseSpawnRate = Math.sin(this.time * 0.3) * 0.08 + 0.15; // Reduced to vary between 0.07 and 0.23
    const auxSpawnRate = Math.sin(this.time * 0.2) * 0.03 + 0.08; // Reduced for fewer auxiliary emitters
    
    // Occasionally create high-flying particles from bottom emitters (reduced frequency)
    const highFlyerChance = 0.01; // 1% chance per update (halved from 2%)
    if (Math.random() < highFlyerChance && this.particles.length < this.maxParticles) {
      // Find a base emitter (non-auxiliary)
      const baseEmitters = this.emitters.filter(em => !em.isAuxiliary);
      if (baseEmitters.length > 0) {
        // Pick a random base emitter
        const emitterIndex = Math.floor(Math.random() * baseEmitters.length);
        const emitter = baseEmitters[emitterIndex];
        const particle = this.createParticle(emitter);
        
        // Boost it with extra upward velocity to reach the top
        particle.vy *= 3.0; // Even more velocity
        particle.maxLife *= 2.0; // Even longer lifespan
        particle.size *= 0.6; // Make it a bit smaller for better aesthetics
        particle.evolution = 'highflyer'; // Special evolution type
        
        this.particles.push(particle);
      }
    }
    
    // Create "topmost" particles that start near top and fall down slightly (reduced frequency)
    const topmostParticleChance = 0.005; // 0.5% chance per update (halved from 1%)
    if (Math.random() < topmostParticleChance && this.particles.length < this.maxParticles) {
      // Create a particle at the top of the screen
      const x = Math.random() * this.width;
      // Avoid placing particles in the text region if it's defined
      if (!textRegion || x < textRegion.x || x > textRegion.x + textRegion.width) {
        const particle = {
          x: x,
          y: this.height * 0.05, // Near the top
          vx: (Math.random() - 0.5) * 0.5, // Very slow horizontal movement
          vy: Math.random() * 0.3, // Slight downward drift
          life: 1,
          maxLife: Math.random() * 6 + 6, // Long lifespan
          size: Math.random() * 25 + 10, // Smaller particles
          color: Math.random() > 0.8 ? 'fire' : 'smoke', // Mostly smoke
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          age: 0,
          evolutionRate: Math.random() * 0.01 + 0.005,
          evolutionPath: 2, // Swirling path for top particles
          fromAuxiliary: true, // Treat like auxiliary emitters
          isTopParticle: true // Special flag
        };
        
        this.particles.push(particle);
      }
    }
    
    // Spawn particles from base emitters
    const baseEmitters = this.emitters.filter(em => !em.isAuxiliary);
    if (this.particles.length < this.maxParticles && Math.random() < baseSpawnRate) {
      // Select base emitters in patterns rather than just randomly
      const emitterIndex = Math.floor((Math.sin(this.time) + 1) * baseEmitters.length / 2);
      const emitter = baseEmitters[emitterIndex % baseEmitters.length];
      // Avoid spawning from emitters directly under the text region
      if (!textRegion || 
          emitter.x < textRegion.x || 
          emitter.x > textRegion.x + textRegion.width) {
        this.particles.push(this.createParticle(emitter));
      }
    }
    
    // Spawn particles from auxiliary (mid-height) emitters
    const auxEmitters = this.emitters.filter(em => em.isAuxiliary);
    if (auxEmitters.length > 0 && this.particles.length < this.maxParticles && Math.random() < auxSpawnRate) {
      // Select auxiliary emitters semi-randomly
      const emitterIndex = Math.floor(Math.random() * auxEmitters.length);
      const emitter = auxEmitters[emitterIndex];
      // Avoid spawning from emitters in the text region
      if (!textRegion || 
          emitter.x < textRegion.x || 
          emitter.x > textRegion.x + textRegion.width ||
          emitter.y < textRegion.y || 
          emitter.y > textRegion.y + textRegion.height) {
        this.particles.push(this.createParticle(emitter));
      }
    }
    
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Track particle age for evolution (slower aging for more consistent motion)
      particle.age += 0.01; // Reduced from 0.016
      
      // Apply initial boost for particles that have it
      if (particle.hasInitialBoost && particle.age < 0.2) {
        particle.vy -= 0.05; // Extra upward acceleration at the beginning
      }
      
      // Calculate next position - slower movement (0.3 instead of 0.5)
      const nextX = particle.x + particle.vx * 0.3;
      const nextY = particle.y + particle.vy * 0.3;
      
      // Check if next position is in text region - if so, redirect the particle
      if (textRegion && 
          nextX >= textRegion.x && 
          nextX <= textRegion.x + textRegion.width && 
          nextY >= textRegion.y && 
          nextY <= textRegion.y + textRegion.height) {
        
        // Calculate distance to each edge of text region
        const distToLeft = Math.abs(nextX - textRegion.x);
        const distToRight = Math.abs(nextX - (textRegion.x + textRegion.width));
        const distToTop = Math.abs(nextY - textRegion.y);
        const distToBottom = Math.abs(nextY - (textRegion.y + textRegion.height));
        
        // Find the closest edge and deflect the particle away
        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        
        if (minDist === distToLeft) {
          // Deflect left
          particle.vx = -Math.abs(particle.vx) * 1.2;
        } else if (minDist === distToRight) {
          // Deflect right
          particle.vx = Math.abs(particle.vx) * 1.2;
        } else if (minDist === distToTop) {
          // Deflect up
          particle.vy = -Math.abs(particle.vy) * 1.2;
        } else {
          // Deflect down
          particle.vy = Math.abs(particle.vy) * 1.2;
        }
        
        // Add a small random component to prevent particles from getting stuck
        particle.vx += (Math.random() - 0.5) * 0.3;
        particle.vy += (Math.random() - 0.5) * 0.3;
      } else {
        // Normal movement if not in text region
        particle.x = nextX;
        particle.y = nextY;
      }
      
      // Apply forces with evolving behavior
      const ageProgress = particle.age / particle.maxLife;
      
      // Different evolution paths create more variety - but gentler transitions
      if (particle.evolutionPath === 0) {
        // Path 0: Particles that rise more vertically
        particle.vy *= 0.999; // Almost no vertical deceleration to reach top (increased from 0.998)
        particle.vx *= 0.97;  // More horizontal dampening (less severe from 0.96)
        
        // Gentler center pull for smoother movement
        const centerPull = (this.width / 2 - particle.x) * 0.00005 * ageProgress; // Halved force
        particle.vx += centerPull;
      } else if (particle.evolutionPath === 1) {
        // Path 1: Particles that spread more horizontally
        particle.vy *= 0.998; // Very little vertical slowdown (increased from 0.997)
        particle.vx *= 0.995; // Less horizontal dampening (increased from 0.99)
        
        // More sideways movement as they age, but smoother
        const lateralForce = Math.sin(particle.age) * 0.025 * ageProgress; // Halved force, slower oscillation
        particle.vx += lateralForce;
      } else {
        // Path 2: Swirling particles
        particle.vy *= 0.999; // Even less vertical slowdown (increased from 0.998)
        particle.vx *= 0.99; // Less horizontal dampening (increased from 0.98)
        
        // Add swirl effect increasing with age - gentler for smoother movement
        const swirl = Math.sin(particle.age * 1.5) * 0.04 * ageProgress; // Reduced force and frequency
        const swirlX = Math.cos(particle.age) * swirl; // Reduced frequency
        const swirlY = Math.sin(particle.age) * swirl; // Reduced frequency
        
        particle.vx += swirlX;
        particle.vy += swirlY;
      }
      
      // Reduced turbulence for smoother movement
      const turbulence = Math.sin(this.time + particle.x / 100 + particle.y / 100) * 0.15; // Halved from 0.3
      particle.vx += (Math.random() - 0.5) * 0.1 + turbulence * 0.05; // Halved random movement
      
      // Special handling for different particle types - gentler movement
      if (particle.isTopParticle) {
        // Top particles have different behavior
        particle.vy += Math.sin(particle.age * 0.5 + this.time * 0.5) * 0.005; // Slower, gentler wavy vertical movement
        particle.life -= 1 / (particle.maxLife * 130); // Even slower fade for top particles
      } else if (particle.evolution === 'highflyer') {
        // High flyers get extra vertical boosts (but less frequently)
        if (Math.random() < 0.02) { // Reduced from 0.05
          particle.vy -= 0.12; // Gentler upward boosts (reduced from 0.2)
        }
        particle.life -= 1 / (particle.maxLife * 120); // Slower fade for high flyers
      } else {
        // Less frequent upward boosts for regular particles
        if (Math.random() < 0.015) { // Halved from 0.03
          const evolutionJump = Math.sin(this.time * 0.3) * 0.3 + 0.3; // 0 to 0.6 based on time (reduced)
          particle.vx += (Math.random() - 0.5) * evolutionJump * 0.7; // Reduced lateral force
          particle.vy -= Math.random() * evolutionJump * 0.3; // Gentler upward boost
        }
        // Update life (even slower fade)
        particle.life -= 1 / (particle.maxLife * 110);
      }
      
      // Update rotation (even slower rotation)
      particle.rotation += particle.rotationSpeed * 0.4; // Reduced from 0.7
      
      // Randomize rotation very occasionally for more subtle chaos
      if (Math.random() < 0.008) { // Reduced from 0.02
        particle.rotationSpeed = (Math.random() - 0.5) * 0.06; // Reduced from 0.1
      }
      
      // Remove dead particles only when life expires, not when they reach the top
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw(ctx, textRegion = null) {
    ctx.save();
    
    for (const particle of this.particles) {
      // Skip drawing if particle is within text region
      if (textRegion && 
          particle.x >= textRegion.x && 
          particle.x <= textRegion.x + textRegion.width && 
          particle.y >= textRegion.y && 
          particle.y <= textRegion.y + textRegion.height) {
        continue;
      }
      
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Calculate alpha based on life and apply evolution
      const alpha = particle.life;
      const ageProgress = particle.age / particle.maxLife;
      
      // Size evolves over particle lifetime
      const sizeEvolution = 1 + Math.sin(particle.age * 3) * 0.2;
      const evolvedSize = particle.size * sizeEvolution;
      
      if (particle.color === 'fire') {
        // Fire particles with evolving colors
        const hueShift = Math.sin(this.time * 0.5 + particle.age * 2) * 20; // -20 to +20 range
        
        // Core color shifts based on particle evolution path, age, and special types
        let coreColor, midColor, outerColor;
        
        // Adjust alpha for position - particles at the top are more transparent
        const heightFactor = 1.0 - Math.max(0, Math.min(1, (this.height - particle.y) / this.height));
        const positionAlpha = 1.0 - (heightFactor * 0.5); // Progressively more transparent near top
        
        // Reduce overall particle intensity for better text contrast
        const contrastFactor = 0.85; // Slightly dimmer particles (85% of original brightness)
        
        // Special handling for different types
        if (particle.isTopParticle) {
          // Top particles are more gaseous and transparent
          coreColor = `rgba(255, ${210 - ageProgress * 50}, ${100 + hueShift}, ${alpha * 0.3 * positionAlpha * contrastFactor})`;
          midColor = `rgba(255, ${150 - ageProgress * 50}, ${50 + hueShift}, ${alpha * 0.2 * positionAlpha * contrastFactor})`;
          outerColor = `rgba(${220 - ageProgress * 40}, ${60 - ageProgress * 30}, ${20 + hueShift}, ${alpha * 0.1 * positionAlpha * contrastFactor})`;
        } else if (particle.evolution === 'highflyer') {
          // High flyers are more vibrant but smaller
          coreColor = `rgba(255, ${240 - ageProgress * 40}, ${150 + hueShift}, ${alpha * 0.4 * positionAlpha * contrastFactor})`;
          midColor = `rgba(255, ${190 - ageProgress * 50}, ${60 + hueShift}, ${alpha * 0.3 * positionAlpha * contrastFactor})`;
          outerColor = `rgba(${230 - ageProgress * 30}, ${100 - ageProgress * 40}, ${30 + hueShift}, ${alpha * 0.2 * positionAlpha * contrastFactor})`;
        } else if (particle.evolutionPath === 0) {
          // Hotter, more yellow core
          coreColor = `rgba(255, ${255 - ageProgress * 30}, ${120 + hueShift}, ${alpha * 0.5 * positionAlpha * contrastFactor})`;
          midColor = `rgba(255, ${180 - ageProgress * 40}, ${50 + hueShift}, ${alpha * 0.4 * positionAlpha * contrastFactor})`;
          outerColor = `rgba(${255 - ageProgress * 55}, ${100 - ageProgress * 50}, ${20 + hueShift}, ${alpha * 0.25 * positionAlpha * contrastFactor})`;
        } else if (particle.evolutionPath === 1) {
          // More orange, ember-like
          coreColor = `rgba(255, ${220 - ageProgress * 60}, ${80 + hueShift}, ${alpha * 0.5 * positionAlpha * contrastFactor})`;
          midColor = `rgba(255, ${160 - ageProgress * 50}, ${40 + hueShift}, ${alpha * 0.4 * positionAlpha * contrastFactor})`;
          outerColor = `rgba(${220 - ageProgress * 40}, ${80 - ageProgress * 30}, ${20 + hueShift}, ${alpha * 0.25 * positionAlpha * contrastFactor})`;
        } else {
          // More red, intense
          coreColor = `rgba(255, ${200 - ageProgress * 80}, ${100 + hueShift}, ${alpha * 0.5 * positionAlpha * contrastFactor})`;
          midColor = `rgba(255, ${140 - ageProgress * 60}, ${30 + hueShift}, ${alpha * 0.4 * positionAlpha * contrastFactor})`;
          outerColor = `rgba(${200 - ageProgress * 20}, ${60 - ageProgress * 40}, ${10 + hueShift}, ${alpha * 0.25 * positionAlpha * contrastFactor})`;
        }
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, evolvedSize);
        gradient.addColorStop(0, coreColor);
        gradient.addColorStop(0.3, midColor);
        gradient.addColorStop(0.6, outerColor);
        gradient.addColorStop(1, 'rgba(180, 50, 10, 0)');
        
        ctx.fillStyle = gradient;
      } else {
        // Smoke particles with evolving opacity
        const smokeOpacity = 0.25 - ageProgress * 0.1; // Smoke gets more transparent with age
        
        // Adjust alpha for position - smoke at the top is more transparent
        const heightFactor = 1.0 - Math.max(0, Math.min(1, (this.height - particle.y) / this.height));
        const positionAlpha = 1.0 - (heightFactor * 0.7); // More position-dependent than fire
        
        // Reduce overall particle intensity for better text contrast
        const contrastFactor = 0.85; // Slightly dimmer particles
        
        // Different smoke colors based on type and position
        let smokeGray;
        if (particle.isTopParticle) {
          // Very light smoke at top
          smokeGray = 130;
        } else if (particle.evolution === 'highflyer') {
          // Medium smoke for high flyers
          smokeGray = 110;
        } else {
          // Darker smoke for regular particles
          smokeGray = 90;
        }
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, evolvedSize);
        gradient.addColorStop(0, `rgba(${smokeGray}, ${smokeGray}, ${smokeGray}, ${alpha * smokeOpacity * positionAlpha * contrastFactor})`);
        gradient.addColorStop(0.5, `rgba(${smokeGray * 0.6}, ${smokeGray * 0.6}, ${smokeGray * 0.6}, ${alpha * smokeOpacity * 0.6 * positionAlpha * contrastFactor})`);
        gradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
        
        ctx.fillStyle = gradient;
      }
      
      // Draw with evolved size and shape
      ctx.beginPath();
      
      // Occasionally draw non-circular particles for more organic look
      if (particle.evolutionPath === 2 && ageProgress > 0.3) {
        // Elongated ellipse that stretches as it ages
        const stretch = 1 + ageProgress * 0.5;
        ctx.ellipse(0, 0, evolvedSize * stretch, evolvedSize / stretch, particle.rotation, 0, Math.PI * 2);
      } else {
        ctx.arc(0, 0, evolvedSize, 0, Math.PI * 2);
      }
      
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
  const { width, height, centerX, centerY } = rectangle;
  
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
      ctx.font = `700 ${baseSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
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
    ctx.font = `700 ${item1FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Draw text shadow/outline for better contrast with fire background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // Add moderate glow effect - less intense than before
    ctx.fillStyle = '#F0F0F0'; // Slightly off-white for less eye strain
    ctx.fillText(item1, centerX, centerY - spacing);
    
    // Draw VS text
    const vsScaledFontSize = getScaledFontSize("VS", vsFontSize);
    ctx.font = `800 ${vsScaledFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFE87C'; // Softer gold for less eye strain
    ctx.fillText("VS", centerX, centerY);
    
    // Draw second item with same style as first
    const item2FontSize = getScaledFontSize(item2, itemFontSize);
    ctx.font = `700 ${item2FontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#F0F0F0'; // Slightly off-white
    ctx.fillText(item2, centerX, centerY + spacing);
  } 
  // Regular word mode
  else if (currentWord) {
    ctx.font = `700 ${fontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Check if text fits within the rectangle width
    const textWidth = ctx.measureText(currentWord).width;
    const padding = width * 0.05;
    const maxTextWidth = width - (padding * 2);
    
    // Scale down font if text is too wide
    let actualFontSize = fontSize;
    if (textWidth > maxTextWidth) {
      actualFontSize = fontSize * (maxTextWidth / textWidth);
    }
    
    // Update font with actual size - using 700 weight instead of 900 for less eye strain
    ctx.font = `700 ${actualFontSize}px Montserrat, -apple-system, BlinkMacSystemFont, sans-serif`;
    
    // Add subtle shadow for better text readability on fire background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4; 
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // Use slightly off-white for better viewing comfort
    ctx.fillStyle = '#F0F0F0';
    ctx.fillText(currentWord, centerX, centerY);
    
    // Add very subtle glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 200, 50, 0.4)';
    ctx.shadowOffsetY = 0;
    ctx.fillText(currentWord, centerX, centerY);
  }
  
  ctx.restore();
}