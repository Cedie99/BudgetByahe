// API Configuration - Dynamic for localhost and production
const getApiUrl = () => {
  // Check if we're in production (Hostinger) or development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Replace with your actual Hostinger backend URL
  return process.env.REACT_APP_API_URL || 'https://your-domain.com';
};

const getAppUrl = () => {
  // Get the current application URL
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Replace with your actual Hostinger frontend URL
  return process.env.REACT_APP_URL || window.location.origin;
};

const config = {
  // API Base URL
  apiUrl: getApiUrl(),
  
  // App URL
  appUrl: getAppUrl(),
  
  // API Endpoints
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
    },
    routes: {
      list: '/api/routes',
      create: '/api/routes',
      update: (id) => `/api/routes/${id}`,
      delete: (id) => `/api/routes/${id}`,
    },
    fares: {
      list: '/api/fares',
      upload: '/api/fares/upload',
    },
    user: {
      profile: '/api/user/profile',
      updateProfile: '/api/user/profile',
    },
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
