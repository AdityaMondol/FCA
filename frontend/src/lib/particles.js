// Advanced Particle System for Futuristic Backgrounds
export class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.options = {
      particleCount: options.particleCount || 100,
      particleSize: options.particleSize || 2,
      particleColor: options.particleColor || '#6366F1',
      connectionDistance: options.connectionDistance || 150,
      speed: options.speed || 0.5,
      interactive: options.interactive !== false,
      ...options
    };
    
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    
    if (this.options.interactive) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      
      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: Math.random() * this.options.particleSize + 1
      });
    }
  }
  
  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.options.particleColor;
    this.ctx.fill();
  }
  
  drawConnection(p1, p2, distance) {
    const opacity = 1 - (distance / this.options.connectionDistance);
    this.ctx.beginPath();
    this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }
  
  updateParticle(particle) {
    // Mouse interaction
    if (this.mouse.x !== null && this.options.interactive) {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.mouse.radius) {
        const force = (this.mouse.radius - distance) / this.mouse.radius;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 0.2;
        particle.vy -= Math.sin(angle) * force * 0.2;
      }
    }
    
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Bounce off edges
    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.vx *= -1;
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.vy *= -1;
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
    }
    
    // Damping
    particle.vx *= 0.99;
    particle.vy *= 0.99;
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });
    
    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance) {
          this.drawConnection(this.particles[i], this.particles[j], distance);
        }
      }
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  start() {
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  destroy() {
    this.stop();
    window.removeEventListener('resize', () => this.resize());
  }
}

// Svelte action for easy integration
export function particles(node, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'absolute inset-0 w-full h-full pointer-events-none';
  node.appendChild(canvas);
  
  const system = new ParticleSystem(canvas, options);
  system.start();
  
  return {
    destroy() {
      system.destroy();
      canvas.remove();
    }
  };
}