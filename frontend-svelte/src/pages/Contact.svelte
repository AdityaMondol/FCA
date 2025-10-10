<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let formData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  
  let submitStatus = '';
  let isSubmitting = false;
  
  async function handleSubmit(e) {
    e.preventDefault();
    isSubmitting = true;
    submitStatus = '';
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        submitStatus = 'success';
        formData = { name: '', email: '', phone: '', message: '' };
      } else {
        submitStatus = 'error';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      submitStatus = 'error';
    } finally {
      isSubmitting = false;
    }
  }
  
  const contactNumbers = [
    '01715-000090',
    '01928-268993',
    '01674-455000'
  ];
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">{t.contactTitle}</h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">{t.contactDescription}</p>
  </div>
</section>

<!-- Contact Section -->
<section class="py-12 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Contact Information -->
      <div class="space-y-6">
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.address}</h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm">{t.addressText}</p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.phone}</h3>
              {#each contactNumbers as number}
                <p class="text-gray-600 dark:text-gray-300 mb-1 text-sm">
                  <a href="tel:{number}" class="hover:text-primary transition-colors">{number}</a>
                </p>
              {/each}
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {$currentLanguage === 'en' ? 'Office Hours' : 'অফিস সময়'}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Saturday - Thursday: 8:00 AM - 8:00 PM' : 'শনিবার - বৃহস্পতিবার: সকাল ৮টা - রাত ৮টা'}
              </p>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {$currentLanguage === 'en' ? 'Friday: Closed' : 'শুক্রবার: বন্ধ'}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Map Placeholder -->
        <div class="card p-0 overflow-hidden">
          <div class="w-full h-64 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <svg class="w-24 h-24 text-primary dark:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Contact Form -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.sendMessage}</h2>
        
        {#if submitStatus === 'success'}
          <div class="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
            {$currentLanguage === 'en' 
              ? 'Thank you! Your message has been sent successfully.' 
              : 'ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।'}
          </div>
        {/if}
        
        {#if submitStatus === 'error'}
          <div class="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {$currentLanguage === 'en' 
              ? 'Sorry, there was an error sending your message. Please try again.' 
              : 'দুঃখিত, আপনার বার্তা পাঠাতে একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।'}
          </div>
        {/if}
        
        <form on:submit={handleSubmit} class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.yourName}
            </label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder={t.yourName}
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.yourEmail}
            </label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder={t.yourEmail}
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.phone}
            </label>
            <input
              type="tel"
              id="phone"
              bind:value={formData.phone}
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder={t.phone}
            />
          </div>
          
          <div>
            <label for="message" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.yourMessage}
            </label>
            <textarea
              id="message"
              bind:value={formData.message}
              required
              rows="5"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
              placeholder={t.yourMessage}
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? ($currentLanguage === 'en' ? 'Sending...' : 'পাঠানো হচ্ছে...') 
              : t.submit}
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
