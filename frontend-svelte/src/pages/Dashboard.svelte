<script>
  import { currentLanguage, translations } from '../stores/languageStore';
  import { auth, logout } from '../stores/authStore';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  
  let t;
  $: t = translations[$currentLanguage];
  
  let authState;
  auth.subscribe(value => {
    authState = value;
  });

  let profileData = {
    name: '',
    email: '',
    phone: '',
    description: '',
    subject_specialization: '',
    experience_years: '',
    education_background: '',
    achievements: '',
    profile_photo_url: '',
    role: ''
  };

  let isEditing = false;
  let isLoading = false;
  let message = '';
  let profilePhotoFile = null;
  let showDeleteModal = false;
  let deleteConfirmText = '';
  let showRoleChangeModal = false;
  let newRole = '';
  let teacherVerificationCode = '';

  onMount(() => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }

    loadProfile();
  });

  async function loadProfile() {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        profileData = await response.json();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function saveProfile() {
    isLoading = true;
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });
      
      if (profilePhotoFile) {
        formData.append('profile_photo', profilePhotoFile);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        },
        body: formData
      });

      if (response.ok) {
        message = $currentLanguage === 'en' 
          ? 'Profile updated successfully!' 
          : 'প্রোফাইল সফলভাবে আপডেট হয়েছে!';
        isEditing = false;
        loadProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      message = $currentLanguage === 'en' 
        ? 'Error updating profile. Please try again.' 
        : 'প্রোফাইল আপডেট করতে ত্রুটি। আবার চেষ্টা করুন।';
    }
    isLoading = false;
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert($currentLanguage === 'en' 
          ? 'File size should be less than 2MB' 
          : 'ফাইলের আকার ২এমবি এর কম হতে হবে');
        return;
      }
      profilePhotoFile = file;
    }
  }

  async function changeRole() {
    if (!newRole) return;
    
    if (newRole === 'teacher' && teacherVerificationCode !== 'FCA2025') {
      message = $currentLanguage === 'en' 
        ? 'Invalid teacher verification code' 
        : 'অবৈধ শিক্ষক যাচাই কোড';
      return;
    }

    isLoading = true;
    try {
      const response = await fetch('/api/change-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ 
          role: newRole,
          teacherCode: newRole === 'teacher' ? teacherVerificationCode : null
        })
      });

      if (response.ok) {
        message = $currentLanguage === 'en' 
          ? 'Role changed successfully! Please log in again.' 
          : 'ভূমিকা সফলভাবে পরিবর্তন হয়েছে! আবার লগ ইন করুন।';
        showRoleChangeModal = false;
        // Update auth state
        auth.update(state => ({
          ...state,
          user: { ...state.user, role: newRole }
        }));
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        const error = await response.json();
        message = error.error || 'Failed to change role';
      }
    } catch (error) {
      message = $currentLanguage === 'en' 
        ? 'Error changing role. Please try again.' 
        : 'ভূমিকা পরিবর্তন করতে ত্রুটি। আবার চেষ্টা করুন।';
    }
    isLoading = false;
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      message = $currentLanguage === 'en' 
        ? 'Please type "DELETE" to confirm account deletion' 
        : 'অ্যাকাউন্ট মুছে ফেলার জন্য "DELETE" টাইপ করুন';
      return;
    }

    isLoading = true;
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (response.ok) {
        message = $currentLanguage === 'en' 
          ? 'Account deleted successfully. Goodbye!' 
          : 'অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে। বিদায়!';
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } else {
        const error = await response.json();
        message = error.error || 'Failed to delete account';
      }
    } catch (error) {
      message = $currentLanguage === 'en' 
        ? 'Error deleting account. Please try again.' 
        : 'অ্যাকাউন্ট মুছতে ত্রুটি। আবার চেষ্টা করুন।';
    }
    isLoading = false;
  }
</script>

<!-- Page Header -->
<section class="gradient-bg text-white py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 animate-fade-in">
      {$currentLanguage === 'en' ? 'Account Dashboard' : 'অ্যাকাউন্ট ড্যাশবোর্ড'}
    </h1>
    <p class="text-base max-w-3xl mx-auto animate-fade-in">
      {$currentLanguage === 'en' 
        ? 'Manage your profile, role, and account settings' 
        : 'আপনার প্রোফাইল, ভূমিকা এবং অ্যাকাউন্ট সেটিংস পরিচালনা করুন'}
    </p>
  </div>
</section>

