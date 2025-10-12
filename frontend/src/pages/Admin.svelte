<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { currentLanguage, translations } from '../stores/languageStore';
  import { auth, logout } from '../stores/authStore';
  import { API_URL } from '../config';

  let t;
  $: t = translations[$currentLanguage];

  let authState;
  auth.subscribe(value => {
    authState = value;
  });

  let notices = [];
  let media = [];
  let contacts = [];
  let activeTab = 'notices';
  let isLoading = true;

  // Form states
  let noticeForm = {
    title_en: '',
    title_bn: '',
    content_en: '',
    content_bn: '',
    priority: 'medium'
  };

  let mediaForm = {
    title: '',
    description: '',
    file: null
  };

  onMount(async () => {
    // Check if user is logged in and is admin or teacher
    if (!authState.isAuthenticated || !['admin', 'teacher'].includes(authState.user?.role)) {
      navigate('/login');
      return;
    }

    await loadData();
    isLoading = false;
  });

  async function loadData() {
    try {
      const token = authState.session?.access_token;

      // Load notices (protected)
      const noticesResponse = await fetch(`${API_URL}/api/notices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (noticesResponse.ok) {
        notices = await noticesResponse.json();
      }

      // Load media (public)
      const mediaResponse = await fetch(`${API_URL}/api/media`);
      if (mediaResponse.ok) {
        media = await mediaResponse.json();
      }

      // Load contacts (admin only)
      const contactsResponse = await fetch(`${API_URL}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (contactsResponse.ok) {
        contacts = await contactsResponse.json();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function createNotice(e) {
    e.preventDefault();

    try {
      const token = authState.session?.access_token;
      const response = await fetch(`${API_URL}/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeForm)
      });

      if (response.ok) {
        noticeForm = { title_en: '', title_bn: '', content_en: '', content_bn: '', priority: 'medium' };
        await loadData();
      }
    } catch (error) {
      console.error('Error creating notice:', error);
    }
  }

  async function deleteNotice(id) {
    if (!confirm(t.deleteNotice || 'Delete this notice?')) return;

    try {
      const token = authState.session?.access_token;
      const response = await fetch(`${API_URL}/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  }

  function handleMediaFile(e) {
    mediaForm.file = e.target.files[0];
  }

  async function uploadMedia(e) {
    e.preventDefault();

    if (!mediaForm.file) return;

    const formData = new FormData();
    formData.append('file', mediaForm.file);
    formData.append('title', mediaForm.title);
    formData.append('description', mediaForm.description);

    try {
      const token = authState.session?.access_token;
      const response = await fetch(`${API_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        mediaForm = { title: '', description: '', file: null };
        await loadData();
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  }

  async function deleteMedia(id) {
    if (!confirm(t.deleteMedia || 'Delete this media?')) return;

    try {
      const token = authState.session?.access_token;
      const response = await fetch(`${API_URL}/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-20">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
          {$currentLanguage === 'en' ? 'Admin Dashboard' : 'অ্যাডমিন ড্যাশবোর্ড'}
        </h1>
        <p class="text-xl animate-fade-in">
          {$currentLanguage === 'en' ? 'Manage your website content' : 'আপনার ওয়েবসাইটের বিষয়বস্তু পরিচালনা করুন'}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-white font-semibold">
          {$currentLanguage === 'en' ? 'Welcome' : 'স্বাগতম'}, {authState.user?.name}
        </span>
        <button
          on:click={handleLogout}
          class="px-4 py-2 bg-secondary text-primary-900 rounded-lg font-semibold hover:bg-secondary-400 transition-all duration-300"
        >
          {$currentLanguage === 'en' ? 'Logout' : 'লগআউট'}
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Admin Dashboard -->
<section class="py-20 bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4">
    {#if isLoading}
      <div class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">
          {$currentLanguage === 'en' ? 'Loading...' : 'লোড হচ্ছে...'}
        </p>
      </div>
    {:else}
      <!-- Tab Navigation -->
      <div class="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
        <button
          class="flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 {activeTab === 'notices' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
          on:click={() => activeTab = 'notices'}
        >
          {$currentLanguage === 'en' ? 'Notices' : 'নোটিশ'}
        </button>
        <button
          class="flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 {activeTab === 'media' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
          on:click={() => activeTab = 'media'}
        >
          {$currentLanguage === 'en' ? 'Media' : 'মিডিয়া'}
        </button>
        <button
          class="flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 {activeTab === 'contacts' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
          on:click={() => activeTab = 'contacts'}
        >
          {$currentLanguage === 'en' ? 'Contacts' : 'যোগাযোগ'}
        </button>
      </div>

      <!-- Notices Tab -->
      {#if activeTab === 'notices'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Create Notice Form -->
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {$currentLanguage === 'en' ? 'Create Notice' : 'নোটিশ তৈরি করুন'}
            </h2>
            <form on:submit={createNotice} class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Title (English)' : 'শিরোনাম (ইংরেজি)'}
                </label>
                <input
                  type="text"
                  bind:value={noticeForm.title_en}
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Title (Bangla)' : 'শিরোনাম (বাংলা)'}
                </label>
                <input
                  type="text"
                  bind:value={noticeForm.title_bn}
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Content (English)' : 'বিষয়বস্তু (ইংরেজি)'}
                </label>
                <textarea
                  bind:value={noticeForm.content_en}
                  required
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Content (Bangla)' : 'বিষয়বস্তু (বাংলা)'}
                </label>
                <textarea
                  bind:value={noticeForm.content_bn}
                  required
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Priority' : 'অগ্রাধিকার'}
                </label>
                <select
                  bind:value={noticeForm.priority}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">{$currentLanguage === 'en' ? 'Low' : 'নিম্ন'}</option>
                  <option value="medium">{$currentLanguage === 'en' ? 'Medium' : 'মাঝারি'}</option>
                  <option value="high">{$currentLanguage === 'en' ? 'High' : 'উচ্চ'}</option>
                </select>
              </div>

              <button type="submit" class="w-full btn-primary">
                {$currentLanguage === 'en' ? 'Create Notice' : 'নোটিশ তৈরি করুন'}
              </button>
            </form>
          </div>

          <!-- Notices List -->
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {$currentLanguage === 'en' ? 'All Notices' : 'সমস্ত নোটিশ'}
            </h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              {#each notices as notice (notice.id)}
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {$currentLanguage === 'en' ? notice.title_en : notice.title_bn}
                    </h3>
                    <button
                      on:click={() => deleteNotice(notice.id)}
                      class="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {$currentLanguage === 'en' ? notice.content_en : notice.content_bn}
                  </p>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">
                      {new Date(notice.date).toLocaleDateString()}
                    </span>
                    <span class="px-2 py-1 text-xs rounded-full {notice.priority === 'high' ? 'bg-red-100 text-red-800' : notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                      {notice.priority}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Media Tab -->
      {#if activeTab === 'media'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Upload Media Form -->
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {$currentLanguage === 'en' ? 'Upload Media' : 'মিডিয়া আপলোড করুন'}
            </h2>
            <form on:submit={uploadMedia} class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Title' : 'শিরোনাম'}
                </label>
                <input
                  type="text"
                  bind:value={mediaForm.title}
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Description' : 'বর্ণনা'}
                </label>
                <textarea
                  bind:value={mediaForm.description}
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'File' : 'ফাইল'}
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  on:change={handleMediaFile}
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-700"
                />
              </div>

              <button type="submit" class="w-full btn-primary">
                {$currentLanguage === 'en' ? 'Upload Media' : 'মিডিয়া আপলোড করুন'}
              </button>
            </form>
          </div>

          <!-- Media List -->
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {$currentLanguage === 'en' ? 'All Media' : 'সমস্ত মিডিয়া'}
            </h2>
            <div class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {#each media as item (item.id)}
                <div class="relative group">
                  <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {#if item.type === 'image'}
                      <img src={item.url} alt={item.title} class="w-full h-full object-cover" />
                    {:else}
                      <video src={item.url} class="w-full h-full object-cover"></video>
                    {/if}
                  </div>
                  <button
                    on:click={() => deleteMedia(item.id)}
                    class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div class="mt-2">
                    <h4 class="font-semibold text-sm text-gray-900 dark:text-white truncate">{item.title}</h4>
                    <p class="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Contacts Tab -->
      {#if activeTab === 'contacts'}
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {$currentLanguage === 'en' ? 'Contact Submissions' : 'যোগাযোগ জমা'}
          </h2>
          <div class="space-y-4 max-h-96 overflow-y-auto">
            {#each contacts as contact (contact.id)}
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                  <span class="text-xs text-gray-500">
                    {new Date(contact.created_at).toLocaleString()}
                  </span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-2">{contact.email}</p>
                {#if contact.phone}
                  <p class="text-gray-600 dark:text-gray-300 mb-2">{contact.phone}</p>
                {/if}
                <p class="text-sm text-gray-700 dark:text-gray-200">{contact.message}</p>
                <div class="mt-2">
                  <span class="px-2 py-1 text-xs rounded-full {contact.status === 'new' ? 'bg-green-100 text-green-800' : contact.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                    {contact.status}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</section>
