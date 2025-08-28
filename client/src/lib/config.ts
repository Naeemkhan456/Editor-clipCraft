// API configuration for different environments
export const API_CONFIG = {
  // For development - uses relative URLs when frontend and backend are on same domain
  development: {
    baseURL: ''
  },
  // For production - replace with your Railway backend URL
  production: {
    baseURL: import.meta.env.VITE_RAILWAY_BACKEND_URL || 'https://editor-clipcraft-production.up.railway.app' 
  }
};

// Get current environment
export const isProduction = import.meta.env.PROD;

// Get appropriate base URL
export const getBaseURL = () => {
  return isProduction ? API_CONFIG.production.baseURL : API_CONFIG.development.baseURL;
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string) => {
  const baseURL = getBaseURL();
  return `${baseURL}${endpoint}`;
};
