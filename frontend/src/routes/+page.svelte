<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { BookOpen, Users, Award, Target } from 'lucide-svelte';
</script>

<svelte:head>
  <title>{$_('home.title')}</title>
  <meta name="description" content="{$_('home.subtitle')}" />
</svelte:head>

<!-- Hero Section -->
<section class="relative py-20 lg:py-32">
  <div class="container px-4 md:px-6">
    <div class="flex flex-col items-center space-y-4 text-center">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
          {$_('home.title')}
        </h1>
        <p class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          {$_('home.subtitle')}
        </p>
        <p class="text-lg font-semibold text-primary">
          {$_('home.motto')}
        </p>
      </div>
      <div class="space-x-4">
        <Button href="/auth/register" size="lg">
          {$_('home.getStarted')}
        </Button>
        <Button variant="outline" href="/about" size="lg">
          {$_('home.learnMore')}
        </Button>
      </div>
    </div>
  </div>
</section>

<!-- Welcome Section -->
<section class="py-12 bg-muted/50">
  <div class="container px-4 md:px-6">
    <div class="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
      <div class="space-y-4">
        <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl">
          {$_('home.welcomeTitle')}
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          {$_('home.welcomeDescription')}
        </p>
        <div class="bg-primary/10 p-4 rounded-lg">
          <p class="font-semibold text-primary">
            {$_('home.admissionOpen')}
          </p>
        </div>
      </div>
      <div class="flex justify-center">
        <div class="w-full max-w-md bg-background rounded-lg shadow-lg p-6">
          <div class="text-center space-y-2">
            <BookOpen class="h-12 w-12 mx-auto text-primary" />
            <h3 class="text-xl font-semibold">Academic Excellence</h3>
            <p class="text-sm text-muted-foreground">Proven track record since 2020</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Programs Section -->
<section class="py-12">
  <div class="container px-4 md:px-6">
    <div class="text-center space-y-4 mb-12">
      <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl">
        {$_('home.ourPrograms')}
      </h2>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <Target class="h-8 w-8 text-primary" />
          <CardTitle>{$_('programs.cadetPrep')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('programs.cadetPrepDesc')}</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Award class="h-8 w-8 text-primary" />
          <CardTitle>{$_('programs.scholarship')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('programs.scholarshipDesc')}</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <BookOpen class="h-8 w-8 text-primary" />
          <CardTitle>{$_('programs.academic')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('programs.academicDesc')}</CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

<!-- Services Section -->
<section class="py-12 bg-muted/50">
  <div class="container px-4 md:px-6">
    <div class="text-center space-y-4 mb-12">
      <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl">
        Service Types
      </h2>
    </div>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">{$_('services.residential')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.residentialDesc')}</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">{$_('services.nonResidential')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.nonResidentialDesc')}</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">{$_('services.dayCare')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.dayCareDesc')}</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">{$_('services.nightCare')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.nightCareDesc')}</CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

<!-- Achievements Section -->
<section class="py-12">
  <div class="container px-4 md:px-6">
    <div class="text-center space-y-4 mb-12">
      <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl">
        {$_('home.ourAchievements')}
      </h2>
    </div>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl text-primary">14/18</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Scholarship recipients in Tangail District exam</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl text-primary">1st</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Position in Delduar Upazila scholarship exam</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl text-primary">9+</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Students admitted to Cadet Colleges (2021-2022)</CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
</section>