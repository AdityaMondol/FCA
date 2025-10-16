<script>
  import { onMount } from 'svelte';
  import { particles } from '../lib/particles';
  import { tilt } from '../lib/3d-effects';
  import AnimatedButton from './AnimatedButton.svelte';
  
  export let title = '';
  export let subtitle = '';
  export let ctaText = '';
  export let ctaLink = '';
  export let backgroundImage = '';
  
  let heroRef;
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<section 
  bind:this={heroRef}
  class="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
  use:particles={{ particleCount: 80, particleColor: '#6366F1', speed: 0.3 }}
>
  <!-- Animated Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
    {#if backgroundImage}
      <div 
        class="absolute inset-0 bg-cover bg-center opacity-20"
        style="background-image: url({backgroundImage})"
      />
    {/if}
    
    <!-- Cyber Grid -->
    <div class="absolute inset-0 bg-cyber-grid bg-grid opacity-30" />
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
  </div>
  
  <!-- Floating Shapes -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s" />
    <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-float" style="animation-delay: 4s" />
  </div>
  
  <!-- Content -->
  <div class="relative z-10 container mx-auto px-4 text-center">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Title with gradient -->
      {#if mounted}
        <h1 
          class="text-5xl md:text-7xl font-bold text-gradient-neon animate-fade-in-up"
          style="animation-delay: 0.1s"
        >
          {title}
        </h1>
      {/if}
      
      <!-- Subtitle -->
      {#if mounted && subtitle}
        <p 
          class="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto animate-fade-in-up"
          style="animation-delay: 0.3s"
        >
          {subtitle}
        </p>
      {/if}
      
      <!-- CTA Buttons -->
      {#if mounted && ctaText}
        <div 
          class="flex flex-wrap gap-4 justify-center animate-fade-in-up"
          style="animation-delay: 0.5s"
        >
          <a href={ctaLink}>
            <AnimatedButton variant="primary" size="lg" glow={true}>
              {ctaText}
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </AnimatedButton>
          </a>
          
          <slot name="secondary-cta" />
        </div>
      {/if}
      
      <!-- Stats or Features -->
      <slot name="stats" />
    </div>
  </div>
  
  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</section>

<style>
  .bg-cyber-grid {
    background-image: 
      linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
  }
  
  .text-gradient-neon {
    background: linear-gradient(45deg, #00D4FF, #B347FF, #FF47B3);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-xy 5s ease infinite;
  }
</style>
