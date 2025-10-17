<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Phone, Mail, MapPin, Clock } from 'lucide-svelte';
  
  let form = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  let loading = false;
  let success = '';
  let error = '';

  async function handleSubmit() {
    loading = true;
    error = '';
    success = '';

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        success = data.message || $_('contact.success');
        form = { name: '', email: '', phone: '', subject: '', message: '' };
      } else {
        error = data.message || $_('contact.error');
      }
    } catch (err) {
      error = $_('contact.error');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{$_('contact.title')} - {$_('home.title')}</title>
</svelte:head>

<div class="container py-8">
  <div class="text-center space-y-4 mb-12">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
      {$_('contact.title')}
    </h1>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      {$_('contact.subtitle')}
    </p>
  </div>

  <div class="grid gap-8 lg:grid-cols-2">
    <!-- Contact Form -->
    <Card>
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium">{$_('contact.name')}</label>
            <Input id="name" bind:value={form.name} required />
          </div>
          
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">{$_('contact.email')}</label>
            <Input id="email" type="email" bind:value={form.email} required />
          </div>
          
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium">{$_('contact.phone')}</label>
            <Input id="phone" bind:value={form.phone} placeholder="01712345678" />
          </div>
          
          <div class="space-y-2">
            <label for="subject" class="text-sm font-medium">{$_('contact.subject')}</label>
            <Input id="subject" bind:value={form.subject} required />
          </div>
          
          <div class="space-y-2">
            <label for="message" class="text-sm font-medium">{$_('contact.message')}</label>
            <textarea 
              id="message" 
              bind:value={form.message}
              rows="4"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            ></textarea>
          </div>
          
          {#if error}
            <div class="text-sm text-destructive">{error}</div>
          {/if}
          
          {#if success}
            <div class="text-sm text-green-600">{success}</div>
          {/if}
          
          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? $_('contact.sending') : $_('contact.send')}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Contact Information -->
    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{$_('contact.info')}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-start space-x-3">
            <MapPin class="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 class="font-medium">{$_('contact.address')}</h4>
              <p class="text-sm text-muted-foreground">
                Mymensingh Road, Palashatoli, Tangail<br>
                Dhaka Division, Bangladesh
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <Phone class="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 class="font-medium">{$_('contact.phoneNumbers')}</h4>
              <div class="text-sm text-muted-foreground space-y-1">
                <p>0196-333337</p>
                <p>01724-264777</p>
                <p>0198-005332</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <Mail class="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 class="font-medium">{$_('contact.emailAddress')}</h4>
              <p class="text-sm text-muted-foreground">info@faridcadetacademy.com</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <Clock class="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 class="font-medium">Office Hours</h4>
              <div class="text-sm text-muted-foreground">
                <p>Saturday - Thursday: 8:00 AM - 6:00 PM</p>
                <p>Friday: Closed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Academy Info -->
      <Card>
        <CardHeader>
          <CardTitle>About {$_('home.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">
            {$_('home.welcomeDescription')}
          </p>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium">Established:</span>
              <span>2020</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-medium">Motto:</span>
              <span>{$_('home.motto')}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-medium">Focus:</span>
              <span>Cadet College Preparation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div></script>