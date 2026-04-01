import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Facebook from 'expo-facebook';
import * as Notifications from 'expo-notifications';
import { AuthAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        try {
          const { data } = await AuthAPI.getMe();
          setUser(data);
        } catch {
          await SecureStore.deleteItemAsync('auth_token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const loginWithFacebook = async () => {
    await Facebook.initializeAsync({ appId: 'YOUR_FACEBOOK_APP_ID' });
    const result = await Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile', 'user_friends'],
    });

    if (result.type !== 'success') throw new Error('Facebook login cancelled');

    // Get Expo push token
    let expoPushToken = null;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        expoPushToken = tokenData.data;
      }
    } catch {}

    const { data } = await AuthAPI.loginWithFacebook(result.token, expoPushToken);
    await SecureStore.setItemAsync('auth_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await Facebook.logOutAsync();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
