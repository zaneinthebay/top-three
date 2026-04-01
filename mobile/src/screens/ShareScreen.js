import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ShareScreen() {
  const navigation = useNavigation();
  const { params: { prompt, response, shareText: propShareText } } = useRoute();

  const shareText = propShareText || (
    `${prompt.emoji || '🏆'} My top 3 ${prompt.text}:\n` +
    `1. ${response.rank1}\n` +
    `2. ${response.rank2}\n` +
    `3. ${response.rank3}\n\n` +
    `What are yours? Submit to see mine 👇\n` +
    `https://topthree.app/share/${response.share_token}`
  );

  const handleShare = async () => {
    try {
      await Share.share({ message: shareText });
    } catch (err) {
      Alert.alert('Error', 'Could not open share sheet');
    }
  };

  return (
    <View style={styles.container}>
      {/* Share card */}
      <View style={styles.card}>
        <Text style={styles.emoji}>{prompt.emoji || '🏆'}</Text>
        <Text style={styles.topLabel}>My top 3 {prompt.text}</Text>
        <View style={styles.picks}>
          <Text style={styles.pick}>🥇 {response.rank1}</Text>
          <Text style={styles.pick}>🥈 {response.rank2}</Text>
          <Text style={styles.pick}>🥉 {response.rank3}</Text>
        </View>
        <Text style={styles.cta}>Submit yours to see mine 👇</Text>
        <Text style={styles.url}>topthree.app</Text>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share with friends 📤</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.seeFriendsButton}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.seeFriendsText}>See friends' picks →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 24, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#FF6B35', borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%', marginBottom: 24,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  topLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  picks: { marginTop: 16, width: '100%', gap: 8 },
  pick: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cta: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 20 },
  url: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  shareButton: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 18,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  shareButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  seeFriendsButton: {
    borderRadius: 16, padding: 16, width: '100%', alignItems: 'center',
  },
  seeFriendsText: { color: '#FF6B35', fontSize: 16, fontWeight: '600' },
});
