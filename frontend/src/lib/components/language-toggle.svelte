<script lang="ts">
  import { currentLocale, setLocale, type Locale } from '$lib/stores/locale';
  import { Button } from '$lib/components/ui/button';
  import { Languages } from 'lucide-svelte';

  let locale: Locale;
  
  $: locale = $currentLocale;

  function toggleLanguage() {
    const newLocale = locale === 'en' ? 'bn' : 'en';
    setLocale(newLocale);
  }

  function getLanguageLabel(currentLocale: Locale) {
    return currentLocale === 'en' ? 'বাং' : 'Eng';
  }

  $: languageLabel = getLanguageLabel(locale);
</script>

<Button
  variant="ghost"
  size="sm"
  on:click={toggleLanguage}
  title="Toggle language ({locale === 'en' ? 'Switch to Bangla' : 'Switch to English'})"
  class="h-9 px-3 font-medium"
>
  <Languages class="h-4 w-4 mr-1" />
  {languageLabel}
</Button>