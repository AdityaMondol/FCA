<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { apiClient } from '../utils/api';
  import LoadingSpinner from './LoadingSpinner.svelte';
  
  export let placeholder = 'Search...';
  export let autoFocus = false;
  
  const dispatch = createEventDispatcher();
  
  let searchQuery = '';
  let suggestions = [];
  let isLoading = false;
  let showSuggestions = false;
  let selectedIndex = -1;
  let searchTimeout;
  let inputRef;
  
  onMount(() => {
    if (autoFocus && inputRef) {
      inputRef.focus();
    }
  });
  
  async function fetchSuggestions(query) {
    if (!query || query.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }
    
    isLoading = true;
    
    try {
      const response = await apiClient.get('/api/search/suggestions', { q: query, limit: 5 });
      suggestions = response.data || [];
      showSuggestions = suggestions.length > 0;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      suggestions = [];
      showSuggestions = false;
    } finally {
      isLoading = false;
    }
  }
  
  function handleInput(e) {
    searchQuery = e.target.value;
    selectedIndex = -1;
    
    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
  }
  
  function handleKeydown(e) {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          performSearch();
        }
        break;
      case 'Escape':
        showSuggestions = false;
        selectedIndex = -1;
        break;
    }
  }
  
  function selectSuggestion(suggestion) {
    searchQuery = suggestion.text;
    showSuggestions = false;
    selectedIndex = -1;
    performSearch();
  }
  
  function performSearch() {
    if (searchQuery.trim()) {
      dispatch('search', { query: searchQuery.trim() });
      showSuggestions = false;
    }
  }
  
  function handleClickOutside(e) {
    if (!e.target.closest('.search-container')) {
      showSuggestions = false;
      selectedIndex = -1;
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearTimeout(searchTimeout);
    };
  });
</script>

<div class="search-container relative w-full max-w-2xl">
  <!-- Search Input -->
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    
    <input
      bind:this={inputRef}
      type="text"
      bind:value={searchQuery}
      on:input={handleInput}
      on:keydown={handleKeydown}
      on:focus={() => searchQuery.length >= 2 && suggestions.length > 0 && (showSuggestions = true)}
      placeholder={placeholder}
      class="w-full pl-12 pr-12 py-3 glass rounded-xl border border-white/20 
             text-gray-900 dark:text-white placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
             transition-all duration-300"
    />
    
    <div class="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
      {#if isLoading}
        <LoadingSpinner size="sm" variant="primary" />
      {:else if searchQuery}
        <button
          on:click={() => { searchQuery = ''; suggestions = []; showSuggestions = false; }}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
      
      <button
        on:click={performSearch}
        disabled={!searchQuery.trim()}
        class="text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Suggestions Dropdown -->
  {#if showSuggestions && suggestions.length > 0}
    <div
      class="absolute z-50 w-full mt-2 glass rounded-xl border border-white/20 shadow-2xl overflow-hidden"
      transition:fly={{ y: -10, duration: 200 }}
    >
      <ul class="py-2">
        {#each suggestions as suggestion, index}
          <li>
            <button
              on:click={() => selectSuggestion(suggestion)}
              class="w-full px-4 py-3 text-left flex items-center gap-3 
                     hover:bg-white/10 transition-colors
                     {selectedIndex === index ? 'bg-white/10' : ''}"
            >
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white truncate">
                  {suggestion.text}
                </p>
              </div>
              
              <span class="text-xs text-gray-500 dark:text-gray-400 capitalize px-2 py-1 
                           bg-gray-200 dark:bg-gray-700 rounded-full">
                {suggestion.type}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  :global(.dark) .glass {
    background: rgba(0, 0, 0, 0.2);
  }
</style>
