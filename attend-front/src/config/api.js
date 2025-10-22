// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNUP: `${API_URL}/auth/signup`,
  VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  RESEND_OTP: `${API_URL}/auth/resend-otp`,
  LOGIN: `${API_URL}/auth/login`,
};
