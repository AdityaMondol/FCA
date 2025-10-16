<script>
  import { createEventDispatcher } from 'svelte';
  
  export let variant = 'primary'; // primary, secondary, success, danger, ghost
  export let size = 'md'; // sm, md, lg, xl
  export let loading = false;
  export let disabled = false;
  export let icon = null;
  export let iconPosition = 'left'; // left, right
  export let fullWidth = false;
  export let glow = false;
  export let className = '';
  
  const dispatch = createEventDispatcher();
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-primary-500/50',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 text-white shadow-lg hover:shadow-secondary-500/50',
    success: 'bg-gradient-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white shadow-lg hover:shadow-success-500/50',
    danger: 'bg-gradient-to-r from-danger-600 to-danger-500 hover:from-danger-700 hover:to-danger-600 text-white shadow-lg hover:shadow-danger-500/50',
    ghost: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  function handleClick(event) {
    if (!disabled && !loading) {
      dispatch('click', event);
    }
  }
</script>

<button
  on:click={handleClick}
  disabled={disabled || loading}
  class="relative overflow-hidden rounded-xl font-semibold transition-all duration-300 
         transform hover:scale-105 active:scale-95 
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
         {variants[variant]} 
         {sizes[size]} 
         {fullWidth ? 'w-full' : ''}
         {glow ? 'animate-glow' : ''}
         {className}"
>
  <!-- Shimmer effect -->
  <span class="absolute inset-0 overflow-hidden">
    <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                 transform -translate-x-full animate-shimmer" />
  </span>
  
  <!-- Content -->
  <span class="relative flex items-center justify-center gap-2">
    {#if loading}
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else if icon && iconPosition === 'left'}
      <span class="w-5 h-5">{@html icon}</span>
    {/if}
    
    <slot />
    
    {#if icon && iconPosition === 'right' && !loading}
      <span class="w-5 h-5">{@html icon}</span>
    {/if}
  </span>
</button>

<style>
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
</style>
