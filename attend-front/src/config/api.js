// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  SIGNUP: `${API_URL}/auth/signup`,
  VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  RESEND_OTP: `${API_URL}/auth/resend-otp`,
  LOGIN: `${API_URL}/auth/login`,

  // Attendance - Faculty
  FACULTY_SECTIONS: `${API_URL}/attendance/faculty/sections`,
  SECTION_STUDENTS: (sectionId) => `${API_URL}/attendance/sections/${sectionId}/students`,
  CREATE_SESSION: `${API_URL}/attendance/sessions`,
  MARK_ATTENDANCE: (sessionId) => `${API_URL}/attendance/sessions/${sessionId}/punches`,
  GET_SESSIONS: `${API_URL}/attendance/sessions`,
  GET_SESSION_DETAIL: (sessionId) => `${API_URL}/attendance/sessions/${sessionId}`,

  // Attendance - Student
  MY_ATTENDANCE: `${API_URL}/attendance/my`,
};
