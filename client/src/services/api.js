const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dealpilot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: { role } }),
  getMe: () => request('/auth/me'),

  // Rooms
  getRooms: () => request('/rooms'),
  getRoom: (id) => request(`/rooms/${id}`),
  getRoomByCode: (code) => request(`/rooms/by-code/${code}`),
  createRoom: (payload) => request('/rooms', { method: 'POST', body: payload }),
  joinRoom: (id) => request(`/rooms/${id}/join`, { method: 'POST' }),
  getQuotation: (id) => request(`/rooms/${id}/quotation`),

  // Offers
  submitOffer: (roomId, payload) => request(`/rooms/${roomId}/offers`, { method: 'POST', body: payload }),
  acceptOffer: (roomId, offerId) => request(`/rooms/${roomId}/offers/${offerId}/accept`, { method: 'POST' }),
  rejectOffer: (roomId, offerId) => request(`/rooms/${roomId}/offers/${offerId}/reject`, { method: 'POST' }),

  // AI Assistance
  getAiAnalysis: (roomId) => request(`/rooms/${roomId}/ai/analysis`),
  getAiCompromises: (roomId) => request(`/rooms/${roomId}/ai/compromises`),
  chatAiCopilot: (roomId, query) => request(`/rooms/${roomId}/ai/chat`, { method: 'POST', body: { query } }),

  // Agora Voice
  getAgoraToken: (roomId) => request(`/rooms/${roomId}/agora/token`),

  // Deal Agreement
  getDealAgreement: (roomId) => request(`/rooms/${roomId}/deal`),
  signDeal: (roomId, signatureName) => request(`/rooms/${roomId}/deal/sign`, { method: 'POST', body: { signatureName } }),
  getDealCertificate: (roomId) => request(`/rooms/${roomId}/deal/certificate`),
};

export default api;
