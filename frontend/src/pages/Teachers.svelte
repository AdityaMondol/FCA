<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { onMount } from 'svelte';
  import { API_URL } from '../config';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let teachers = [];
  let isLoading = true;

  onMount(async () => {
    await loadTeachers();
  });

  async function loadTeachers() {
    try {
      const response = await fetch(`${API_URL}/api/teachers`);
      if (response.ok) {
        teachers = await response.json();
      } else {
        // Fallback to sample data if API fails
        teachers = [];
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      teachers = [];
    }
    isLoading = false;
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.teachersTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.teachersDescription}</p>
  </div>
</section>

<!-- Teachers Section -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-6xl mx-auto">
      
      {#if isLoading}
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-2 text-gray-600 dark:text-gray-300">
            {$currentLanguage === 'en' ? 'Loading teachers...' : 'শিক্ষকদের তথ্য লোড হচ্ছে...'}
          </span>
        </div>
      {:else if teachers.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {$currentLanguage === 'en' ? 'No Teachers Yet' : 'এখনো কোন শিক্ষক নেই'}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {$currentLanguage === 'en' 
              ? 'Teachers will appear here once they register and complete their profiles.' 
              : 'শিক্ষকরা নিবন্ধন করে তাদের প্রোফাইল সম্পূর্ণ করলে এখানে দেখা যাবে।'}
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each teachers as teacher (teacher.id)}
            <div class="card text-center group hover:shadow-xl transition-all duration-300">
              {#if teacher.profile_photo_url}
                <img 
                  src={teacher.profile_photo_url} 
                  alt={teacher.name}
                  class="w-20 h-20 rounded-full mx-auto mb-4 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              {:else}
                <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              {/if}
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {teacher.name}
              </h3>
              
              {#if teacher.subject_specialization}
                <p class="text-primary font-medium mb-2 text-sm">{teacher.subject_specialization}</p>
              {/if}
              
              {#if teacher.experience_years}
                <p class="text-gray-600 dark:text-gray-300 text-xs mb-2">
                  {$currentLanguage === 'en' 
                    ? `${teacher.experience_years} years of experience` 
                    : `${teacher.experience_years} বছরের অভিজ্ঞতা`}
                </p>
              {/if}
              
              {#if teacher.description}
                <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {teacher.description.length > 100 
                    ? teacher.description.substring(0, 100) + '...' 
                    : teacher.description}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Faculty Qualifications -->
<section class="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {$currentLanguage === 'en' ? 'Our Faculty Qualifications' : 'আমাদের শিক্ষকদের যোগ্যতা'}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {$currentLanguage === 'en' ? 'Highly Qualified' : 'উচ্চ যোগ্যতাসম্পন্ন'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 text-xs">
                {$currentLanguage === 'en' ? 'All teachers hold relevant degrees and certifications' : 'সকল শিক্ষক প্রাসঙ্গিক ডিগ্রি এবং সার্টিফিকেট ধারণ করেন'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-2">
                {$currentLanguage === 'en' ? 'Experienced Educators' : 'অভিজ্ঞ শিক্ষাবিদ'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300">
                {$currentLanguage === 'en' ? 'Years of experience in cadet college preparation' : 'ক্যাডেট কলেজ প্রস্তুতিতে বছরের অভিজ্ঞতা'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-2">
                {$currentLanguage === 'en' ? 'Passionate Teaching' : 'উৎসাহী শিক্ষণ'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300">
                {$currentLanguage === 'en' ? 'Dedicated to student success and development' : 'শিক্ষার্থীদের সাফল্য এবং উন্নয়নে নিবেদিত'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-2">
                {$currentLanguage === 'en' ? 'Continuous Training' : 'ক্রমাগত প্রশিক্ষণ'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300">
                {$currentLanguage === 'en' ? 'Regular updates on teaching methodologies' : 'শিক্ষণ পদ্ধতির নিয়মিত আপডেট'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
