/**
 * Centralized API service with automated JWT authentication
 * Ensures all profile, resume, ATS, job matching, and tracking calls
 * are strictly customized and persisted to the logged-in user's MongoDB Atlas account.
 */

export function getAuthToken() {
  try {
    return localStorage.getItem('jobfinder_auth_token') || '';
  } catch (e) {
    return '';
  }
}

export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers
  });
}

export const api = {
  // Authentication & User Profile
  async getMe() {
    const res = await apiFetch('/api/auth/me');
    return res.json();
  },

  async updateProfile(updates) {
    const res = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Resume & ATS Doctor
  async getCandidateProfile() {
    const res = await apiFetch('/api/resume/profile');
    return res.json();
  },

  async uploadResume(formData, groqKey = '') {
    const headers = {};
    if (groqKey) headers['x-groq-api-key'] = groqKey;
    const res = await apiFetch('/api/resume/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    return res.json();
  },

  async parseResumeText(text, targetRole = '', groqKey = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (groqKey) headers['x-groq-api-key'] = groqKey;
    const res = await apiFetch('/api/resume/parse-text', {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, targetRole })
    });
    return res.json();
  },

  async saveManualProfile(profileData, groqKey = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (groqKey) headers['x-groq-api-key'] = groqKey;
    const res = await apiFetch('/api/resume/manual-profile', {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async analyzeAts(targetRole, resumeText = '', groqKey = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (groqKey) headers['x-groq-api-key'] = groqKey;
    const res = await apiFetch('/api/resume/analyze-ats', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetRole, resumeText })
    });
    return res.json();
  },

  // Jobs & Bookmarks
  async getJobs(queryString) {
    const res = await apiFetch(`/api/jobs?${queryString}`);
    return res.json();
  },

  async refreshJobs(payload) {
    const res = await apiFetch('/api/jobs/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getSavedJobs() {
    const res = await apiFetch('/api/jobs/saved');
    return res.json();
  },

  async toggleSaveJob(job) {
    const res = await apiFetch('/api/jobs/toggle-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job })
    });
    return res.json();
  },

  // Application Tracker
  async getApplications() {
    const res = await apiFetch('/api/tracker');
    return res.json();
  },

  async addApplication(appData) {
    const res = await apiFetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return res.json();
  },

  async updateApplication(id, updates) {
    const res = await apiFetch(`/api/tracker/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteApplication(id) {
    const res = await apiFetch(`/api/tracker/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

export default api;
