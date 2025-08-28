// Test script to verify URL construction
const API_CONFIG = {
  development: {
    baseURL: ''
  },
  production: {
    baseURL: 'https://editor-clipcraft-production.up.railway.app'
  }
};

const isProduction = true; // Simulating production environment

const getBaseURL = () => {
  return isProduction ? API_CONFIG.production.baseURL : API_CONFIG.development.baseURL;
};

const buildApiUrl = (endpoint) => {
  const baseURL = getBaseURL();
  return `${baseURL}${endpoint}`;
};

// Test various endpoints
console.log('Testing URL construction:');
console.log('Projects API:', buildApiUrl('/projects/api/projects'));
console.log('Users API:', buildApiUrl('/api/users'));
console.log('Empty endpoint:', buildApiUrl(''));
