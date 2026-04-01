import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RankScreen from './src/screens/RankScreen';
import ShareScreen from './src/screens/ShareScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FAFAF8' },
        headerTintColor: '#1A1A1A',
        headerShadowVisible: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Top Three', headerLargeTitle: true }}
          />
          <Stack.Screen
            name="Rank"
            component={RankScreen}
            options={{ title: 'Your picks', presentation: 'modal' }}
          />
          <Stack.Screen
            name="Share"
            component={ShareScreen}
            options={{ title: '', presentation: 'modal', headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  // Handle notification taps — deep link to Rank screen
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const { promptId } = response.notification.request.content.data || {};
      // Navigation ref could be used here for deep linking
      console.log('Notification tapped, promptId:', promptId);
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
