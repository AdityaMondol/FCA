import { writable } from 'svelte/store';
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
  supabaseKey || 'placeholder-key'
);

const getInitialAuth = async () => {
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session && session.user) {
    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      isAuthenticated: true,
      session,
      user: {
        id: session.user.id,
        email: session.user.email,
        ...userProfile
      }
    };
  }
  
  return {
    isAuthenticated: false,
    session: null,
    user: null
  };
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
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      auth.set({
        isAuthenticated: true,
        session,
        user: {
          id: session.user.id,
          email: session.user.email,
          ...userProfile
        }
      });
    } else {
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
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Login successful!');
    
    // Auth store will be updated automatically by onAuthStateChange listener
    // No need to fetch profile here - it will be fetched by the listener
    return { 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
    // Auth store will be updated by onAuthStateChange listener
  } catch (error) {
    console.error('Logout error:', error);
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