<!-- Dashboard Content -->
<section class="py-12 bg-white dark:bg-gray-900 min-h-screen">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto">
      
      {#if message}
        <div class="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      {/if}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Profile Photo & Basic Info -->
        <div class="lg:col-span-1">
          <div class="card text-center">
            <div class="mb-4">
              {#if profileData.profile_photo_url}
                <img src={profileData.profile_photo_url} alt="Profile" class="w-32 h-32 rounded-full mx-auto object-cover">
              {:else}
                <div class="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center">
                  <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              {/if}
            </div>
            
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">{profileData.name}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">{profileData.email}</p>
            {#if profileData.phone}
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{profileData.phone}</p>
            {/if}

            {#if isEditing}
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Profile Photo' : 'প্রোফাইল ছবি'}
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  on:change={handlePhotoChange}
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-700"
                />
              </div>
            {/if}

            <button 
              on:click={() => isEditing = !isEditing}
              class="btn-primary w-full"
            >
              {isEditing 
                ? ($currentLanguage === 'en' ? 'Cancel' : 'বাতিল') 
                : ($currentLanguage === 'en' ? 'Edit Profile' : 'প্রোফাইল সম্পাদনা')}
            </button>
          </div>
        </div>

        <!-- Profile Details Form -->
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {$currentLanguage === 'en' ? 'Profile Information' : 'প্রোফাইল তথ্য'}
            </h3>

            <form on:submit|preventDefault={saveProfile} class="space-y-4">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {$currentLanguage === 'en' ? 'Full Name' : 'পূর্ণ নাম'}
                  </label>
                  <input
                    type="text"
                    bind:value={profileData.name}
                    disabled={!isEditing}
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {$currentLanguage === 'en' ? 'Phone' : 'ফোন'}
                  </label>
                  <input
                    type="tel"
                    bind:value={profileData.phone}
                    disabled={!isEditing}
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Subject Specialization' : 'বিষয় বিশেষজ্ঞতা'}
                </label>
                <input
                  type="text"
                  bind:value={profileData.subject_specialization}
                  disabled={!isEditing}
                  placeholder={$currentLanguage === 'en' ? 'e.g., Mathematics, English, Science' : 'যেমন: গণিত, ইংরেজি, বিজ্ঞান'}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Years of Experience' : 'অভিজ্ঞতার বছর'}
                </label>
                <input
                  type="number"
                  bind:value={profileData.experience_years}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Professional Description' : 'পেশাদার বিবরণ'}
                </label>
                <textarea
                  bind:value={profileData.description}
                  disabled={!isEditing}
                  rows="3"
                  placeholder={$currentLanguage === 'en' ? 'Brief description about yourself and your teaching approach' : 'নিজের এবং আপনার শিক্ষণ পদ্ধতি সম্পর্কে সংক্ষিপ্ত বিবরণ'}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60 resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Education Background' : 'শিক্ষাগত যোগ্যতা'}
                </label>
                <textarea
                  bind:value={profileData.education_background}
                  disabled={!isEditing}
                  rows="2"
                  placeholder={$currentLanguage === 'en' ? 'Your educational qualifications and degrees' : 'আপনার শিক্ষাগত যোগ্যতা এবং ডিগ্রি'}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60 resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {$currentLanguage === 'en' ? 'Achievements & Awards' : 'অর্জন ও পুরস্কার'}
                </label>
                <textarea
                  bind:value={profileData.achievements}
                  disabled={!isEditing}
                  rows="2"
                  placeholder={$currentLanguage === 'en' ? 'Notable achievements, awards, or recognition' : 'উল্লেখযোগ্য অর্জন, পুরস্কার, বা স্বীকৃতি'}
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-60 resize-none"
                ></textarea>
              </div>

              {#if isEditing}
                <div class="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    class="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isLoading 
                      ? ($currentLanguage === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') 
                      : ($currentLanguage === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ')}
                  </button>
                  <button
                    type="button"
                    on:click={() => { isEditing = false; loadProfile(); }}
                    class="btn-secondary flex-1"
                  >
                    {$currentLanguage === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                </div>
              {/if}

            </form>
          </div>
        </div>
      </div>

      <!-- Account Management Section -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Role Management -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {$currentLanguage === 'en' ? 'Change Role' : 'ভূমিকা পরিবর্তন'}
          </h3>
          
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Current Role:' : 'বর্তমান ভূমিকা:'}
            </p>
            <span class="inline-block px-3 py-1 bg-primary text-white rounded-full text-sm font-medium capitalize">
              {profileData.role || authState.user?.role}
            </span>
          </div>

          <button 
            on:click={() => showRoleChangeModal = true}
            class="btn-secondary w-full"
          >
            {$currentLanguage === 'en' ? 'Change Role' : 'ভূমিকা পরিবর্তন করুন'}
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="card border-red-200 dark:border-red-800">
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {$currentLanguage === 'en' ? 'Danger Zone' : 'বিপজ্জনক এলাকা'}
          </h3>
          
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {$currentLanguage === 'en' 
              ? 'Once you delete your account, there is no going back. Please be certain.' 
              : 'একবার আপনি আপনার অ্যাকাউন্ট মুছে ফেললে, আর ফিরে আসা যাবে না। অনুগ্রহ করে নিশ্চিত হন।'}
          </p>
          
          <button 
            on:click={() => showDeleteModal = true}
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 w-full font-medium"
          >
            {$currentLanguage === 'en' ? 'Delete Account' : 'অ্যাকাউন্ট মুছে ফেলুন'}
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Role Change Modal -->
{#if showRoleChangeModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {$currentLanguage === 'en' ? 'Change Your Role' : 'আপনার ভূমিকা পরিবর্তন করুন'}
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {$currentLanguage === 'en' ? 'Select New Role' : 'নতুন ভূমিকা নির্বাচন করুন'}
          </label>
          <select 
            bind:value={newRole}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">{$currentLanguage === 'en' ? 'Choose Role' : 'ভূমিকা বেছে নিন'}</option>
            <option value="student">{$currentLanguage === 'en' ? 'Student' : 'শিক্ষার্থী'}</option>
            <option value="guardian">{$currentLanguage === 'en' ? 'Guardian/Parent' : 'অভিভাবক'}</option>
            <option value="teacher">{$currentLanguage === 'en' ? 'Teacher' : 'শিক্ষক'}</option>
          </select>
        </div>

        {#if newRole === 'teacher'}
          <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {$currentLanguage === 'en' ? 'Teacher Verification Code' : 'শিক্ষক যাচাই কোড'}
            </label>
            <input
              type="text"
              bind:value={teacherVerificationCode}
              placeholder={$currentLanguage === 'en' ? 'Enter teacher code' : 'শিক্ষক কোড লিখুন'}
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        {/if}
      </div>

      <div class="flex gap-3 mt-6">
        <button 
          on:click={changeRole}
          disabled={!newRole || isLoading}
          class="btn-primary flex-1 disabled:opacity-50"
        >
          {isLoading 
            ? ($currentLanguage === 'en' ? 'Changing...' : 'পরিবর্তন হচ্ছে...') 
            : ($currentLanguage === 'en' ? 'Change Role' : 'ভূমিকা পরিবর্তন')}
        </button>
        <button 
          on:click={() => {showRoleChangeModal = false; newRole = ''; teacherVerificationCode = '';}}
          class="btn-secondary flex-1"
        >
          {$currentLanguage === 'en' ? 'Cancel' : 'বাতিল'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Account Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {$currentLanguage === 'en' ? 'Delete Account' : 'অ্যাকাউন্ট মুছে ফেলুন'}
      </h3>
      
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        {$currentLanguage === 'en' 
          ? 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.' 
          : 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। এটি স্থায়ীভাবে আপনার অ্যাকাউন্ট মুছে ফেলবে এবং আমাদের সার্ভার থেকে আপনার সমস্ত ডেটা সরিয়ে দেবে।'}
      </p>
      
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {$currentLanguage === 'en' 
            ? 'Type "DELETE" to confirm:' 
            : 'নিশ্চিত করতে "DELETE" টাইপ করুন:'}
        </label>
        <input
          type="text"
          bind:value={deleteConfirmText}
          placeholder="DELETE"
          class="w-full px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div class="flex gap-3">
        <button 
          on:click={deleteAccount}
          disabled={deleteConfirmText !== 'DELETE' || isLoading}
          class="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-300 flex-1 font-medium"
        >
          {isLoading 
            ? ($currentLanguage === 'en' ? 'Deleting...' : 'মুছে ফেলা হচ্ছে...') 
            : ($currentLanguage === 'en' ? 'Delete Account' : 'অ্যাকাউন্ট মুছে ফেলুন')}
        </button>
        <button 
          on:click={() => {showDeleteModal = false; deleteConfirmText = '';}}
          class="btn-secondary flex-1"
        >
          {$currentLanguage === 'en' ? 'Cancel' : 'বাতিল'}
        </button>
      </div>
    </div>
  </div>
{/if}
