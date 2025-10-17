<script lang="ts">
  import { theme, setTheme, getEffectiveTheme, type Theme } from '$lib/stores/theme';
  import { Button } from '$lib/components/ui/button';
  import { Sun, Moon, Monitor } from 'lucide-svelte';

  let currentTheme: Theme;
  
  $: currentTheme = $theme;
  $: effectiveTheme = getEffectiveTheme(currentTheme);

  function toggleTheme() {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }

  function getThemeIcon(theme: Theme, effectiveTheme: 'light' | 'dark') {
    switch (theme) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return effectiveTheme === 'dark' ? Moon : Sun;
    }
  }

  function getThemeLabel(theme: Theme) {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Theme';
    }
  }

  $: ThemeIcon = getThemeIcon(currentTheme, effectiveTheme);
  $: themeLabel = getThemeLabel(currentTheme);
</script>

<Button
  variant="ghost"
  size="icon"
  on:click={toggleTheme}
  title="Toggle theme ({themeLabel})"
  class="h-9 w-9"
>
  <svelte:component this={ThemeIcon} class="h-4 w-4" />
  <span class="sr-only">Toggle theme</span>
</Button>