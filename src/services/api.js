import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// APPLY INSURANCE
export const applyInsurance = (formData) =>
  axios.post(`${API_BASE_URL}/api/insurance/apply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET ALL APPLICATIONS (Admin)
export const getAllApplications = () =>
  axios.get(`${API_BASE_URL}/api/insurance/all`);

// UPDATE STATUS
export const updateStatus = (id, status) =>
  axios.put(`${API_BASE_URL}/api/insurance/status/${id}`, { status });

// USER — GET THEIR OWN APPLICATIONS
export const getMyApplications = (token) =>
  axios.get(`${API_BASE_URL}/api/insurance/my-applications`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// ⭐ FIX 401 — USER PROFILE API (missing earlier)
export const getProfile = (token) =>
  axios.get(`${API_BASE_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

// DEFAULT AXIOS INSTANCE
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
