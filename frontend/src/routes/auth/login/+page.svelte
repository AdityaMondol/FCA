<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { goto } from '$app/navigation';
  
  let form = {
    email: '',
    password: ''
  };
  
  let loading = false;
  let error = '';

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        goto('/');
      } else {
        error = data.message || $_('auth.loginError');
      }
    } catch (err) {
      error = $_('auth.loginError');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{$_('auth.login')} - {$_('home.title')}</title>
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
  <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl text-center">{$_('auth.login')}</CardTitle>
        <CardDescription class="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">{$_('auth.email')}</label>
            <Input id="email" type="email" bind:value={form.email} required />
          </div>
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">{$_('auth.password')}</label>
            <Input id="password" type="password" bind:value={form.password} required />
          </div>
          
          {#if error}
            <div class="text-sm text-destructive">{error}</div>
          {/if}
          
          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? 'Signing In...' : $_('auth.loginButton')}
          </Button>
        </form>
        
        <div class="mt-4 text-center text-sm">
          <span class="text-muted-foreground">{$_('auth.noAccount')}</span>
          <a href="/auth/register" class="text-primary hover:underline ml-1">{$_('auth.register')}</a>
        </div>
      </CardContent>
    </Card>
  </div>
</div>