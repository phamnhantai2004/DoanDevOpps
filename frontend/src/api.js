const API_BASE = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE_URL) || '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
  return data;
}

// Health
export const checkHealth = () => request('/health');

// Auth
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const getMe = () => request('/auth/me');

// Events
export const getEvents = (params = '') => request(`/events${params ? '?' + params : ''}`);
export const getEventStats = () => request('/events/stats');
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (data) => request('/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

// Registrations
export const getRegistrations = (params = '') => request(`/registrations${params ? '?' + params : ''}`);
export const createRegistration = (data) => request('/registrations', { method: 'POST', body: JSON.stringify(data) });
export const cancelRegistration = (id) => request(`/registrations/${id}/cancel`, { method: 'PUT' });
export const deleteRegistration = (id) => request(`/registrations/${id}`, { method: 'DELETE' });

// Users
export const getUsers = () => request('/users');
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
