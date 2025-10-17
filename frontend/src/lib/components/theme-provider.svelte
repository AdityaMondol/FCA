<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, applyTheme } from '$lib/stores/theme';

  onMount(() => {
    // Apply theme on mount
    const unsubscribe = theme.subscribe(currentTheme => {
      applyTheme(currentTheme);
    });

    return unsubscribe;
  });
</script>

<slot />