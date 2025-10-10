<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { auth } from '../stores/authStore';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { API_URL } from '../config';
  
  let t;
  $: t = translations[$currentLanguage];
  let authState;
  auth.subscribe(value => authState = value);
  
  let notices = [];
  let isLoading = true;
  
  onMount(async () => {
    // Check if user is logged in
    if (!authState.isAuthenticated) {
      isLoading = false;
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notices`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
      if (response.ok) {
        notices = await response.json();
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
    isLoading = false;
  });

  function handleLoginClick() {
    navigate('/login');
  }
  
  function getPriorityColor(priority) {
    switch(priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 border-red-500';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      default: return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
    }
  }
  
  function getPriorityBadge(priority) {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.noticesTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.noticesDescription}</p>
  </div>
</section>

<!-- Notices List -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto space-y-4">
      {#if !authState.isAuthenticated}
        <!-- Login Required Message -->
        <div class="card text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$currentLanguage === 'en' ? 'Login Required' : 'লগইন প্রয়োজন'}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6 text-base">
            {$currentLanguage === 'en' 
              ? 'Please login to view notices and important announcements' 
              : 'নোটিশ এবং গুরুত্বপূর্ণ ঘোষণা দেখতে অনুগ্রহ করে লগইন করুন'}
          </p>
          <button on:click={handleLoginClick} class="btn-primary">
            {$currentLanguage === 'en' ? 'Login Now' : 'এখন লগইন করুন'}
          </button>
        </div>
      {:else}
        {#each notices as notice (notice.id)}
        <div class="card border-l-4 {getPriorityColor(notice.priority)} animate-fade-in">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <span class="px-3 py-1 {getPriorityBadge(notice.priority)} text-white text-xs font-bold rounded-full mr-3">
                  {notice.priority === 'high' ? ($currentLanguage === 'en' ? 'URGENT' : 'জরুরি') : 
                   notice.priority === 'medium' ? ($currentLanguage === 'en' ? 'IMPORTANT' : 'গুরুত্বপূর্ণ') : 
                   ($currentLanguage === 'en' ? 'INFO' : 'তথ্য')}
                </span>
                <span class="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {notice.date}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {$currentLanguage === 'en' ? notice.title_en : notice.title_bn}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {$currentLanguage === 'en' ? notice.content_en : notice.content_bn}
              </p>
            </div>
          </div>
        </div>
        {/each}
        
        {#if notices.length === 0 && !isLoading}
          <div class="card text-center py-12">
            <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 text-base">
              {$currentLanguage === 'en' ? 'No notices available at the moment' : 'এই মুহূর্তে কোন নোটিশ উপলব্ধ নেই'}
            </p>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</section>

<!-- Subscription Section -->
<section class="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto card text-center">
      <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {$currentLanguage === 'en' ? 'Stay Updated' : 'আপডেট থাকুন'}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6 text-sm">
        {$currentLanguage === 'en' 
          ? 'Visit regularly for latest notices and announcements' 
          : 'সর্বশেষ নোটিশ এবং ঘোষণার জন্য নিয়মিত ভিজিট করুন'}
      </p>
    </div>
  </div>
</section>
