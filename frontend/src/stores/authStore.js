import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { API_URL } from '../config';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Debug logging
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  key: supabaseKey ? '✅ Set' : '❌ Missing',
  apiUrl: import.meta.env.VITE_API_URL || 'Not set'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not configured!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in Netlify environment variables.');
  console.error('After adding variables, redeploy the site.');
}

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
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('📦 Using cached profile');
    return cached.data;
  }
  
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('⚠️ Profile fetch failed:', profileError.message);
      return null;
    }

    // Cache the profile
    profileCache.set(cacheKey, {
      data: userProfile,
      timestamp: Date.now()
    });

    return userProfile;
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return null;
  }
}

const getInitialAuth = async () => {
  try {
    // Check for existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return {
        isAuthenticated: false,
        session: null,
        user: null
      };
    }
    
    if (session && session.user) {
      // Get user profile with caching
      const userProfile = await fetchUserProfile(session.user.id);

      return {
        isAuthenticated: true,
        session,
        user: {
          id: session.user.id,
          email: session.user.email,
          ...(userProfile || {
            name: session.user.user_metadata?.name || 'User',
            role: 'user'
          })
        }
      };
    }
    
    return {
      isAuthenticated: false,
      session: null,
      user: null
    };
  } catch (error) {
    console.error('❌ Auth initialization error:', error);
    return {
      isAuthenticated: false,
      session: null,
      user: null
    };
  }
};

// Initialize auth store
export const auth = writable({
  isAuthenticated: false,
  session: null,
  user: null
});

// Check for existing session on load
if (typeof window !== 'undefined') {
  getInitialAuth().then(initialAuth => {
    auth.set(initialAuth);
    console.log('🔐 Initial auth state:', initialAuth.isAuthenticated ? 'Logged in' : 'Logged out');
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state changed:', event);
    
    if (session && session.user) {
      // Only fetch profile for specific events
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const userProfile = await fetchUserProfile(session.user.id, event === 'USER_UPDATED');

        auth.set({
          isAuthenticated: true,
          session,
          user: {
            id: session.user.id,
            email: session.user.email,
            ...(userProfile || {
              name: session.user.user_metadata?.name || 'User',
              role: 'user'
            })
          }
        });
      } else if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Just update session without fetching profile
        const currentState = get(auth);
        if (currentState.user) {
          auth.update(state => ({
            ...state,
            isAuthenticated: true,
            session
          }));
        }
      }
    } else if (event === 'SIGNED_OUT') {
      // Clear cache on sign out
      profileCache.clear();
      auth.set({
        isAuthenticated: false,
        session: null,
        user: null
      });
    }
  });
}

export const login = async (email, password) => {
  try {
    console.log('🔐 Attempting login...');
    const startTime = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Login successful! Fetching profile...');
    
    // Fetch profile with caching
    const userProfile = await fetchUserProfile(data.user.id, true); // Force refresh on login

    // Update auth store immediately
    auth.set({
      isAuthenticated: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...(userProfile || {
          name: data.user.user_metadata?.name || 'User',
          role: 'user'
        })
      }
    });

    const endTime = Date.now();
    console.log(`✅ Login completed in ${endTime - startTime}ms`);
    
    return { 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email
      }
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    console.log('👋 Logging out...');
    profileCache.clear(); // Clear cache
    await supabase.auth.signOut();
    // Auth store will be updated by onAuthStateChange listener
    console.log('✅ Logged out successfully');
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Force clear auth state even if signOut fails
    auth.set({
      isAuthenticated: false,
      session: null,
      user: null
    });
  }
};

export const register = async (email, password, name, role = 'student', phone = '', teacherCode = '') => {
  try {
    // Call backend API to validate and register
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name, 
        role,
        phone,
        teacherCode
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    return { 
      success: true, 
      message: data.message,
      emailSent: data.emailSent
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};
