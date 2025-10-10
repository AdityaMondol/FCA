<script>
  import { Link } from 'svelte-routing';
  import { currentLanguage, translations } from '../stores/languageStore';
  
  let t;
  $: t = translations[$currentLanguage];
</script>

<!-- Hero Section -->
<section class="gradient-bg text-white py-16 md:py-24">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto text-center animate-fade-in">
      <div class="inline-block px-4 py-1.5 bg-secondary text-white rounded-full font-medium text-sm mb-4 animate-pulse">
        {t.admissionOpen}
      </div>
      <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        {t.heroTitle}
      </h1>
      <p class="text-lg md:text-xl mb-3 text-gray-100">
        {t.heroSubtitle}
      </p>
      <p class="text-base mb-6 text-gray-200">
        {t.heroDescription}
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/contact" class="btn-secondary">
          {t.enrollNow}
        </Link>
        <Link to="/about" class="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 shadow-md text-sm">
          {t.learnMore}
        </Link>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="py-12 bg-white dark:bg-gray-800">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="text-center animate-fade-in">
        <div class="text-3xl font-bold text-primary mb-1">100%</div>
        <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">{t.successRate}</div>
      </div>
      <div class="text-center animate-fade-in">
        <div class="text-3xl font-bold text-primary mb-1">18+</div>
        <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">{t.studentsAdmitted}</div>
      </div>
      <div class="text-center animate-fade-in">
        <div class="text-3xl font-bold text-primary mb-1">3+</div>
        <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">{t.yearsExperience}</div>
      </div>
      <div class="text-center animate-fade-in">
        <div class="text-3xl font-bold text-primary mb-1">10+</div>
        <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">{t.qualifiedTeachers}</div>
      </div>
    </div>
  </div>
</section>

<!-- Achievement Section -->
<section class="py-12 bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      <div class="card text-center">
        <div class="inline-block p-3 bg-primary rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t.achievement2023}
        </h2>
        <p class="text-base text-gray-600 dark:text-gray-300">
          {t.achievement2023Text}
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Subjects Section -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <h2 class="section-title">{t.subjects}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
      <div class="card text-center group">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.bengali}</h3>
      </div>
      <div class="card text-center group">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.english}</h3>
      </div>
      <div class="card text-center group">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.mathematics}</h3>
      </div>
      <div class="card text-center group">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{t.generalKnowledge}</h3>
      </div>
    </div>
  </div>
</section>

<!-- Class Schedule Section -->
<section class="py-12 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4">
    <h2 class="section-title">{t.classSchedule}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
      <div class="card text-center">
        <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dayCoaching}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">{t.dayCoachingDesc}</p>
      </div>
      <div class="card text-center">
        <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.nightCoaching}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">{t.nightCoachingDesc}</p>
      </div>
      <div class="card text-center">
        <div class="w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.residential}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">{t.residentialDesc}</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-12 gradient-bg text-white">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-2xl md:text-3xl font-bold mb-4">{t.joinUs}</h2>
    <p class="text-base mb-6 max-w-2xl mx-auto">{t.startJourney}</p>
    <Link to="/contact" class="btn-secondary inline-block">
      {t.enrollNow}
    </Link>
  </div>
</section>
