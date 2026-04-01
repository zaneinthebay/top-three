import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { getFriendsResponses } from '../api/api';

function ResponseCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.profile_picture ? (
          <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{item.name[0]}</Text>
          </View>
        )}
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
      {[item.rank1, item.rank2, item.rank3].map((r, i) => (
        <View key={i} style={styles.rankRow}>
          <View style={[styles.badge, i === 0 && styles.badge1, i === 1 && styles.badge2, i === 2 && styles.badge3]}>
            <Text style={styles.badgeText}>{i + 1}</Text>
          </View>
          <Text style={styles.rankItem}>{r}</Text>
        </View>
      ))}
    </View>
  );
}

export default function FriendsScreen({ route }) {
  const { promptId, prompt } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const result = await getFriendsResponses(promptId);
      setData(result);
    } catch (err) {
      if (err.response?.data?.gated) {
        setError('gated');
      } else {
        setError('error');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  if (error === 'gated') {
    return (
      <View style={styles.center}>
        <Text style={styles.gatedEmoji}>🔒</Text>
        <Text style={styles.gatedTitle}>Submit yours first</Text>
        <Text style={styles.gatedSub}>You'll unlock your friends' lists once you share your own.</Text>
      </View>
    );
  }

  const allResponses = data ? [data.myResponse, ...data.responses] : [];

  return (
    <View style={styles.container}>
      {/* Prompt header */}
      <View style={styles.promptHeader}>
        <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
        <Text style={styles.promptTitle}>{prompt.full_text}</Text>
      </View>

      {/* Trending */}
      {data?.trending?.length > 0 && (
        <View style={styles.trendingBox}>
          <Text style={styles.trendingLabel}>🔥 Trending #1 among friends</Text>
          <Text style={styles.trendingItem}>{data.trending[0]?.item}</Text>
        </View>
      )}

      {/* Responses */}
      <FlatList
        data={allResponses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResponseCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No friends have responded yet. Be the first to share!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  promptHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 48, gap: 12 },
  promptEmoji: { fontSize: 28 },
  promptTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  trendingBox: {
    marginHorizontal: 16, backgroundColor: '#FFF3EE', borderRadius: 12,
    padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
  },
  trendingLabel: { fontSize: 13, color: '#FF6B35', fontWeight: '600', marginRight: 8 },
  trendingItem: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarPlaceholder: { backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontWeight: '700' },
  friendName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: {
    width: 26, height: 26, borderRadius: 6, justifyContent: 'center',
    alignItems: 'center', marginRight: 12, backgroundColor: '#EEE',
  },
  badge1: { backgroundColor: '#FFD700' },
  badge2: { backgroundColor: '#C0C0C0' },
  badge3: { backgroundColor: '#CD7F32' },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  rankItem: { fontSize: 15, color: '#1A1A1A' },
  gatedEmoji: { fontSize: 48, marginBottom: 16 },
  gatedTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  gatedSub: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
  empty: { fontSize: 15, color: '#AAA', textAlign: 'center', marginTop: 40 },
});
