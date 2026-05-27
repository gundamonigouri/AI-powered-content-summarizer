import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const summarizeText = (payload) =>
  api.post('/summarize/text', payload).then((r) => r.data);

export const summarizeUrl = (payload) =>
  api.post('/summarize/url', payload).then((r) => r.data);

export const summarizeFile = (formData) =>
  api
    .post('/summarize/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const getHistory = (limit = 50) =>
  api.get('/history', { params: { limit } }).then((r) => r.data);

export const searchSummaries = (payload) =>
  api.post('/search', payload).then((r) => r.data);

export const deleteHistoryItem = (id) =>
  api.delete(`/history/${id}`).then((r) => r.data);
