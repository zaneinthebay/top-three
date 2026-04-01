import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginWithFacebook = (accessToken, expoPushToken) =>
  api.post('/auth/facebook', { accessToken, expoPushToken }).then((r) => r.data);

export const updatePushToken = (expoPushToken) =>
  api.post('/auth/push-token', { expoPushToken }).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

// Prompts
export const getTodayPrompt = () =>
  api.get('/prompts/today').then((r) => r.data);

// Responses
export const submitResponse = (promptId, rank1, rank2, rank3) =>
  api.post('/responses', { promptId, rank1, rank2, rank3 }).then((r) => r.data);

export const getFriendsResponses = (promptId) =>
  api.get(`/responses/friends/${promptId}`).then((r) => r.data);

export const getSharedResponse = (token) =>
  api.get(`/responses/share/${token}`).then((r) => r.data);

// Friends
export const getFriends = () =>
  api.get('/friends').then((r) => r.data);

export const getFriendsActivity = (promptId) =>
  api.get(`/friends/activity/${promptId}`).then((r) => r.data);

export default api;
