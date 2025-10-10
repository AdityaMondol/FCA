// API Configuration
const API_URL = import.meta.env.PROD 
  ? 'https://fca-mfst.onrender.com'  // Production backend URL
  : 'http://localhost:3000';          // Development backend URL

export { API_URL };
