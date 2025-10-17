// Simple API helper for FCA app
const API_BASE_URL = 'https://your-backend-url.render.com'; // Replace with actual Render URL

export const api = {
  async getTeachers() {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return response.json();
  },

  async getNotices(language?: string) {
    const url = language ? `${API_BASE_URL}/notices?language=${language}` : `${API_BASE_URL}/notices`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notices');
    return response.json();
  },

  async getMedia() {
    const response = await fetch(`${API_BASE_URL}/media`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  async submitContact(data: any) {
    const response = await fetch(`${API_BASE_URL}/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit contact form');
    return response.json();
  },

  async register(data: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async login(data: any) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  }
};