<script>
  import { onMount } from 'svelte';
  import { tilt } from '../lib/3d-effects';
  
  export let title = '';
  export let value = 0;
  export let icon = '';
  export let trend = null; // { value: 12, direction: 'up' | 'down' }
  export let color = 'primary'; // primary, secondary, success, danger, warning
  export let animated = true;
  
  // Type definitions for better TypeScript support
  /** @type {{ value: number, direction: 'up' | 'down' } | null} */
  let trendData = trend;
  
  let displayValue = 0;
  let mounted = false;
  
  const colors = {
    primary: {
      bg: 'from-primary-500 to-primary-600',
      text: 'text-primary-500',
      glow: 'shadow-primary-500/50'
    },
    secondary: {
      bg: 'from-secondary-500 to-secondary-600',
      text: 'text-secondary-500',
      glow: 'shadow-secondary-500/50'
    },
    success: {
      bg: 'from-success-500 to-success-600',
      text: 'text-success-500',
      glow: 'shadow-success-500/50'
    },
    danger: {
      bg: 'from-danger-500 to-danger-600',
      text: 'text-danger-500',
      glow: 'shadow-danger-500/50'
    },
    warning: {
      bg: 'from-warning-500 to-warning-600',
      text: 'text-warning-500',
      glow: 'shadow-warning-500/50'
    }
  };
  
  onMount(() => {
    mounted = true;
    
    if (animated) {
      animateValue();
    } else {
      displayValue = value;
    }
  });
  
  function animateValue() {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      current += increment;
      step++;
      
      if (step >= steps) {
        displayValue = value;
        clearInterval(timer);
      } else {
        displayValue = Math.floor(current);
      }
    }, duration / steps);
  }
  
  $: formattedValue = displayValue.toLocaleString();
</script>

<div 
  class="glass rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl
         transition-all duration-300 hover:scale-105 group"
  use:tilt={{ maxTilt: 5, glare: true }}
>
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
        {title}
      </p>
      
      <div class="flex items-baseline gap-2">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
          {formattedValue}
        </h3>
        
        {#if trendData}
          <span class="flex items-center text-sm font-medium
                       {trendData.direction === 'up' ? 'text-success-500' : 'text-danger-500'}">
            {#if trendData.direction === 'up'}
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            {:else}
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            {/if}
            {trendData.value}%
          </span>
        {/if}
      </div>
    </div>
    
    {#if icon}
      {@const colorConfig = colors[color] || colors.primary}
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br {colorConfig.bg} 
                  flex items-center justify-center shadow-lg {colorConfig.glow}
                  group-hover:scale-110 transition-transform duration-300">
        <div class="text-white">
          {@html icon}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Progress bar (optional) -->
  <slot name="progress" />
</div>

<style>
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  :global(.dark) .glass {
    background: rgba(0, 0, 0, 0.2);
  }
</style>
