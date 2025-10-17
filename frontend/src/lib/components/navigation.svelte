<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from '$lib/i18n';
  import { Button } from '$lib/components/ui/button';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import LanguageToggle from '$lib/components/language-toggle.svelte';
  import { Menu, X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let mobileMenuOpen = false;

  const navItems = [
    { href: '/', key: 'home' },
    { href: '/teachers', key: 'teachers' },
    { href: '/facilities', key: 'facilities' },
    { href: '/notices', key: 'notices' },
    { href: '/media', key: 'media' },
    { href: '/contact', key: 'contact' }
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        mobileMenuOpen = false;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container flex h-16 items-center">
    <div class="mr-4 hidden md:flex">
      <a class="mr-6 flex items-center space-x-2" href="/">
        <span class="hidden font-bold sm:inline-block">{$_('home.title')}</span>
      </a>
      <nav class="flex items-center space-x-6 text-sm font-medium">
        {#each navItems as item}
          <a
            href={item.href}
            class="transition-colors hover:text-foreground/80 {$page.url.pathname === item.href ? 'text-foreground' : 'text-foreground/60'}"
          >
            {$_(`navigation.${item.key}`)}
          </a>
        {/each}
      </nav>
    </div>
    
    <Button variant="ghost" class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden" on:click={toggleMobileMenu}>
      <Menu class="h-6 w-6" />
      <span class="sr-only">Toggle Menu</span>
    </Button>
    
    <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      <div class="w-full flex-1 md:w-auto md:flex-none">
        <a class="flex items-center space-x-2 md:hidden" href="/">
          <span class="font-bold">{$_('home.title')}</span>
        </a>
      </div>
      <nav class="flex items-center space-x-2">
        <LanguageToggle />
        <ThemeToggle />
        <Button variant="ghost" size="sm" href="/auth/login">
          {$_('navigation.login')}
        </Button>
      </nav>
    </div>
  </div>
  
  {#if mobileMenuOpen}
    <div class="border-t md:hidden">
      <nav class="flex flex-col space-y-3 p-4">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-sm font-medium transition-colors hover:text-foreground/80 {$page.url.pathname === item.href ? 'text-foreground' : 'text-foreground/60'}"
            on:click={closeMobileMenu}
          >
            {$_(`navigation.${item.key}`)}
          </a>
        {/each}
      </nav>
    </div>
  {/if}
</nav>