import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { API_URL } from '../config.js';
import { apiClient, handleApiError } from '../utils/api.js';
import { AppError, ERROR_CODES } from '../utils/error.js';

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
  if (cached && !forceRefresh && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
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
      timeoutPromise
    ]);

    if (profileError) {
      throw new AppError(profileError.message, ERROR_CODES.PROFILE_FETCH_ERROR);
    }

    // Cache the profile
    profileCache.set(cacheKey, {
      data: userProfile,
      timestamp: Date.now()
    });

    return userProfile;
  } catch (error) {
    handleApiError(error);
    return null;
  }
}

// Auth store
export const auth = writable({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null
});

// Update auth state
export const updateAuthState = (user, session = null) => {
  auth.update(state => ({
    ...state,
    user,
    session,
    loading: false,
    error: null
  }));
  
  // Fetch profile if user exists
  if (user) {
    fetchUserProfile(user.id).then(profile => {
      auth.update(state => ({
        ...state,
        profile
      }));
    });
  }
};

// Clear auth state
export const clearAuthState = () => {
  auth.set({
    user: null,
    profile: null,
    session: null,
    loading: false,
    error: null
  });
  profileCache.clear();
};

// Login function
export const login = async (email, password) => {
  try {
    auth.update(state => ({ ...state, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw new AppError(error.message, ERROR_CODES.AUTH_ERROR);
    
    updateAuthState(data.user, data.session);
    return { success: true, user: data.user };
  } catch (error) {
    const appError = handleApiError(error);
    auth.update(state => ({ ...state, loading: false, error: appError }));
    return { success: false, error: appError };
  }
};

// Register function
export const register = async (email, password, name) => {
  try {
    auth.update(state => ({ ...state, loading: true, error: null }));
    
    // First sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) throw new AppError(error.message, ERROR_CODES.AUTH_ERROR);
    
    // If email confirmation is required, don't log in immediately
    if (data.user && !data.user.identities) {
      auth.update(state => ({ ...state, loading: false }));
      return { 
        success: true, 
        user: data.user, 
        requiresEmailConfirmation: true 
      };
    }
    
    // Otherwise, update auth state
    updateAuthState(data.user, data.session);
    return { success: true, user: data.user };
  } catch (error) {
    const appError = handleApiError(error);
    auth.update(state => ({ ...state, loading: false, error: appError }));
    return { success: false, error: appError };
  }
};

// Logout function
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message, ERROR_CODES.AUTH_ERROR);
    
    clearAuthState();
    return { success: true };
  } catch (error) {
    const appError = handleApiError(error);
    return { success: false, error: appError };
  }
};

// Refresh user profile
export const refreshProfile = async (userId) => {
  try {
    const profile = await fetchUserProfile(userId, true);
    auth.update(state => ({
      ...state,
      profile
    }));
    return profile;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new AppError(error.message, ERROR_CODES.PROFILE_UPDATE_ERROR);
    
    // Update cache and store
    const cacheKey = `profile_${userId}`;
    profileCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    auth.update(state => ({
      ...state,
      profile: data
    }));
    
    return { success: true, profile: data };
  } catch (error) {
    const appError = handleApiError(error);
    return { success: false, error: appError };
  }
};

// Check if user has required role
export const hasRole = (requiredRole) => {
  const state = get(auth);
  if (!state.user || !state.profile) return false;
  
  const roleHierarchy = {
    student: 1,
    guardian: 2,
    teacher: 3
  };
  
  const userRoleLevel = roleHierarchy[state.profile.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

// Initialize auth state on app load
export const initAuth = async () => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      updateAuthState(session.user, session);
    } else {
      clearAuthState();
    }
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        updateAuthState(session?.user || null, session);
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
      }
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    clearAuthState();
  }
};

export default auth;