// API Configuration
// Update this with your AWS API Gateway endpoint URL

// For development, you can use a local mock server or leave empty to use console.log
// For production, set this to your AWS API Gateway endpoint
export const API_BASE_URL = import.meta.env.VITE_AWS_API_URL || ''

// Helper function to check if API is configured
export const isApiConfigured = () => {
  return API_BASE_URL !== ''
}

// API endpoints
export const API_ENDPOINTS = {
  BOOKING: `${API_BASE_URL}`,
}

