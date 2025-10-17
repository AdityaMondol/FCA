<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { goto } from '$app/navigation';
  
  let form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    teacherCode: ''
  };
  
  let loading = false;
  let error = '';
  let success = '';

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        success = data.message || $_('auth.registerSuccess');
        setTimeout(() => goto('/auth/login'), 2000);
      } else {
        error = data.message || $_('auth.registerError');
      }
    } catch (err) {
      error = $_('auth.registerError');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{$_('auth.register')} - {$_('home.title')}</title>
</svelte:head>

<div class="container flex h-screen w-screen flex-col items-center justify-center">
  <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl text-center">{$_('auth.register')}</CardTitle>
        <CardDescription class="text-center">
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="firstName" class="text-sm font-medium">{$_('auth.firstName')}</label>
              <Input id="firstName" bind:value={form.firstName} required />
            </div>
            <div class="space-y-2">
              <label for="lastName" class="text-sm font-medium">{$_('auth.lastName')}</label>
              <Input id="lastName" bind:value={form.lastName} required />
            </div>
          </div>
          
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">{$_('auth.email')}</label>
            <Input id="email" type="email" bind:value={form.email} required />
          </div>
          
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium">{$_('auth.phone')}</label>
            <Input id="phone" bind:value={form.phone} placeholder="01712345678" />
          </div>
          
          <div class="space-y-2">
            <label for="role" class="text-sm font-medium">{$_('auth.role')}</label>
            <select id="role" bind:value={form.role} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="student">{$_('auth.student')}</option>
              <option value="guardian">{$_('auth.guardian')}</option>
              <option value="teacher">{$_('auth.teacher')}</option>
            </select>
          </div>
          
          {#if form.role === 'teacher'}
            <div class="space-y-2">
              <label for="teacherCode" class="text-sm font-medium">{$_('auth.teacherCode')}</label>
              <Input id="teacherCode" bind:value={form.teacherCode} required />
              <p class="text-xs text-muted-foreground">{$_('auth.teacherCodeHint')}</p>
            </div>
          {/if}
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">{$_('auth.password')}</label>
            <Input id="password" type="password" bind:value={form.password} required />
          </div>
          
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium">{$_('auth.confirmPassword')}</label>
            <Input id="confirmPassword" type="password" bind:value={form.confirmPassword} required />
          </div>
          
          {#if error}
            <div class="text-sm text-destructive">{error}</div>
          {/if}
          
          {#if success}
            <div class="text-sm text-green-600">{success}</div>
          {/if}
          
          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : $_('auth.registerButton')}
          </Button>
        </form>
        
        <div class="mt-4 text-center text-sm">
          <span class="text-muted-foreground">{$_('auth.hasAccount')}</span>
          <a href="/auth/login" class="text-primary hover:underline ml-1">{$_('auth.login')}</a>
        </div>
      </CardContent>
    </Card>
  </div>
</div>