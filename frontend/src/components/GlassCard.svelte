<script>
  export let variant = 'default'; // default, primary, secondary, success, danger
  export let hover = true;
  export let glow = false;
  export let className = '';
  
  const variants = {
    default: 'bg-white/10 dark:bg-gray-800/10',
    primary: 'bg-primary-500/10 border-primary-500/30',
    secondary: 'bg-secondary-500/10 border-secondary-500/30',
    success: 'bg-success-500/10 border-success-500/30',
    danger: 'bg-danger-500/10 border-danger-500/30'
  };
</script>

<div 
  class="glass rounded-2xl p-6 backdrop-blur-xl border border-white/20 
         {variants[variant]} 
         {hover ? 'transition-all duration-300 hover:scale-105 hover:shadow-2xl' : ''} 
         {glow ? 'shadow-neon' : 'shadow-glass'}
         {className}"
>
  <slot />
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
