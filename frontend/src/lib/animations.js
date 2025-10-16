// Advanced Animation Library for Futuristic UI
import { gsap } from 'gsap';

// Animation presets
export const animations = {
  // Entrance animations
  fadeInUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  },
  
  fadeInDown: {
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  },
  
  slideInLeft: {
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
  },
  
  slideInRight: {
    from: { opacity: 0, x: 50 },
    to: { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
  },
  
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
  },
  
  // Hover animations
  hover: {
    scale: { scale: 1.05, duration: 0.3, ease: "power2.out" },
    lift: { y: -5, duration: 0.3, ease: "power2.out" },
    glow: { boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)", duration: 0.3 }
  },
  
  // Loading animations
  pulse: {
    scale: [1, 1.1, 1],
    duration: 1.5,
    repeat: -1,
    ease: "power2.inOut"
  },
  
  spin: {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: "none"
  },
  
  // Page transitions
  pageTransition: {
    enter: { opacity: 0, y: 20 },
    enterActive: { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    leave: { opacity: 1, y: 0 },
    leaveActive: { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }
  }
};

// Animation utilities
export class AnimationController {
  constructor() {
    this.timeline = gsap.timeline();
  }
  
  // Animate element with preset
  animate(element, preset, options = {}) {
    const animation = animations[preset];
    if (!animation) return;
    
    return gsap.fromTo(element, animation.from, { ...animation.to, ...options });
  }
  
  // Stagger animation for multiple elements
  staggerIn(elements, preset, stagger = 0.1) {
    const animation = animations[preset];
    if (!animation) return;
    
    return gsap.fromTo(elements, animation.from, {
      ...animation.to,
      stagger: stagger
    });
  }
  
  // Hover effect
  addHoverEffect(element, type = 'scale') {
    const hoverAnimation = animations.hover[type];
    if (!hoverAnimation) return;
    
    element.addEventListener('mouseenter', () => {
      gsap.to(element, hoverAnimation);
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, { 
        scale: 1, 
        y: 0, 
        boxShadow: "none", 
        duration: 0.3 
      });
    });
  }
  
  // Scroll-triggered animations
  scrollTrigger(element, animation, options = {}) {
    return gsap.fromTo(element, animation.from, {
      ...animation.to,
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options
      }
    });
  }
  
  // Particle system animation
  createParticles(container, count = 50) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-primary-400 rounded-full opacity-60';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      container.appendChild(particle);
      particles.push(particle);
      
      // Animate particle
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: Math.random() * 0.8,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    return particles;
  }
  
  // Typing animation
  typeWriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return timer;
  }
  
  // Morphing shapes
  morphShape(element, paths, duration = 2) {
    return gsap.to(element, {
      morphSVG: paths,
      duration: duration,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });
  }
  
  // Glitch effect
  glitchEffect(element, duration = 0.5) {
    const tl = gsap.timeline({ repeat: 2 });
    
    tl.to(element, {
      skewX: 10,
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(element, {
      skewX: -10,
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(element, {
      skewX: 0,
      duration: 0.1,
      ease: "power2.inOut"
    });
    
    return tl;
  }
  
  // Matrix rain effect
  matrixRain(container) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    const columns = Math.floor(container.offsetWidth / 20);
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.className = 'absolute inset-0 pointer-events-none';
    container.appendChild(canvas);
    
    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#6366F1';
      ctx.font = '15px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);
        
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }
}

// Intersection Observer for scroll animations
export class ScrollAnimator {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const animation = element.dataset.animation;
            const delay = parseFloat(element.dataset.delay) || 0;
            
            setTimeout(() => {
              this.animateElement(element, animation);
            }, delay * 1000);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
  }
  
  observe(element, animation = 'fadeInUp', delay = 0) {
    element.dataset.animation = animation;
    element.dataset.delay = delay;
    this.observer.observe(element);
  }
  
  animateElement(element, animation) {
    const preset = animations[animation];
    if (preset) {
      gsap.fromTo(element, preset.from, preset.to);
    }
  }
  
  disconnect() {
    this.observer.disconnect();
  }
}

// Export singleton instances
export const animationController = new AnimationController();
export const scrollAnimator = new ScrollAnimator();