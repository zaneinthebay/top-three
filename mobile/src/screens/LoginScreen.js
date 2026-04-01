import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { loginWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithFacebook();
    } catch (err) {
      if (err.message !== 'Facebook login cancelled') {
        Alert.alert('Login failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏆</Text>
      <Text style={styles.title}>Top Three</Text>
      <Text style={styles.subtitle}>
        Every day, one question.{'\n'}Your top 3 anything.
      </Text>

      <View style={styles.examples}>
        <Text style={styles.example}>🧀 Top 3 cheeses</Text>
        <Text style={styles.example}>🎬 Top 3 movies of all time</Text>
        <Text style={styles.example}>✈️ Top 3 travel destinations</Text>
      </View>

      <TouchableOpacity style={styles.fbButton} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.fbButtonText}>Continue with Facebook</Text>
        }
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        We use Facebook to connect you with friends who also use the app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FAFAF8', alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  logo: { fontSize: 72, marginBottom: 12 },
  title: { fontSize: 38, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  subtitle: {
    fontSize: 18, color: '#666', textAlign: 'center', lineHeight: 26, marginBottom: 36,
  },
  examples: { gap: 10, marginBottom: 48, alignItems: 'flex-start' },
  example: { fontSize: 16, color: '#444', fontWeight: '500' },
  fbButton: {
    backgroundColor: '#1877F2', borderRadius: 16, padding: 18,
    width: '100%', alignItems: 'center', marginBottom: 16,
  },
  fbButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  disclaimer: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18 },
});
