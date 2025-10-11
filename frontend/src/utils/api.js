// API Client with caching and error handling
import { API_URL } from '../config';

class ApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generate cache key for requests
  generateCacheKey(url, options = {}) {
    const params = new URLSearchParams(options.params || {}).toString();
    return `${url}?${params}`;
  }

  // Check if cached response is still valid
  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  // Clear expired cache entries
  clearExpiredCache() {
    for (const [key, value] of this.cache.entries()) {
      if (!this.isCacheValid(value.timestamp)) {
        this.cache.delete(key);
      }
    }
  }

  // Make API request with caching
  async request(endpoint, options = {}, useCache = false) {
    const url = `${API_URL}${endpoint}`;
    const cacheKey = this.generateCacheKey(url, options);

    // Check cache first for GET requests
    if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        console.log('📦 Returning cached response for:', endpoint);
        return cached.data;
      }
    }

    try {
      // Add default headers
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };

      // Merge headers
      const headers = {
        ...defaultHeaders,
        ...options.headers,
      };

      // Prepare fetch options
      const fetchOptions = {
        ...options,
        headers,
      };

      // Handle body data
      if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      console.log(`🚀 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET requests
      if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      // Clear expired cache entries periodically
      if (Math.random() < 0.1) { // 10% chance to clean cache
        this.clearExpiredCache();
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error ${endpoint}:`, error.message);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}, useCache = false) {
    const options = {
      method: 'GET',
      params
    };
    return this.request(endpoint, options, useCache);
  }

  // POST request
  async post(endpoint, data = {}) {
    const options = {
      method: 'POST',
      body: data
    };
    return this.request(endpoint, options);
  }

  // PUT request
  async put(endpoint, data = {}) {
    const options = {
      method: 'PUT',
      body: data
    };
    return this.request(endpoint, options);
  }

  // DELETE request
  async delete(endpoint) {
    const options = {
      method: 'DELETE'
    };
    return this.request(endpoint, options);
  }

  // Clear cache for specific endpoint
  clearCache(endpoint) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${API_URL}${endpoint}`)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility function for handling API errors gracefully
export function handleApiError(error, defaultMessage = 'An error occurred. Please try again.') {
  if (error.message.includes('Failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request timeout. Please try again.';
  }
  
  return error.message || defaultMessage;
}