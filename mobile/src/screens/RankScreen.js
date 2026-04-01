import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { submitResponse } from '../api/api';

export default function RankScreen({ route, navigation }) {
  const { prompt } = route.params;
  const [ranks, setRanks] = useState(['', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const updateRank = (index, value) => {
    const updated = [...ranks];
    updated[index] = value;
    setRanks(updated);
  };

  const handleSubmit = async () => {
    if (ranks.some(r => !r.trim())) {
      Alert.alert('Hold on', 'Fill in all three spots before submitting!');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitResponse(prompt.id, ranks[0].trim(), ranks[1].trim(), ranks[2].trim());
      navigation.replace('Share', {
        prompt,
        response: result.response,
        shareText: result.shareText,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Prompt */}
        <View style={styles.promptHeader}>
          <Text style={styles.emoji}>{prompt.emoji || '🏆'}</Text>
          <Text style={styles.promptText}>{prompt.full_text}</Text>
        </View>

        {/* Rank inputs */}
        <View style={styles.rankList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.rankRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.rankInput}
                placeholder={i === 0 ? 'Your top pick...' : i === 1 ? 'Second best...' : 'Third place...'}
                placeholderTextColor="#BBB"
                value={ranks[i]}
                onChangeText={(v) => updateRank(i, v)}
                returnKeyType={i < 2 ? 'next' : 'done'}
                autoCapitalize="words"
              />
            </View>
          ))}
        </View>

        <Text style={styles.hint}>Be honest — your friends will see this! 😅</Text>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Submit My Top 3 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, padding: 24, paddingTop: 48 },
  promptHeader: { alignItems: 'center', marginBottom: 36 },
  emoji: { fontSize: 56, marginBottom: 12 },
  promptText: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', lineHeight: 30 },
  rankList: { marginBottom: 20 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14, marginBottom: 12,
    padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  rankBadge: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginLeft: 4,
  },
  rankNumber: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  rankInput: { flex: 1, fontSize: 16, color: '#1A1A1A', paddingHorizontal: 16, paddingVertical: 14 },
  hint: { fontSize: 13, color: '#AAA', textAlign: 'center', marginBottom: 28 },
  submitButton: {
    backgroundColor: '#FF6B35', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
});
