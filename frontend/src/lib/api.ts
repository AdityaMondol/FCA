import { browser } from '$app/environment';

const API_BASE_URL = browser 
  ? 'https://fca-tgqs.onrender.com' // Replace with actual Render URL
  : 'http://localhost:3000';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = browser ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data: any) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getProfile: () => apiCall('/auth/me'),
  
  // Teachers
  getTeachers: () => apiCall('/teachers'),
  
  // Notices
  getNotices: (language?: string) => apiCall(`/notices${language ? `?language=${language}` : ''}`),
  
  // Media
  getMedia: () => apiCall('/media'),
  
  // Contact
  submitContact: (data: any) => apiCall('/contact/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getAcademyInfo: () => apiCall('/contact/info'),
};