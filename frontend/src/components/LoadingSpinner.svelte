<script>
  export let size = 'md'; // sm, md, lg, xl
  export let variant = 'primary'; // primary, secondary, white
  export let fullScreen = false;
  export let text = '';
  
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  const variants = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white'
  };
</script>

{#if fullScreen}
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
    <div class="text-center">
      <div class="relative inline-block">
        <!-- Outer ring -->
        <div class="{sizes[size]} rounded-full border-4 border-gray-300/20 absolute inset-0" />
        
        <!-- Spinning ring -->
        <div class="{sizes[size]} rounded-full border-4 {variants[variant]} border-t-transparent animate-spin" />
        
        <!-- Inner glow -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-transparent blur-xl" />
      </div>
      
      {#if text}
        <p class="mt-4 text-white font-medium animate-pulse">{text}</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="inline-flex flex-col items-center gap-2">
    <div class="relative inline-block">
      <!-- Outer ring -->
      <div class="{sizes[size]} rounded-full border-4 border-gray-300/20 absolute inset-0" />
      
      <!-- Spinning ring -->
      <div class="{sizes[size]} rounded-full border-4 {variants[variant]} border-t-transparent animate-spin" />
      
      <!-- Inner glow -->
      <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-transparent blur-xl" />
    </div>
    
    {#if text}
      <p class="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
    {/if}
  </div>
{/if}
