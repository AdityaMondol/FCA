<script lang="ts">
  import { _ } from '$lib/i18n';
  import { Phone, Mail, MapPin } from 'lucide-svelte';
</script>

<footer class="border-t bg-background">
  <div class="container py-8 md:py-12">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">{$_('home.title')}</h3>
        <p class="text-sm text-muted-foreground">
          {$_('footer.description')}
        </p>
      </div>
      
      <div class="space-y-3">
        <h4 class="text-sm font-semibold">{$_('footer.quickLinks')}</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="text-muted-foreground hover:text-foreground">{$_('navigation.home')}</a></li>
          <li><a href="/teachers" class="text-muted-foreground hover:text-foreground">{$_('navigation.teachers')}</a></li>
          <li><a href="/facilities" class="text-muted-foreground hover:text-foreground">{$_('navigation.facilities')}</a></li>
          <li><a href="/notices" class="text-muted-foreground hover:text-foreground">{$_('navigation.notices')}</a></li>
        </ul>
      </div>
      
      <div class="space-y-3">
        <h4 class="text-sm font-semibold">{$_('footer.contact')}</h4>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-center space-x-2">
            <MapPin class="h-4 w-4" />
            <span>Mymensingh Road, Palashatoli, Tangail</span>
          </li>
          <li class="flex items-center space-x-2">
            <Phone class="h-4 w-4" />
            <span>0196-333337</span>
          </li>
          <li class="flex items-center space-x-2">
            <Mail class="h-4 w-4" />
            <span>info@faridcadetacademy.com</span>
          </li>
        </ul>
      </div>
      
      <div class="space-y-3">
        <h4 class="text-sm font-semibold">{$_('programs.cadetPrep')}</h4>
        <p class="text-sm text-muted-foreground">
          {$_('home.motto')}
        </p>
      </div>
    </div>
    
    <div class="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
      <p>{$_('footer.copyright')}</p>
    </div>
  </div>
</footer>