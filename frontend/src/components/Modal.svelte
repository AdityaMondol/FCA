<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  export let isOpen = false;
  export let title = '';
  export let size = 'md'; // sm, md, lg, xl, full
  export let closeOnBackdrop = true;
  export let showClose = true;
  
  const dispatch = createEventDispatcher();
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  
  function close() {
    isOpen = false;
    dispatch('close');
  }
  
  function handleBackdropClick(e) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      close();
    }
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
    transition:fade={{ duration: 200 }}
    on:click={handleBackdropClick}
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
    
    <!-- Modal -->
    <div
      class="relative w-full {sizes[size]} glass rounded-2xl shadow-2xl 
             border border-white/20 overflow-hidden"
      transition:scale={{ duration: 300, easing: quintOut, start: 0.95 }}
    >
      <!-- Header -->
      {#if title || showClose}
        <div class="flex items-center justify-between p-6 border-b border-white/10">
          <h3 class="text-2xl font-bold text-white">{title}</h3>
          
          {#if showClose}
            <button
              on:click={close}
              class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg
                     hover:bg-white/10"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>
      
      <!-- Footer -->
      {#if $$slots.footer}
        <div class="p-6 border-t border-white/10 bg-white/5">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .glass {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
</style>
