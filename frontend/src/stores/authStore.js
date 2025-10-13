import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { API_URL } from '../config';
import { apiClient, handleApiError } from '../utils/api';
import { AppError, ERROR_CODES } from '../utils/error';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;





export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'fca-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'fca-dashboard'
      }
    }
  }
);

// Profile cache to avoid redundant fetches
let profileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to fetch user profile with caching
async function fetchUserProfile(userId, forceRefresh = false) {
  const cacheKey = `profile_${userId}`;
  const cached = profileCache.get(cacheKey);
  
  // Return cached profile if valid and not forcing refresh
  
  
  try {
    // Add timeout to profile fetch
    const profilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new AppError('Profile fetch timeout', ERROR_CODES.TIMEOUT_ERROR)), 10000)
    );
    
    const { data: userProfile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise.then(() => ({ data: null, error: { message: 'Timeout' } }))
    ]);

    if (profileError) {
      return null;
    }