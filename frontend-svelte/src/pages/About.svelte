<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  
  let t;
  $: t = translations[$currentLanguage];
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.aboutTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.aboutDescription}</p>
  </div>
</section>

<!-- Mission and Vision -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <!-- Mission -->
      <div class="card">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.ourMission}</h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t.missionText}</p>
      </div>
      
      <!-- Vision -->
      <div class="card">
        <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.ourVision}</h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t.visionText}</p>
    </div>
  </div>
</section>

<!-- Key Information -->
<section class="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Location -->
      <div class="card">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.address}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">{t.addressText}</p>
      </div>
      
      <!-- Target Students -->
      <div class="card">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.targetStudents}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">{t.targetStudentsText}</p>
      </div>
      
      <!-- Admission Status -->
      <div class="card">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.admissionStatus}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 font-semibold text-primary">{t.admissionOngoing}</p>
      </div>
    </div>
  </div>
</section>

<!-- Academic Offerings -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <h2 class="section-title">{t.subjects}</h2>
    <p class="section-subtitle">{$currentLanguage === 'en' ? 'Comprehensive preparation for cadet college entrance examinations' : 'ক্যাডেট কলেজ প্রবেশ পরীক্ষার জন্য ব্যাপক প্রস্তুতি'}</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
      <div class="card text-center group hover:bg-primary hover:text-white transition-all duration-300">
        <div class="w-12 h-12 bg-primary group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
          <svg class="w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-base font-semibold mb-1">{t.bengali}</h3>
      </div>
      
      <div class="card text-center group hover:bg-primary hover:text-white transition-all duration-300">
        <div class="w-12 h-12 bg-primary group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
          <svg class="w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <h3 class="text-base font-semibold mb-1">{t.english}</h3>
      </div>
      
      <div class="card text-center group hover:bg-primary hover:text-white transition-all duration-300">
        <div class="w-12 h-12 bg-primary group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
          <svg class="w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold mb-1">{t.mathematics}</h3>
      </div>
      
      <div class="card text-center group hover:bg-primary hover:text-white transition-all duration-300">
        <div class="w-12 h-12 bg-primary group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
          <svg class="w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold mb-1">{t.generalKnowledge}</h3>
      </div>
    </div>
  </div>
</section>
