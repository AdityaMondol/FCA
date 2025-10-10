<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { supabase } from '../stores/authStore';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let newPassword = '';
  let confirmPassword = '';
  let error = '';
  let success = '';
  let isLoading = false;
  let isValidToken = false;
  
  onMount(async () => {
    // Check if we have a valid reset token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      console.log('✅ Valid password reset token found');
      isValidToken = true;
      
      // Set the session from URL hash
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.error('Error setting session:', sessionError);
        isValidToken = false;
        error = $currentLanguage === 'en' 
          ? 'Invalid or expired reset link. Please request a new one.' 
          : 'অবৈধ বা মেয়াদ উত্তীর্ণ রিসেট লিঙ্ক। নতুন একটি অনুরোধ করুন।';
      } else {
        console.log('✅ Session established for password reset');
        // Clean up URL hash
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      isValidToken = false;
      // Use a temporary variable to avoid the assignment error
      const errorMessage = $currentLanguage === 'en' 
        ? 'Invalid or expired reset link. Please request a new one.' 
        : 'অবৈধ বা মেয়াদ উত্তীর্ণ রিসেট লিঙ্ক। নতুন একটি অনুরোধ করুন।';
      error = errorMessage;
    }
  });
  
  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    isLoading = true;
    
    if (!newPassword || !confirmPassword) {
      error = $currentLanguage === 'en' 
        ? 'Please fill in all fields' 
        : 'সমস্ত ক্ষেত্র পূরণ করুন';
      isLoading = false;
      return;
    }
    
    if (newPassword !== confirmPassword) {
      error = $currentLanguage === 'en' 
        ? 'Passwords do not match' 
        : 'পাসওয়ার্ড মিলছে না';
      isLoading = false;
      return;
    }
    
    if (newPassword.length < 6) {
      error = $currentLanguage === 'en' 
        ? 'Password must be at least 6 characters' 
        : 'পাসওয়ার্ড অন্তত ৬টি অক্ষর হতে হবে';
      isLoading = false;
      return;
    }
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        error = updateError.message || ($currentLanguage === 'en' 
          ? 'Failed to update password. Please try again.' 
          : 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      } else {
        success = $currentLanguage === 'en' 
          ? 'Password updated successfully! You can now login with your new password.' 
          : 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! এখন আপনি নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারেন।';
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
      {$currentLanguage === 'en' ? 'Reset Password' : 'পাসওয়ার্ড রিসেট করুন'}
    </h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">
      {$currentLanguage === 'en' 
        ? 'Set a new password for your account' 
        : 'আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড সেট করুন'}
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
        {#if !isValidToken}
          <div class="text-center">
            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {$currentLanguage === 'en' ? 'Invalid Reset Link' : 'অবৈধ রিসেট লিঙ্ক'}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <a href="/forgot-password" class="btn-primary inline-block">
              {$currentLanguage === 'en' ? 'Request New Reset Link' : 'নতুন রিসেট লিঙ্ক অনুরোধ করুন'}
            </a>
          </div>
        {:else}
          <div class="text-center mb-8">
            <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {$currentLanguage === 'en' ? 'Set New Password' : 'নতুন পাসওয়ার্ড সেট করুন'}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              {$currentLanguage === 'en' 
                ? 'Please enter your new password below.' 
                : 'নিচে আপনার নতুন পাসওয়ার্ড লিখুন।'}
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
              <label for="newPassword" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {$currentLanguage === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="newPassword"
                  bind:value={newPassword}
                  required
                  disabled={isLoading}
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {$currentLanguage === 'en' ? 'Confirm New Password' : 'নতুন পাসওয়ার্ড নিশ্চিত করুন'}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  bind:value={confirmPassword}
                  required
                  disabled={isLoading}
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
                  placeholder="••••••••"
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
                {$currentLanguage === 'en' ? 'Updating...' : 'আপডেট হচ্ছে...'}
              {:else}
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {$currentLanguage === 'en' ? 'Update Password' : 'পাসওয়ার্ড আপডেট করুন'}
              {/if}
            </button>
          </form>
        {/if}
        
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