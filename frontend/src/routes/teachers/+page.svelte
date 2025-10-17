<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from '$lib/i18n';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { User, BookOpen } from 'lucide-svelte';

  let teachers = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const response = await fetch('/api/teachers');
      if (response.ok) {
        teachers = await response.json();
      } else {
        error = 'Failed to load teachers';
      }
    } catch (err) {
      error = 'Failed to load teachers';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{$_('teachers.title')} - {$_('home.title')}</title>
</svelte:head>

<div class="container py-8">
  <div class="text-center space-y-4 mb-12">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
      {$_('teachers.title')}
    </h1>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      {$_('teachers.subtitle')}
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
  {:else if teachers.length === 0}
    <div class="text-center py-12">
      <User class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">{$_('teachers.noTeachers')}</p>
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each teachers as teacher}
        <Card>
          <CardHeader>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User class="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle class="text-lg">
                  {teacher.profile.firstName} {teacher.profile.lastName}
                </CardTitle>
                <CardDescription>
                  {teacher.profile.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            {#if teacher.bio}
              <p class="text-sm text-muted-foreground">{teacher.bio}</p>
            {/if}
            
            {#if teacher.subjects && teacher.subjects.length > 0}
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <BookOpen class="h-4 w-4 text-primary" />
                  <span class="text-sm font-medium">{$_('teachers.subjects')}:</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  {#each teacher.subjects as subject}
                    <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      {subject}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if teacher.verificationDate}
              <p class="text-xs text-muted-foreground">
                Verified: {new Date(teacher.verificationDate).toLocaleDateString()}
              </p>
            {/if}
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>