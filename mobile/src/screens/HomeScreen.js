import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, ScrollView
} from 'react-native';
import { getTodayPrompt, getFriendsActivity } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [promptData, setPromptData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getTodayPrompt();
      setPromptData(data);
      if (data.hasResponded) {
        const act = await getFriendsActivity(data.prompt.id);
        setActivity(act);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  if (!promptData) {
    return (
      <View style={styles.center}>
        <Text style={styles.noPrompt}>No prompt today. Check back tomorrow! 👀</Text>
      </View>
    );
  }

  const { prompt, hasResponded } = promptData;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      {/* Today's prompt card */}
      <View style={styles.promptCard}>
        <Text style={styles.promptEmoji}>{prompt.emoji || '🏆'}</Text>
        <Text style={styles.promptText}>{prompt.full_text}</Text>

        {!hasResponded ? (
          <TouchableOpacity
            style={styles.rankButton}
            onPress={() => navigation.navigate('Rank', { prompt })}
          >
            <Text style={styles.rankButtonText}>Rank Now →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.rankButton, styles.seeButton]}
            onPress={() => navigation.navigate('Friends', { promptId: prompt.id, prompt })}
          >
            <Text style={styles.rankButtonText}>See Friends' Lists →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Friends activity teaser */}
      {!hasResponded && activity === null && (
        <View style={styles.teaser}>
          <Text style={styles.teaserTitle}>Your friends are ranking...</Text>
          <Text style={styles.teaserSub}>Submit yours to see their lists 👀</Text>
        </View>
      )}

      {hasResponded && activity && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>
            {activity.respondedCount} friend{activity.respondedCount !== 1 ? 's' : ''} responded
          </Text>
          {activity.friends.filter(f => f.hasResponded).slice(0, 4).map(friend => (
            <View key={friend.id} style={styles.friendRow}>
              {friend.profilePicture ? (
                <Image source={{ uri: friend.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>{friend.name[0]}</Text>
                </View>
              )}
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendCheck}>✓</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate('Friends', { promptId: prompt.id, prompt })}
          >
            <Text style={styles.seeAll}>See all responses →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 28 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#1A1A1A' },
  date: { fontSize: 15, color: '#888', marginTop: 4 },
  promptCard: {
    backgroundColor: '#FF6B35', borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  promptEmoji: { fontSize: 52, marginBottom: 12 },
  promptText: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center', lineHeight: 30 },
  rankButton: {
    marginTop: 20, backgroundColor: '#FFF', borderRadius: 30,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  seeButton: { backgroundColor: 'rgba(255,255,255,0.25)' },
  rankButtonText: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  teaser: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
  },
  teaserTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  teaserSub: { fontSize: 14, color: '#888', marginTop: 6 },
  activitySection: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  friendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarPlaceholder: { backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  friendName: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  friendCheck: { fontSize: 16, color: '#4CAF50' },
  seeAll: { fontSize: 14, color: '#FF6B35', fontWeight: '600', marginTop: 8 },
  noPrompt: { fontSize: 17, color: '#888', textAlign: 'center' },
});
