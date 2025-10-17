<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle, Home } from 'lucide-svelte';

  $: status = $page.status;
  $: message = $page.error?.message;
</script>

<svelte:head>
  <title>Error {status} - {$_('home.title')}</title>
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
  <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] text-center">
    <div class="flex flex-col space-y-2">
      <AlertTriangle class="h-16 w-16 mx-auto text-destructive" />
      <h1 class="text-4xl font-bold">{status}</h1>
      <h2 class="text-xl font-semibold">
        {#if status === 404}
          Page Not Found
        {:else if status === 500}
          Internal Server Error
        {:else}
          Something went wrong
        {/if}
      </h2>
      <p class="text-muted-foreground">
        {#if message}
          {message}
        {:else if status === 404}
          The page you're looking for doesn't exist.
        {:else if status === 500}
          We're experiencing some technical difficulties.
        {:else}
          An unexpected error occurred.
        {/if}
      </p>
    </div>
    
    <div class="flex flex-col space-y-2">
      <Button href="/" class="w-full">
        <Home class="h-4 w-4 mr-2" />
        Go Home
      </Button>
      <Button variant="outline" on:click={() => window.history.back()} class="w-full">
        Go Back
      </Button>
    </div>
  </div>
</div>