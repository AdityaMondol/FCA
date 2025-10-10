<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  
  let t;
  $: t = translations[$currentLanguage];
  
  const facilities = [
    {
      icon: 'sun',
      titleKey: 'dayCoaching',
      descKey: 'dayCoachingDesc'
    },
    {
      icon: 'moon',
      titleKey: 'nightCoaching',
      descKey: 'nightCoachingDesc'
    },
    {
      icon: 'home',
      titleKey: 'residential',
      descKey: 'residentialDesc'
    },
    {
      icon: 'classroom',
      titleKey: 'modernClassrooms',
      descKey: 'modernClassroomsDesc'
    },
    {
      icon: 'library',
      titleKey: 'library',
      descKey: 'libraryDesc'
    },
    {
      icon: 'lab',
      titleKey: 'labFacilities',
      descKey: 'labFacilitiesDesc'
    }
  ];
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.facilitiesTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.facilitiesDescription}</p>
  </div>
</section>

<!-- Facilities Grid -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      <!-- Day Coaching -->
      <div class="card group hover:shadow-2xl">
        <div class="w-14 h-14 gradient-bg rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dayCoaching}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.dayCoachingDesc}</p>
      </div>
      
      <!-- Night Coaching -->
      <div class="card group hover:shadow-2xl">
        <div class="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.nightCoaching}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.nightCoachingDesc}</p>
      </div>
      
      <!-- Residential -->
      <div class="card group hover:shadow-2xl">
        <div class="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.residential}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.residentialDesc}</p>
      </div>
      
      <!-- Modern Classrooms -->
      <div class="card group hover:shadow-2xl">
        <div class="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.modernClassrooms}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.modernClassroomsDesc}</p>
      </div>
      
      <!-- Library -->
      <div class="card group hover:shadow-2xl">
        <div class="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.library}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.libraryDesc}</p>
      </div>
      
      <!-- Lab Facilities -->
      <div class="card group hover:shadow-2xl">
        <div class="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.labFacilities}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t.labFacilitiesDesc}</p>
      </div>
    </div>
  </div>
</section>

<!-- Feature Highlights -->
<section class="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <div class="card">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {$currentLanguage === 'en' ? 'Why Choose Our Facilities?' : 'কেন আমাদের সুবিধা বেছে নেবেন?'}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-1">
                {$currentLanguage === 'en' ? 'Experienced Faculty' : 'অভিজ্ঞ শিক্ষকবৃন্দ'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Learn from qualified and experienced teachers' : 'যোগ্য এবং অভিজ্ঞ শিক্ষকদের কাছ থেকে শিখুন'}
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-1">
                {$currentLanguage === 'en' ? 'Small Batch Sizes' : 'ছোট ব্যাচ সাইজ'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Personal attention for every student' : 'প্রতিটি শিক্ষার্থীর জন্য ব্যক্তিগত মনোযোগ'}
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-1">
                {$currentLanguage === 'en' ? 'Study Materials' : 'অধ্যয়ন সামগ্রী'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Comprehensive study materials and practice tests' : 'ব্যাপক অধ্যয়ন সামগ্রী এবং অনুশীলন পরীক্ষা'}
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 dark:text-white mb-1">
                {$currentLanguage === 'en' ? 'Regular Assessments' : 'নিয়মিত মূল্যায়ন'}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Track progress with regular tests and evaluations' : 'নিয়মিত পরীক্ষা এবং মূল্যায়নের মাধ্যমে অগ্রগতি ট্র্যাক করুন'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
