// 3D Effects and Parallax Library
export class ParallaxController {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      intensity: options.intensity || 20,
      reverse: options.reverse || false,
      ...options
    };
    
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.init();
  }
  
  init() {
    this.element.style.transition = 'transform 0.3s ease-out';
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  
  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;
    
    const rotateX = deltaY * this.options.intensity * (this.options.reverse ? -1 : 1);
    const rotateY = deltaX * this.options.intensity * (this.options.reverse ? 1 : -1);
    
    this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
  
  destroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    this.element.style.transform = '';
  }
}

// Tilt effect for cards
export class TiltEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxTilt: options.maxTilt || 15,
      perspective: options.perspective || 1000,
      scale: options.scale || 1.05,
      speed: options.speed || 300,
      glare: options.glare !== false,
      ...options
    };
    
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    
    this.init();
  }
  
  init() {
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.transition = `transform ${this.options.speed}ms ease-out`;
    
    if (this.options.glare) {
      this.glareElement = document.createElement('div');
      this.glareElement.className = 'tilt-glare';
      this.glareElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%);
        opacity: 0;
        pointer-events: none;
        transition: opacity ${this.options.speed}ms ease-out;
        border-radius: inherit;
      `;
      this.element.appendChild(this.glareElement);
    }
    
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
  }
  
  handleMouseEnter() {
    this.element.style.transition = 'none';
  }
  
  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    
    const tiltX = percentY * this.options.maxTilt;
    const tiltY = -percentX * this.options.maxTilt;
    
    this.element.style.transform = `
      perspective(${this.options.perspective}px) 
      rotateX(${tiltX}deg) 
      rotateY(${tiltY}deg) 
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
    
    if (this.glareElement) {
      const glareX = (percentX + 1) * 50;
      const glareY = (percentY + 1) * 50;
      this.glareElement.style.background = `
        radial-gradient(circle at ${glareX}% ${glareY}%, 
        rgba(255,255,255,0.3) 0%, 
        rgba(255,255,255,0) 80%)
      `;
      this.glareElement.style.opacity = '1';
    }
  }
  
  handleMouseLeave() {
    this.element.style.transition = `transform ${this.options.speed}ms ease-out`;
    this.element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    if (this.glareElement) {
      this.glareElement.style.opacity = '0';
    }
  }
  
  destroy() {
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    
    if (this.glareElement) {
      this.glareElement.remove();
    }
  }
}

// Magnetic button effect
export class MagneticEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      strength: options.strength || 0.3,
      radius: options.radius || 100,
      ...options
    };
    
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    
    this.init();
  }
  
  init() {
    this.element.style.transition = 'transform 0.3s ease-out';
    document.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
  }
  
  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.options.radius) {
      const force = (this.options.radius - distance) / this.options.radius;
      const moveX = deltaX * force * this.options.strength;
      const moveY = deltaY * force * this.options.strength;
      
      this.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    } else {
      this.element.style.transform = 'translate(0, 0)';
    }
  }
  
  handleMouseLeave() {
    this.element.style.transform = 'translate(0, 0)';
  }
  
  destroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.style.transform = '';
  }
}

// Svelte actions for easy integration
export function parallax(node, options = {}) {
  const controller = new ParallaxController(node, options);
  
  return {
    destroy() {
      controller.destroy();
    }
  };
}

export function tilt(node, options = {}) {
  const effect = new TiltEffect(node, options);
  
  return {
    update(newOptions) {
      effect.destroy();
      Object.assign(effect.options, newOptions);
      effect.init();
    },
    destroy() {
      effect.destroy();
    }
  };
}

export function magnetic(node, options = {}) {
  const effect = new MagneticEffect(node, options);
  
  return {
    destroy() {
      effect.destroy();
    }
  };
}