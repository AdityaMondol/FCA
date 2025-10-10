<script>
  import { navigate } from 'svelte-routing';
  import { currentLanguage, translations } from '../stores/languageStore';
  import { login } from '../stores/authStore';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;
  
  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    isLoading = true;
    
    if (!email || !password) {
      error = $currentLanguage === 'en' 
        ? 'Please fill in all fields' 
        : 'সমস্ত ক্ষেত্র পূরণ করুন';
      isLoading = false;
      return;
    }
    
    try {
      // Add timeout to prevent infinite spinning
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 15000)
      );
      
      const result = await Promise.race([loginPromise, timeoutPromise]);
      
      if (result.success) {
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        error = result.error || ($currentLanguage === 'en' 
          ? 'Login failed. Please check your credentials.' 
          : 'লগইন ব্যর্থ হয়েছে। আপনার তথ্য চেক করুন।');
      }
    } catch (err) {
      error = err.message === 'Login timeout' 
        ? ($currentLanguage === 'en' 
          ? 'Login is taking too long. Please check your internet connection.' 
          : 'লগইন খুব বেশি সময় নিচ্ছে। আপনার ইন্টারনেট সংযোগ চেক করুন।')
        : ($currentLanguage === 'en' 
          ? 'An error occurred. Please try again.' 
          : 'একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">
      {$currentLanguage === 'en' ? 'Admin Login' : 'অ্যাডমিন লগইন'}
    </h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">
      {$currentLanguage === 'en' 
        ? 'Access the admin dashboard' 
        : 'অ্যাডমিন ড্যাশবোর্ড অ্যাক্সেস করুন'}
    </p>
  </div>
</section>

<!-- Login Form -->
<section class="py-12 bg-white dark:bg-gray-900 min-h-screen">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <div class="card">
        <div class="text-center mb-8">
          <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$currentLanguage === 'en' ? 'Welcome Back' : 'স্বাগতম'}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            {$currentLanguage === 'en' 
              ? 'Sign in to your account' 
              : 'আপনার অ্যাকাউন্টে সাইন ইন করুন'}
          </p>
        </div>
        
        {#if error}
          <div class="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        {/if}
        
        <form on:submit={handleSubmit} class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                bind:value={email}
                required
                disabled={isLoading}
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                placeholder={$currentLanguage === 'en' ? 'admin@faridcadetacademy.com' : 'admin@faridcadetacademy.com'}
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Password' : 'পাসওয়ার্ড'}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                bind:value={password}
                required
                disabled={isLoading}
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {$currentLanguage === 'en' ? 'Signing in...' : 'সাইন ইন হচ্ছে...'}
            {:else}
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {$currentLanguage === 'en' ? 'Sign In' : 'সাইন ইন'}
            {/if}
          </button>
        </form>
        
        <div class="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {$currentLanguage === 'en' ? "Don't have an account?" : 'কোন অ্যাকাউন্ট নেই?'}
            <a href="/register" class="text-primary hover:text-primary-700 font-semibold ml-1">
              {$currentLanguage === 'en' ? 'Register here' : 'এখানে নিবন্ধন করুন'}
            </a>
          </p>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <a href="/" class="text-primary hover:text-primary-700 font-semibold inline-flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {$currentLanguage === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}
        </a>
      </div>
    </div>
  </div>
</section>
