import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Alert
} from 'react-native';

export default function ShareScreen({ route, navigation }) {
  const { prompt, response, shareText } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareText,
        title: `My Top 3 ${prompt.text}`,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not share');
    }
  };

  const handleSeeFriends = () => {
    navigation.replace('Friends', { promptId: prompt.id, prompt });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your list is in! {prompt.emoji}</Text>

      {/* Result card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Top 3 {prompt.text}</Text>
        {[response.rank1, response.rank2, response.rank3].map((item, i) => (
          <View key={i} style={styles.rankRow}>
            <View style={[styles.badge, i === 0 && styles.badge1, i === 1 && styles.badge2, i === 2 && styles.badge3]}>
              <Text style={styles.badgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.rankItem}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Share prompt */}
      <Text style={styles.sharePrompt}>
        Share with friends so they can see yours — but only after they submit theirs 😏
      </Text>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share My List 📤</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.friendsButton} onPress={handleSeeFriends}>
        <Text style={styles.friendsButtonText}>See Friends' Lists →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 28 },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    marginBottom: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badge: {
    width: 32, height: 32, borderRadius: 8, justifyContent: 'center',
    alignItems: 'center', marginRight: 14, backgroundColor: '#EEE',
  },
  badge1: { backgroundColor: '#FFD700' },
  badge2: { backgroundColor: '#C0C0C0' },
  badge3: { backgroundColor: '#CD7F32' },
  badgeText: { fontWeight: '800', fontSize: 14, color: '#FFF' },
  rankItem: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  sharePrompt: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  shareButton: {
    backgroundColor: '#FF6B35', borderRadius: 16, padding: 18,
    alignItems: 'center', marginBottom: 12,
  },
  shareButtonText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  friendsButton: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#FF6B35',
  },
  friendsButtonText: { fontSize: 17, fontWeight: '700', color: '#FF6B35' },
});
