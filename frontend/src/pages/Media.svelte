<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { onMount } from 'svelte';
  import { API_URL } from '../config';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let mediaItems = [];
  let isLoading = true;
  
  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/api/media`);
      if (response.ok) {
        mediaItems = await response.json();
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }
    isLoading = false;
  });
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.mediaTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.mediaDescription}</p>
  </div>
</section>

<!-- Media Gallery -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    {#if mediaItems.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {#each mediaItems as item (item.id)}
          <div class="card group cursor-pointer overflow-hidden">
            {#if item.file_url}
              <div class="w-full h-64 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src={item.file_url} alt={item.title_en || item.title} class="w-full h-full object-cover" />
              </div>
            {:else}
              <div class="w-full h-64 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg class="w-24 h-24 text-primary dark:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {$currentLanguage === 'en' ? (item.title_en || item.title) : (item.title_bn || item.title)}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 flex items-center text-sm">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(item.created_at || item.date).toLocaleDateString()}
            </p>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="max-w-2xl mx-auto card text-center py-12">
        <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {$currentLanguage === 'en' ? 'No Media Available' : 'কোন মিডিয়া উপলব্ধ নেই'}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-base">
          {$currentLanguage === 'en' 
            ? 'Media content will be available once teachers upload photos and videos.' 
            : 'শিক্ষকরা ফটো এবং ভিডিও আপলোড করলে মিডিয়া কন্টেন্ট উপলব্ধ হবে।'}
        </p>
      </div>
    {/if}
  </div>
</section>

<!-- Upload Section (Admin) -->
<section class="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto card">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        {$currentLanguage === 'en' ? 'Stay Connected' : 'সংযুক্ত থাকুন'}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm">
        {$currentLanguage === 'en' 
          ? 'Follow us on social media for latest updates and photos' 
          : 'সর্বশেষ আপডেট এবং ফটোর জন্য সোশ্যাল মিডিয়ায় আমাদের অনুসরণ করুন'}
      </p>
      <div class="flex justify-center space-x-4">
        <button class="btn-primary">
          <svg class="w-6 h-6 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
        <button class="btn-secondary">
          <svg class="w-6 h-6 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
          </svg>
          Instagram
        </button>
      </div>
    </div>
  </div>
</section>
