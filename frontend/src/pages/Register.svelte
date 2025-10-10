<script>
  import { navigate } from 'svelte-routing';
  import { currentLanguage, translations } from '../stores/languageStore';
  import { register } from '../stores/authStore';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let phone = '';
  let role = 'student';
  let teacherCode = '';
  let error = '';
  let success = '';
  let isLoading = false;
  
  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    isLoading = true;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      error = $currentLanguage === 'en' 
        ? 'Please fill in all required fields' 
        : 'সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন';
      isLoading = false;
      return;
    }
    
    if (password !== confirmPassword) {
      error = $currentLanguage === 'en' 
        ? 'Passwords do not match' 
        : 'পাসওয়ার্ড মেলে না';
      isLoading = false;
      return;
    }
    
    if (password.length < 6) {
      error = $currentLanguage === 'en' 
        ? 'Password must be at least 6 characters long' 
        : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
      isLoading = false;
      return;
    }
    
    if (role === 'teacher' && !teacherCode) {
      error = $currentLanguage === 'en' 
        ? 'Teacher verification code is required' 
        : 'শিক্ষক যাচাই কোড প্রয়োজন';
      isLoading = false;
      return;
    }
    
    try {
      // Correct parameter order: email, password, name, role, phone, teacherCode
      const result = await register(email, password, name, role, phone, teacherCode);
      
      if (result.success) {
        // Show success message and redirect to success page
        success = $currentLanguage === 'en' 
          ? 'Registration successful! Please check your email for verification.' 
          : 'নিবন্ধন সফল হয়েছে! যাচাইয়ের জন্য আপনার ইমেইল চেক করুন।';
        setTimeout(() => {
          navigate('/registration-success');
        }, 2000);
      } else {
        error = result.error || ($currentLanguage === 'en' 
          ? 'Registration failed. Please try again.' 
          : 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      error = err.message || ($currentLanguage === 'en' 
        ? 'An error occurred during registration' 
        : 'নিবন্ধনের সময় একটি ত্রুটি ঘটেছে');
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- Registration Form -->
<section class="relative py-12 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 min-h-screen overflow-hidden">
  <!-- Decorative background shapes -->
  <div class="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30">
    <div class="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-3xl"></div>
  </div>
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <div class="card backdrop-blur-sm bg-white/90 dark:bg-gray-800/80 ring-1 ring-gray-200 dark:ring-gray-700 shadow-xl transition-all duration-300">
        <div class="text-center mb-8">
          <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$currentLanguage === 'en' ? 'Create User' : 'ব্যবহারকারী তৈরি করুন'}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            {$currentLanguage === 'en' 
              ? 'Register a new user account' 
              : 'নতুন ব্যবহারকারী অ্যাকাউন্ট নিবন্ধন করুন'}
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
            <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Full Name' : 'পূর্ণ নাম'}
            </label>
            <input
              type="text"
              id="name"
              bind:value={name}
              required
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
              placeholder={$currentLanguage === 'en' ? 'Enter your name' : 'নাম লিখুন'}
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
            </label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Password' : 'পাসওয়ার্ড'}
            </label>
            <input
              type="password"
              id="password"
              bind:value={password}
              required
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
            </label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Phone Number (Optional)' : 'ফোন নম্বর (ঐচ্ছিক)'}
            </label>
            <input
              type="tel"
              id="phone"
              bind:value={phone}
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
              placeholder={$currentLanguage === 'en' ? '+880 1XXXXXXXXX' : '+৮৮০ ১XXXXXXXXX'}
            />
          </div>

          <div>
            <label for="role" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Account Type' : 'অ্যাকাউন্টের ধরন'}
            </label>
            <select
              id="role"
              bind:value={role}
              disabled={isLoading}
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
            >
              <option value="student">{$currentLanguage === 'en' ? 'Student' : 'শিক্ষার্থী'}</option>
              <option value="guardian">{$currentLanguage === 'en' ? 'Guardian/Parent' : 'অভিভাবক'}</option>
              <option value="teacher">{$currentLanguage === 'en' ? 'Teacher (Requires Code)' : 'শিক্ষক (কোড প্রয়োজন)'}</option>
            </select>
          </div>

          {#if role === 'teacher'}
            <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
              <div class="mb-3">
                <label for="teacherCode" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Teacher Verification Code' : 'শিক্ষক যাচাই কোড'}
                </label>
                <input
                  type="text"
                  id="teacherCode"
                  bind:value={teacherCode}
                  required
                  disabled={isLoading}
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all disabled:opacity-50 shadow-sm"
                  placeholder={$currentLanguage === 'en' ? 'Enter teacher code' : 'শিক্ষক কোড লিখুন'}
                />
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {$currentLanguage === 'en' 
                  ? 'Contact the school administration to get your teacher verification code.' 
                  : 'আপনার শিক্ষক যাচাই কোড পেতে স্কুল প্রশাসনের সাথে যোগাযোগ করুন।'}
              </p>
            </div>
          {/if}
          
          <div class="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {$currentLanguage === 'en' 
                ? 'I agree to the Terms and Conditions' 
                : 'আমি শর্তাবলী মেনে নিচ্ছি'}
            </label>
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
              {$currentLanguage === 'en' ? 'Registering...' : 'নিবন্ধন হচ্ছে...'}
            {:else}
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {$currentLanguage === 'en' ? 'Register User' : 'ব্যবহারকারী নিবন্ধন করুন'}
            {/if}
          </button>
        </form>

        <div class="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {$currentLanguage === 'en' ? 'Already have an account?' : 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}
            <a href="/login" class="text-primary hover:text-primary-700 font-semibold ml-1">
              {$currentLanguage === 'en' ? 'Login here' : 'এখানে লগইন করুন'}
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