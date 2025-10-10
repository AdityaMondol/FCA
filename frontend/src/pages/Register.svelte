<script>
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { currentLanguage, translations } from '../stores/languageStore';
  import { auth, register } from '../stores/authStore';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let authState;
  auth.subscribe(value => {
    authState = value;
  });
  
  let email = '';
  let password = '';
  let confirmPassword = '';
  let name = '';
  let phone = '';
  let role = 'student';
  let teacherCode = '';
  let error = '';
  let success = '';
  let isLoading = false;
  
  // onMount(() => {
  //   // Check if user is logged in and is admin
  //   if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
  //     navigate('/login');
  //   }
  // });
  
  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    isLoading = true;
    
    if (!email || !password || !confirmPassword || !name) {
      error = $currentLanguage === 'en' 
        ? 'Please fill in all required fields' 
        : 'সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন';
      isLoading = false;
      return;
    }

    if (role === 'teacher' && !teacherCode) {
      error = $currentLanguage === 'en' 
        ? 'Teacher verification code is required to register as teacher' 
        : 'শিক্ষক হিসেবে নিবন্ধনের জন্য যাচাই কোড প্রয়োজন';
      isLoading = false;
      return;
    }
    
    if (password !== confirmPassword) {
      error = $currentLanguage === 'en' 
        ? 'Passwords do not match' 
        : 'পাসওয়ার্ড মিলছে না';
      isLoading = false;
      return;
    }
    
    if (password.length < 6) {
      error = $currentLanguage === 'en' 
        ? 'Password must be at least 6 characters' 
        : 'পাসওয়ার্ড অন্তত ৬টি অক্ষর হতে হবে';
      isLoading = false;
      return;
    }

    // Verify teacher code if registering as teacher
    if (role === 'teacher' && teacherCode !== 'FCA2025') {
      error = $currentLanguage === 'en' 
        ? 'Invalid teacher verification code' 
        : 'অবৈধ শিক্ষক যাচাই কোড';
      isLoading = false;
      return;
    }
    
    const result = await register(email, password, name, role, phone, teacherCode);
    isLoading = false;
    
    if (result.success) {
      if (result.emailSent) {
        success = $currentLanguage === 'en' 
          ? '✅ Registration successful! Please check your email to verify your account before logging in.' 
          : '✅ নিবন্ধন সফল! লগইন করার আগে আপনার ইমেল যাচাই করুন।';
      } else {
        success = $currentLanguage === 'en' 
          ? 'User registered successfully!' 
          : 'ব্যবহারকারী সফলভাবে নিবন্ধিত হয়েছে!';
      }
      
      // Clear form
      email = '';
      password = '';
      confirmPassword = '';
      name = '';
      phone = '';
      role = 'student';
      teacherCode = '';
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } else {
      error = result.error || ($currentLanguage === 'en' 
        ? 'Registration failed. Please try again.' 
        : 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">
      {$currentLanguage === 'en' ? 'Register New User' : 'নতুন ব্যবহারকারী নিবন্ধন'}
    </h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">
      {$currentLanguage === 'en' 
        ? 'Create a new user account' 
        : 'নতুন ব্যবহারকারী অ্যাকাউন্ট তৈরি করুন'}
    </p>
  </div>
</section>

<!-- Registration Form -->
<section class="py-12 bg-white dark:bg-gray-900 min-h-screen">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <div class="card">
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
        
        <form on:submit={handleSubmit} class="space-y-6">
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
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
