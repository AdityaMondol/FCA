<script>
  import { currentLanguage, translations } from '$stores/languageStore.js';
  
  let t;
  $: t = translations[$currentLanguage];
  
  const contactNumbers = [
    '01715-000090',
    '01928-268993',
    '01674-455000'
  ];
  
  // Social media links - replace with actual links
  const socialLinks = {
    facebook: 'https://www.facebook.com/profile.php?id=61550314245116',
    //twitter: 'https://twitter.com/faridcadetacademy',
    //instagram: 'https://www.instagram.com/faridcadetacademy'
  };
</script>

<footer class="gradient-bg text-white py-8 mt-auto">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- About Section -->
      <div class="animate-fade-in">
        <h3 class="text-lg font-semibold mb-3 text-white">{t.footerTitle}</h3>
        <p class="text-sm text-gray-200 mb-3">{t.footerDescription}</p>
        <div class="flex space-x-4">
          <!-- Social Media Icons (placeholders) -->
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
          </a>
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div class="animate-fade-in">
        <h3 class="text-lg font-semibold mb-3 text-white">{t.quickLinks}</h3>
        <ul class="space-y-2">
          <li><a href="/" class="text-gray-200 hover:text-white transition duration-300 flex items-center text-sm"><span class="mr-2 text-secondary">→</span>{t.home}</a></li>
          <li><a href="/about" class="text-gray-200 hover:text-white transition duration-300 flex items-center text-sm"><span class="mr-2 text-secondary">→</span>{t.about}</a></li>
          <li><a href="/facilities" class="text-gray-200 hover:text-white transition duration-300 flex items-center text-sm"><span class="mr-2 text-secondary">→</span>{t.facilities}</a></li>
          <li><a href="/teachers" class="text-gray-200 hover:text-white transition duration-300 flex items-center text-sm"><span class="mr-2 text-secondary">→</span>{t.teachers}</a></li>
          <li><a href="/contact" class="text-gray-200 hover:text-white transition duration-300 flex items-center text-sm"><span class="mr-2 text-secondary">→</span>{t.contact}</a></li>
        </ul>
      </div>
      
      <!-- Contact Info -->
      <div class="animate-fade-in">
        <h3 class="text-lg font-semibold mb-3 text-white">{t.contactInfo}</h3>
        <div class="space-y-3">
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-2 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-gray-200 text-sm">{t.addressText}</p>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-2 text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              {#each contactNumbers as number}
                <p class="text-gray-200 text-sm">{number}</p>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Copyright -->
    <div class="border-t border-white/20 pt-6 text-center">
      <p class="text-gray-200 text-sm">&copy; {t.copyright}</p>
    </div>
  </div>
</footer>