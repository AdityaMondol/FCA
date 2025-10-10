<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { supabase } from '../stores/authStore';
  import { navigate } from 'svelte-routing';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let email = '';
  let error = '';
  let success = '';
  let isLoading = false;
  
  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    isLoading = true;
    
    if (!email) {
      error = $currentLanguage === 'en' 
        ? 'Please enter your email address' 
        : 'আপনার ইমেইল ঠিকানা লিখুন';
      isLoading = false;
      return;
    }
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (resetError) {
        error = resetError.message || ($currentLanguage === 'en' 
          ? 'Failed to send reset email. Please try again.' 
          : 'রিসেট ইমেইল পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      } else {
        success = $currentLanguage === 'en' 
          ? 'Password reset email sent! Please check your inbox.' 
          : 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।';
      }
    } catch (err) {
      error = $currentLanguage === 'en' 
        ? 'An error occurred. Please try again.' 
        : 'একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।';
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">
      {$currentLanguage === 'en' ? 'Forgot Password' : 'পাসওয়ার্ড ভুলে গেছেন'}
    </h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">
      {$currentLanguage === 'en' 
        ? 'Reset your password' 
        : 'আপনার পাসওয়ার্ড রিসেট করুন'}
    </p>
  </div>
</section>

<section class="relative py-12 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 min-h-screen overflow-hidden">
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$currentLanguage === 'en' ? 'Reset Password' : 'পাসওয়ার্ড রিসেট করুন'}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            {$currentLanguage === 'en' 
              ? 'Enter your email address and we will send you a link to reset your password.' 
              : 'আপনার ইমেইল ঠিকানা লিখুন এবং আমরা আপনার পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাব।'}
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
        
        {#if success}
          <div class="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
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
              {$currentLanguage === 'en' ? 'Sending...' : 'পাঠানো হচ্ছে...'}
            {:else}
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {$currentLanguage === 'en' ? 'Send Reset Link' : 'রিসেট লিঙ্ক পাঠান'}
            {/if}
          </button>
        </form>
        
        <div class="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <a href="/login" class="text-primary hover:text-primary-700 font-semibold">
              {$currentLanguage === 'en' ? 'Back to Login' : 'লগইনে ফিরে যান'}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>