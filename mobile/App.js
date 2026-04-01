import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RankScreen from './src/screens/RankScreen';
import ShareScreen from './src/screens/ShareScreen';
import FriendsScreen from './src/screens/FriendsScreen';

// Handle push notifications when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FAFAFA' },
        headerTintColor: '#FF6B35',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Top Three', headerLargeTitle: true }} />
          <Stack.Screen name="Rank" component={RankScreen} options={{ title: 'Your Picks' }} />
          <Stack.Screen name="Share" component={ShareScreen} options={{ title: 'Done!', headerBackVisible: false }} />
          <Stack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends\' Lists' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Listen for notification taps — navigate to today's prompt
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Navigation from notification taps can be wired up here
      console.log('Notification tapped:', response.notification.request.content.data);
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
