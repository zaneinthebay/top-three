import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthAPI = {
  loginWithFacebook: (accessToken, expoPushToken) =>
    api.post('/auth/facebook', { accessToken, expoPushToken }),
  updatePushToken: (expoPushToken) =>
    api.post('/auth/push-token', { expoPushToken }),
  getMe: () => api.get('/auth/me'),
};

export const PromptsAPI = {
  getToday: () => api.get('/prompts/today'),
};

export const ResponsesAPI = {
  submit: (promptId, rank1, rank2, rank3) =>
    api.post('/responses', { promptId, rank1, rank2, rank3 }),
  getFriendsResponses: (promptId) =>
    api.get(`/responses/friends/${promptId}`),
  getByShareToken: (token) =>
    api.get(`/responses/share/${token}`),
};

export const FriendsAPI = {
  getFriends: () => api.get('/friends'),
};

export default api;
