<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { onMount } from 'svelte';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let notices = [];
  
  onMount(async () => {
    try {
      const response = await fetch('/api/notices');
      if (response.ok) {
        notices = await response.json();
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      // Fallback to sample data
      notices = [
        {
          id: 1,
          title_en: 'Admission Open for 2024',
          title_bn: '২০২৪ এর জন্য ভর্তি খোলা',
          content_en: 'Admissions are now open for the upcoming academic session. Limited seats available.',
          content_bn: 'আগামী শিক্ষাবর্ষের জন্য ভর্তি এখন খোলা। সীমিত আসন উপলব্ধ।',
          date: '2024-01-15',
          priority: 'high'
        },
        {
          id: 2,
          title_en: 'Class Schedule Update',
          title_bn: 'ক্লাসের সময়সূচী আপডেট',
          content_en: 'New class timings will be effective from next week. Please check the notice board.',
          content_bn: 'নতুন ক্লাসের সময় আগামী সপ্তাহ থেকে কার্যকর হবে। অনুগ্রহ করে নোটিশ বোর্ড দেখুন।',
          date: '2024-01-10',
          priority: 'medium'
        },
        {
          id: 3,
          title_en: 'Upcoming Mock Test',
          title_bn: 'আসন্ন মডেল টেস্ট',
          content_en: 'A mock test will be conducted on January 25th. All students must participate.',
          content_bn: '২৫ জানুয়ারি একটি মডেল টেস্ট অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে অংশগ্রহণ করতে হবে।',
          date: '2024-01-08',
          priority: 'high'
        }
      ];
    }
  });
  
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
      
      {#if notices.length === 0}
        <div class="card text-center py-12">
          <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 text-base">
            {$currentLanguage === 'en' ? 'No notices available at the moment' : 'এই মুহূর্তে কোন নোটিশ উপলব্ধ নেই'}
          </p>
        </div>
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
