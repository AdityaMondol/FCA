import { writable } from 'svelte/store';

const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    
    if (token && user) {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(user)
      };
    }
  }
  
  return {
    isAuthenticated: false,
    token: null,
    user: null
  };
};

export const auth = writable(getInitialAuth());

export const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    
    // Update store
    auth.set({
      isAuthenticated: true,
      token: data.token,
      user: data.user
    });
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  
  // Update store
  auth.set({
    isAuthenticated: false,
    token: null,
    user: null
  });
};

export const register = async (email, password, name, role = 'student', phone = '', teacherCode = '') => {
  try {
    const response = await fetch('/api/auth/register', {
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
    return { success: true, data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};
