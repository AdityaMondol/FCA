<script>
  import { Link } from 'svelte-routing';
  import { currentLanguage, toggleLanguage, translations } from '../stores/languageStore';
  import { darkMode, toggleTheme } from '../stores/themeStore';
  import { auth, logout } from '../stores/authStore';
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let profileMenuOpen = false;
  let t;
  
  $: t = translations[$currentLanguage];
  
  function handleLogout() {
    logout();
  }
  
  function handleToggleLanguage() {
    toggleLanguage();
  }
  
  function handleToggleTheme() {
    toggleTheme();
  }
  
  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
  
  function toggleProfileMenu() {
    profileMenuOpen = !profileMenuOpen;
  }

  // Close profile menu when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.profile-menu')) {
      profileMenuOpen = false;
    }
  }

  onMount(() => {
    // Add click outside listener
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClickOutside);
      return () => {
        window.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<nav class="gradient-bg text-white shadow-2xl sticky top-0 z-50">
  <div class="container mx-auto px-4 py-4">
    <div class="flex justify-between items-center">
      <!-- Logo and Title -->
      <Link to="/" class="flex items-center space-x-2 group">
        <div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
          <span class="text-lg font-bold text-white">F</span>
        </div>
        <div>
          <span class="text-base md:text-lg font-semibold block">{t.navTitle}</span>
          <span class="text-xs text-gray-200 hidden md:block">{t.heroSubtitle}</span>
        </div>
      </Link>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex space-x-5 text-sm items-center">
        <Link to="/" class="hover:text-secondary transition duration-300 font-medium">{t.home}</Link>
        <Link to="/about" class="hover:text-secondary transition duration-300 font-medium">{t.about}</Link>
        <Link to="/facilities" class="hover:text-secondary transition duration-300 font-medium">{t.facilities}</Link>
        <Link to="/teachers" class="hover:text-secondary transition duration-300 font-medium">{t.teachers}</Link>
        <Link to="/media" class="hover:text-secondary transition duration-300 font-medium">{t.media}</Link>
        <Link to="/notices" class="hover:text-secondary transition duration-300 font-medium">{t.notices}</Link>
        <Link to="/contact" class="hover:text-secondary transition duration-300 font-medium">{t.contact}</Link>
        {#if $auth.isAuthenticated}
          {#if $auth.user?.role === 'teacher'}
            <Link to="/dashboard" class="hover:text-secondary transition duration-300 font-medium">{$currentLanguage === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</Link>
            <Link to="/admin" class="hover:text-secondary transition duration-300 font-medium">{$currentLanguage === 'en' ? 'Admin' : 'অ্যাডমিন'}</Link>
          {/if}
          
          <!-- User Profile Dropdown -->
          <div class="relative profile-menu">
            <button 
              on:click={toggleProfileMenu}
              class="flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="text-left hidden sm:block">
                <div class="text-sm font-medium text-white">{$auth.user?.name || 'User'}</div>
                <div class="text-xs text-gray-200 capitalize">{$auth.user?.role || 'Student'}</div>
              </div>
              <svg class="w-4 h-4 text-white transform transition-transform {profileMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Profile Dropdown Menu -->
            {#if profileMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div class="py-1">
                  <!-- User Info Header -->
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{$auth.user?.name || 'User'}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{$auth.user?.email || ''}</div>
                    <div class="text-xs text-primary font-medium capitalize mt-1">{$auth.user?.role || 'Student'}</div>
                  </div>

                  <!-- Dashboard - Available for ALL users -->
                  <Link 
                    to="/dashboard" 
                    on:click={toggleProfileMenu}
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {$currentLanguage === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট'}
                  </Link>

                  <!-- Teacher-only options -->
                  {#if $auth.user?.role === 'teacher'}
                    <Link 
                      to="/admin" 
                      on:click={toggleProfileMenu}
                      class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {$currentLanguage === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}
                    </Link>
                  {/if}

                  <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <!-- Logout -->
                  <button 
                    on:click={() => { handleLogout(); toggleProfileMenu(); }}
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {$currentLanguage === 'en' ? 'Logout' : 'লগআউট'}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <Link to="/login" class="hover:text-secondary transition duration-300 font-medium">{$currentLanguage === 'en' ? 'Login' : 'লগইন'}</Link>
          <Link to="/register" class="px-3 py-1.5 bg-secondary text-white rounded-md font-medium hover:bg-secondary-600 transition-all duration-300 shadow-sm">{$currentLanguage === 'en' ? 'Register' : 'রেজিস্টার'}</Link>
        {/if}
      </div>
      
      <!-- Controls -->
      <div class="flex items-center space-x-3">
        <!-- Language Toggle -->
        <button 
          on:click={handleToggleLanguage}
          class="px-3 py-1.5 text-sm bg-secondary text-white rounded-md font-medium hover:bg-secondary-600 transition-all duration-300 shadow-sm"
        >
          {$currentLanguage === 'en' ? 'বাংলা' : 'English'}
        </button>
        
        <!-- Theme Toggle -->
        <button 
          on:click={handleToggleTheme}
          class="p-2 rounded-md bg-secondary text-white hover:bg-secondary-600 transition-all duration-300 shadow-sm"
          aria-label="Toggle theme"
        >
          {#if $darkMode}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
        
        <!-- Mobile Menu Button -->
        <button 
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="lg:hidden p-2 rounded-md bg-secondary text-white hover:bg-secondary-600 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {#if mobileMenuOpen}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div class="lg:hidden mt-4 pb-4 space-y-2 animate-fade-in">
        <Link to="/" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.home}</Link>
        <Link to="/about" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.about}</Link>
        <Link to="/facilities" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.facilities}</Link>
        <Link to="/teachers" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.teachers}</Link>
        <Link to="/media" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.media}</Link>
        <Link to="/notices" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.notices}</Link>
        <Link to="/contact" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{t.contact}</Link>
        <div class="border-t border-white/20 my-2 pt-2">
          {#if $auth.isAuthenticated}
            <!-- User Info in Mobile -->
            <div class="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium text-white">{$auth.user?.name || 'User'}</div>
                <div class="text-xs text-gray-200">{$auth.user?.email || ''}</div>
                <div class="text-xs text-secondary-200 capitalize font-medium">{$auth.user?.role || 'Student'}</div>
              </div>
            </div>
            
            <!-- My Account - Available for ALL users -->
            <Link to="/dashboard" on:click={closeMobileMenu} class="flex items-center py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {$currentLanguage === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট'}
            </Link>
            
            <!-- Teacher-only options -->
            {#if $auth.user?.role === 'teacher'}
              <Link to="/admin" on:click={closeMobileMenu} class="flex items-center py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {$currentLanguage === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}
              </Link>
            {/if}
            
            <button on:click={() => { handleLogout(); closeMobileMenu(); }} class="flex items-center w-full py-2 px-4 text-red-300 hover:bg-red-500/20 rounded-lg transition duration-300">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {$currentLanguage === 'en' ? 'Logout' : 'লগআউট'}
            </button>
          {:else}
            <Link to="/login" on:click={closeMobileMenu} class="block py-2 px-4 hover:bg-primary-700 rounded-lg transition duration-300">{$currentLanguage === 'en' ? 'Login' : 'লগইন'}</Link>
            <Link to="/register" on:click={closeMobileMenu} class="block py-2 px-4 bg-secondary hover:bg-secondary-600 rounded-lg transition duration-300">{$currentLanguage === 'en' ? 'Register' : 'রেজিস্টার'}</Link>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</nav>
