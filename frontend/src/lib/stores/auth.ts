import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: string;
  email: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    isApproved: boolean;
  };
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(false);

export async function checkAuth() {
  if (!browser) return;
  
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    isLoading.set(true);
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const userData = await response.json();
      user.set(userData);
      isAuthenticated.set(true);
    } else {
      localStorage.removeItem('token');
      user.set(null);
      isAuthenticated.set(false);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('token');
    user.set(null);
    isAuthenticated.set(false);
  } finally {
    isLoading.set(false);
  }
}

export function logout() {
  localStorage.removeItem('token');
  user.set(null);
  isAuthenticated.set(false);
}