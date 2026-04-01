import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
    } catch (err) {
      if (err.message !== 'Facebook login cancelled') {
        Alert.alert('Login failed', 'Something went wrong. Please try again.');
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
        Every day, one question.{'\n'}Three answers. Infinite debates.
      </Text>

      <TouchableOpacity style={styles.fbButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.fbButtonText}>Continue with Facebook</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        We use Facebook to connect you with friends who also use Top Three.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FF6B35',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  logo: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 40, fontWeight: '900', color: '#FFF', marginBottom: 12 },
  subtitle: {
    fontSize: 18, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 26, marginBottom: 48,
  },
  fbButton: {
    backgroundColor: '#1877F2', borderRadius: 16, paddingVertical: 18,
    paddingHorizontal: 40, width: '100%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  fbButtonText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  disclaimer: {
    fontSize: 12, color: 'rgba(255,255,255,0.6)',
    textAlign: 'center', marginTop: 20, lineHeight: 18,
  },
});
