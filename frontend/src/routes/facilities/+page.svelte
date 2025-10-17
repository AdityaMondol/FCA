<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Building, BookOpen, FlaskConical, Trophy, Users, Clock, Home, Moon } from 'lucide-svelte';
</script>

<svelte:head>
  <title>{$_('facilities.title')} - {$_('home.title')}</title>
</svelte:head>

<div class="container py-8">
  <div class="text-center space-y-4 mb-12">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
      {$_('facilities.title')}
    </h1>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      {$_('facilities.subtitle')}
    </p>
  </div>

  <!-- Academic Facilities -->
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">Academic Facilities</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <Building class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('facilities.classrooms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Well-ventilated and spacious classrooms equipped with modern teaching aids and comfortable seating arrangements for effective learning.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <BookOpen class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('facilities.library')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Comprehensive library with extensive collection of books, reference materials, and study resources for all academic levels.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <FlaskConical class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('facilities.labs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Modern science laboratories equipped with latest instruments and safety equipment for practical learning experiences.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Service Types -->
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">Service Types</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <Home class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('services.residential')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.residentialDesc')}</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Users class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('services.nonResidential')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.nonResidentialDesc')}</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Clock class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('services.dayCare')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.dayCareDesc')}</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Moon class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('services.nightCare')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{$_('services.nightCareDesc')}</CardDescription>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Additional Facilities -->
  <section class="mb-12">
    <h2 class="text-2xl font-bold mb-6">Additional Facilities</h2>
    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Trophy class="h-8 w-8 text-primary mb-2" />
          <CardTitle>{$_('facilities.sports')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Sports ground and recreational facilities to promote physical fitness and extracurricular activities among students.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Users class="h-8 w-8 text-primary mb-2" />
          <CardTitle>Common Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Comfortable common areas and study halls where students can collaborate, discuss, and engage in group study sessions.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Location & Contact -->
  <section class="bg-muted/50 rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">Location & Contact</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="font-semibold mb-2">Address</h3>
        <p class="text-muted-foreground">
          Mymensingh Road, Palashatoli, Tangail<br>
          Dhaka Division, Bangladesh
        </p>
      </div>
      <div>
        <h3 class="font-semibold mb-2">Contact Numbers</h3>
        <div class="space-y-1 text-muted-foreground">
          <p>0196-333337</p>
          <p>01724-264777</p>
          <p>0198-005332</p>
        </div>
      </div>
    </div>
  </section>
</div>