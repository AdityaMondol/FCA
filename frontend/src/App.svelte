<script>
  import { Router, Route } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { supabase, initAuth } from './stores/authStore';
  import { darkMode } from './stores/themeStore';
  import Navbar from './components/Navbar.svelte';
  import Footer from './components/Footer.svelte';
  import NotificationToast from './components/NotificationToast.svelte';
  import Home from './pages/Home.svelte';
  import About from './pages/About.svelte';
  import Facilities from './pages/Facilities.svelte';
  import Teachers from './pages/Teachers.svelte';
  import Media from './pages/Media.svelte';
  import Notices from './pages/Notices.svelte';
  import Contact from './pages/Contact.svelte';
  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import RegistrationSuccess from './pages/RegistrationSuccess.svelte';
  import ForgotPassword from './pages/ForgotPassword.svelte';
  import ResetPassword from './pages/ResetPassword.svelte';
  import Admin from './pages/Admin.svelte';
  import Dashboard from './pages/Dashboard.svelte';

  export let url = "";
  
  let isLoading = true;

  // Handle auth callback from email verification
  onMount(async () => {
    try {
      // Initialize auth state
      await initAuth();
      
      // Check if this is an auth callback (email verification redirect)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('✅ Email verification/password reset successful! Setting up session...');
        
        // Set the session from URL hash
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('✅ Session established! User logged in.');
          // Clean up URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      isLoading = false;
    }
  });
  
  // Apply dark mode class to document
  $: {
    if (typeof document !== 'undefined') {
      if ($darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
</script>

<Router {url}>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Navbar />

    <main class="flex-grow">
      {#if isLoading}
        <div class="flex items-center justify-center min-h-[60vh]">
          <div class="text-center">
            <div class="relative inline-block">
              <div class="w-16 h-16 rounded-full border-4 border-gray-300/20 absolute inset-0" />
              <div class="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-transparent blur-xl" />
            </div>
            <p class="mt-4 text-gray-600 dark:text-gray-400 font-medium animate-pulse">Loading...</p>
          </div>
        </div>
      {:else}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/media" component={Media} />
        <Route path="/notices" component={Notices} />
        <Route path="/contact" component={Contact} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/registration-success" component={RegistrationSuccess} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/admin" component={Admin} />
        <Route path="/dashboard" component={Dashboard} />
      {/if}
    </main>

    <Footer />
    
    <!-- Global Notification System -->
    <NotificationToast />
  </div>
</Router>