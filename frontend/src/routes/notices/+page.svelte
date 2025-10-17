<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from '$lib/i18n';
  import { currentLocale } from '$lib/stores/locale';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Bell, Calendar } from 'lucide-svelte';
  import { formatDate, formatDateBangla, truncateText } from '$lib/utils';

  let notices = [];
  let loading = true;
  let error = '';
  let locale;

  $: locale = $currentLocale;

  onMount(async () => {
    await loadNotices();
  });

  async function loadNotices() {
    try {
      const response = await fetch(`/api/notices?language=${locale}`);
      if (response.ok) {
        notices = await response.json();
      } else {
        error = 'Failed to load notices';
      }
    } catch (err) {
      error = 'Failed to load notices';
    } finally {
      loading = false;
    }
  }

  // Reload notices when language changes
  $: if (locale) {
    loadNotices();
  }

  function formatNoticeDate(dateString) {
    return locale === 'bn' ? formatDateBangla(dateString) : formatDate(dateString);
  }
</script>

<svelte:head>
  <title>{$_('notices.title')} - {$_('home.title')}</title>
</svelte:head>

<div class="container py-8">
  <div class="text-center space-y-4 mb-12">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
      {$_('notices.title')}
    </h1>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      {$_('notices.subtitle')}
    </p>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-destructive">{error}</p>
      <Button variant="outline" on:click={loadNotices} class="mt-4">
        {$_('common.retry')}
      </Button>
    </div>
  {:else if notices.length === 0}
    <div class="text-center py-12">
      <Bell class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">{$_('notices.noNotices')}</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each notices as notice}
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <CardTitle class="text-xl">{notice.title}</CardTitle>
                <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar class="h-4 w-4" />
                  <span>{$_('notices.publishedOn')} {formatNoticeDate(notice.createdAt)}</span>
                  {#if notice.author}
                    <span>• by {notice.author.firstName} {notice.author.lastName}</span>
                  {/if}
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  {notice.language === 'bn' ? 'বাংলা' : 'English'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="prose prose-sm max-w-none dark:prose-invert">
              {#if notice.body.length > 300}
                <p>{truncateText(notice.body, 300)}</p>
                <Button variant="link" class="p-0 h-auto text-primary" href="/notices/{notice.id}">
                  {$_('notices.readMore')}
                </Button>
              {:else}
                <p>{notice.body}</p>
              {/if}
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>