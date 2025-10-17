<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from '$lib/i18n';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Image, Video, Calendar } from 'lucide-svelte';
  import { formatDate } from '$lib/utils';

  let media = [];
  let loading = true;
  let error = '';
  let selectedMedia = null;
  let showLightbox = false;

  onMount(async () => {
    try {
      const response = await fetch('/api/media');
      if (response.ok) {
        media = await response.json();
      } else {
        error = 'Failed to load media';
      }
    } catch (err) {
      error = 'Failed to load media';
    } finally {
      loading = false;
    }
  });

  function openLightbox(item) {
    selectedMedia = item;
    showLightbox = true;
  }

  function closeLightbox() {
    showLightbox = false;
    selectedMedia = null;
  }

  function isImage(fileType) {
    return fileType.startsWith('image/');
  }

  function isVideo(fileType) {
    return fileType.startsWith('video/');
  }
</script>

<svelte:head>
  <title>{$_('media.title')} - {$_('home.title')}</title>
</svelte:head>

<div class="container py-8">
  <div class="text-center space-y-4 mb-12">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
      {$_('media.title')}
    </h1>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      {$_('media.subtitle')}
    </p>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-destructive">{error}</p>
      <Button variant="outline" on:click={() => window.location.reload()} class="mt-4">
        {$_('common.retry')}
      </Button>
    </div>
  {:else if media.length === 0}
    <div class="text-center py-12">
      <Image class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">{$_('media.noMedia')}</p>
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each media as item}
        <Card class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" on:click={() => openLightbox(item)}>
          <div class="aspect-square bg-muted relative overflow-hidden">
            {#if isImage(item.fileType)}
              <img 
                src={item.filePath} 
                alt={item.title}
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div class="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <Image class="h-4 w-4 text-white" />
              </div>
            {:else if isVideo(item.fileType)}
              <div class="w-full h-full bg-muted flex items-center justify-center">
                <Video class="h-12 w-12 text-muted-foreground" />
              </div>
              <div class="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <Video class="h-4 w-4 text-white" />
              </div>
            {:else}
              <div class="w-full h-full bg-muted flex items-center justify-center">
                <Image class="h-12 w-12 text-muted-foreground" />
              </div>
            {/if}
          </div>
          <CardContent class="p-4">
            <h3 class="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
            {#if item.description}
              <p class="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
            {/if}
            <div class="flex items-center text-xs text-muted-foreground">
              <Calendar class="h-3 w-3 mr-1" />
              {formatDate(item.createdAt)}
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Lightbox Modal -->
{#if showLightbox && selectedMedia}
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" on:click={closeLightbox}>
    <div class="max-w-4xl max-h-full bg-background rounded-lg overflow-hidden" on:click|stopPropagation>
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{selectedMedia.title}</h3>
            {#if selectedMedia.description}
              <p class="text-sm text-muted-foreground">{selectedMedia.description}</p>
            {/if}
          </div>
          <Button variant="ghost" size="sm" on:click={closeLightbox}>
            ✕
          </Button>
        </div>
      </div>
      <div class="p-4">
        {#if isImage(selectedMedia.fileType)}
          <img 
            src={selectedMedia.filePath} 
            alt={selectedMedia.title}
            class="max-w-full max-h-[70vh] mx-auto"
          />
        {:else if isVideo(selectedMedia.fileType)}
          <video 
            src={selectedMedia.filePath}
            controls
            class="max-w-full max-h-[70vh] mx-auto"
          >
            Your browser does not support the video tag.
          </video>
        {/if}
      </div>
    </div>
  </div>
{/if}