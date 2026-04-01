import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Facebook from 'expo-facebook';
import * as Notifications from 'expo-notifications';
import { loginWithFacebook, updatePushToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on launch
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const userJson = await SecureStore.getItemAsync('user');
        if (token && userJson) setUser(JSON.parse(userJson));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const signIn = async () => {
    await Facebook.initializeAsync({ appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID });
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

    const { token, user: userData } = await loginWithFacebook(result.token, expoPushToken);

    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await Facebook.logOutAsync();
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
