import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ResponsesAPI } from '../api/api';

export default function RankScreen() {
  const navigation = useNavigation();
  const { params: { prompt } } = useRoute();
  const [ranks, setRanks] = useState(['', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const setRank = (i, val) => {
    const next = [...ranks];
    next[i] = val;
    setRanks(next);
  };

  const canSubmit = ranks.every((r) => r.trim().length > 0);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data } = await ResponsesAPI.submit(
        prompt.id, ranks[0].trim(), ranks[1].trim(), ranks[2].trim()
      );
      navigation.replace('Share', { prompt, response: data.response, shareText: data.shareText });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{prompt.emoji || '🏆'}</Text>
        <Text style={styles.promptText}>{prompt.full_text}</Text>
      </View>

      {/* Rank inputs */}
      <View style={styles.inputs}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.inputRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{['🥇', '🥈', '🥉'][i]}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={`Your #${i + 1} pick`}
              value={ranks[i]}
              onChangeText={(v) => setRank(i, v)}
              autoFocus={i === 0}
              returnKeyType={i < 2 ? 'next' : 'done'}
              maxLength={60}
            />
          </View>
        ))}
      </View>

      {/* Hint */}
      <Text style={styles.hint}>Submit to see what your friends picked 👀</Text>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
        onPress={submit}
        disabled={!canSubmit || submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>Lock in my picks 🔒</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  emoji: { fontSize: 52, marginBottom: 10 },
  promptText: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#1A1A1A' },
  inputs: { gap: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
  },
  badgeText: { fontSize: 22 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    fontSize: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  hint: { textAlign: 'center', color: '#999', fontSize: 13, marginTop: 24 },
  submitButton: {
    backgroundColor: '#FF6B35', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 20,
  },
  submitDisabled: { backgroundColor: '#ccc' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
