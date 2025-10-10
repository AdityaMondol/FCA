<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let countdown = 10;
  
  onMount(() => {
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        navigate('/login');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  });
</script>

<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">
      {$currentLanguage === 'en' ? 'Registration Successful!' : 'নিবন্ধন সফল!'}
    </h1>
  </div>
</section>

<section class="relative py-12 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 min-h-screen overflow-hidden">
  <div class="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30">
    <div class="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-3xl"></div>
  </div>
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <div class="card backdrop-blur-sm bg-white/90 dark:bg-gray-800/80 ring-1 ring-gray-200 dark:ring-gray-700 shadow-xl transition-all duration-300 text-center">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$currentLanguage === 'en' ? 'Thank You for Registering!' : 'নিবন্ধনের জন্য ধন্যবাদ!'}
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {$currentLanguage === 'en' 
              ? 'A verification email has been sent to your email address. Please check your inbox and click the verification link to complete your registration.' 
              : 'আপনার ইমেইল ঠিকানায় একটি যাচাইকরণ ইমেইল পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন এবং নিবন্ধন সম্পূর্ণ করতে যাচাইকরণ লিঙ্কে ক্লিক করুন।'}
          </p>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-700 dark:text-blue-300">
            {$currentLanguage === 'en' 
              ? 'Didn\'t receive the email? Check your spam/junk folder or contact support.' 
              : 'ইমেইল পাননি? আপনার স্প্যাম/জাঙ্ক ফোল্ডার চেক করুন বা সাপোর্টের সাথে যোগাযোগ করুন।'}
          </p>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-600 dark:text-gray-300 mb-2">
            {$currentLanguage === 'en' 
              ? 'You will be redirected to the login page in' 
              : 'আপনি লগইন পৃষ্ঠায় পুনঃনির্দেশিত হবেন'}
          </p>
          <div class="text-2xl font-bold text-primary">{countdown}</div>
          <p class="text-gray-600 dark:text-gray-300">
            {$currentLanguage === 'en' ? 'seconds' : 'সেকেন্ডের মধ্যে'}
          </p>
        </div>
        
        <button 
          on:click={() => navigate('/login')}
          class="btn-primary w-full"
        >
          {$currentLanguage === 'en' ? 'Go to Login Now' : 'এখন লগইন করুন'}
        </button>
      </div>
    </div>
  </div>
</section>