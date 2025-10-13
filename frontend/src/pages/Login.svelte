<script>
  import { navigate } from 'svelte-routing';
  import { currentLanguage, translations } from '../stores/languageStore';
  import { login } from '../stores/authStore';
  import { AppError, ERROR_CODES } from '../utils/error';
  
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
      // Add timeout to prevent infinite spinning (increased to 45s for slow connections/cold starts)
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new AppError('Login timeout', ERROR_CODES.TIMEOUT_ERROR)), 30000)
      );
      
      const result = await Promise.race([loginPromise, timeoutPromise]);
      
      if (result.success) {
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        // Enhanced error messages based on error type
        if (result.error.includes('Invalid login credentials')) {
          error = $currentLanguage === 'en' 
            ? 'Invalid email or password. Please check your credentials.' 
            : 'অবৈধ ইমেইল বা পাসওয়ার্ড। আপনার তথ্য চেক করুন।';
        } else if (result.error.includes('Email not confirmed')) {
          error = $currentLanguage === 'en' 
            ? 'Please verify your email address before logging in.' 
            : 'লগইন করার আগে আপনার ইমেইল ঠিকানা যাচাই করুন।';
        } else {
          error = result.error || ($currentLanguage === 'en' 
            ? 'Login failed. Please check your credentials.' 
            : 'লগইন ব্যর্থ হয়েছে। আপনার তথ্য চেক করুন।');
        }
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

<!-- Login Form -->
<section class="relative py-12 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 min-h-screen overflow-hidden">
  <!-- Decorative background shapes -->
  <div class="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30">
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-3xl"></div>
  </div>
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <div class="card backdrop-blur-sm bg-white/90 dark:bg-gray-800/80 ring-1 ring-gray-200 dark:ring-gray-700 shadow-xl transition-all duration-300">
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
        
        <form on:submit={handleSubmit} class="space-y-6 animate-fade-in">
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
                class="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
                placeholder={$currentLanguage === 'en' ? 'your@email.com' : 'আপনার@ইমেইল.com'}
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
                class="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {$currentLanguage === 'en' ? 'Remember me' : 'আমাকে মনে রাখুন'}
              </label>
            </div>
            
            <div class="text-sm">
              <a href="/forgot-password" class="font-medium text-primary hover:text-primary-700">
                {$currentLanguage === 'en' ? 'Forgot your password?' : 'পাসওয়ার্ড ভুলে গেছেন?'}
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
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
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {$currentLanguage === 'en' ? 'Or continue with' : 'অথবা চালিয়ে যান'}
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button type="button" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.089 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
            </div>
            <div>
              <button type="button" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
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