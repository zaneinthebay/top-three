import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PromptsAPI, ResponsesAPI } from '../api/api';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [friendsData, setFriendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await PromptsAPI.getToday();
      setPrompt(data.prompt);
      setHasResponded(data.hasResponded);

      if (data.hasResponded) {
        const { data: fd } = await ResponsesAPI.getFriendsResponses(data.prompt.id);
        setFriendsData(fd);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Today's Prompt Card */}
      <View style={styles.promptCard}>
        <Text style={styles.emoji}>{prompt?.emoji || '🏆'}</Text>
        <Text style={styles.promptText}>{prompt?.full_text}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {!hasResponded ? (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Rank', { prompt })}
        >
          <Text style={styles.ctaText}>Rank Mine 🔥</Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* My response */}
          {friendsData?.myResponse && (
            <View style={styles.myResponse}>
              <Text style={styles.sectionLabel}>Your picks</Text>
              <Text style={styles.rank}>🥇 {friendsData.myResponse.rank1}</Text>
              <Text style={styles.rank}>🥈 {friendsData.myResponse.rank2}</Text>
              <Text style={styles.rank}>🥉 {friendsData.myResponse.rank3}</Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => navigation.navigate('Share', { prompt, response: friendsData.myResponse })}
              >
                <Text style={styles.shareButtonText}>Share my picks 📤</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Trending */}
          {friendsData?.trending?.length > 0 && (
            <View style={styles.trending}>
              <Text style={styles.sectionLabel}>🔥 Trending #1 among friends</Text>
              {friendsData.trending.map((t, i) => (
                <Text key={i} style={styles.trendItem}>
                  {t.item} — {t.count} {t.count === 1 ? 'friend' : 'friends'}
                </Text>
              ))}
            </View>
          )}

          {/* Friends responses */}
          <Text style={styles.sectionLabel}>
            Friends ({friendsData?.responses?.length || 0})
          </Text>
          {friendsData?.responses?.map((r) => (
            <View key={r.id} style={styles.friendCard}>
              <Text style={styles.friendName}>{r.name}</Text>
              <Text style={styles.friendRank}>1. {r.rank1}</Text>
              <Text style={styles.friendRank}>2. {r.rank2}</Text>
              <Text style={styles.friendRank}>3. {r.rank3}</Text>
            </View>
          ))}

          {(!friendsData?.responses || friendsData.responses.length === 0) && (
            <Text style={styles.empty}>No friends have responded yet — share and get them in!</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20 },
  promptCard: {
    backgroundColor: '#FF6B35', borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  promptText: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center' },
  date: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  ctaButton: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 18,
    alignItems: 'center', marginBottom: 20,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  myResponse: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  rank: { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  shareButton: {
    marginTop: 14, backgroundColor: '#F0F0F0', borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  shareButtonText: { fontWeight: '600', fontSize: 15 },
  trending: { backgroundColor: '#FFF9F5', borderRadius: 16, padding: 16, marginBottom: 16 },
  trendItem: { fontSize: 15, marginBottom: 4, fontWeight: '500' },
  friendCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  friendName: { fontWeight: '700', fontSize: 15, marginBottom: 6 },
  friendRank: { fontSize: 14, color: '#555', marginBottom: 2 },
  empty: { color: '#999', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
