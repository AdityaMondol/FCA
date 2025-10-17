<script lang="ts">
  import '../app.css';
  import ThemeProvider from '$lib/components/theme-provider.svelte';
  import Navigation from '$lib/components/navigation.svelte';
  import Footer from '$lib/components/footer.svelte';
  import '$lib/i18n';
  import { isLoading } from 'svelte-i18n';
</script>

<ThemeProvider>
  {#if $isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else}
    <div class="relative flex min-h-screen flex-col">
      <Navigation />
      <main class="flex-1">
        <slot />
      </main>
      <Footer />
    </div>
  {/if}
</ThemeProvider>