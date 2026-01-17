import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useApp } from '../../utils/AppContext';
import type { JournalEntry } from '../../types';

const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#0F172A',
  card: '#1E293B',
  cardLight: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
};

export default function JournalScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');

  // Group entries by date
  const groupedEntries = state.journalEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const handleAddEntry = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const today = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: today,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });
    setShowModal(false);
    setContent('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>Practice reflections</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowModal(true);
            }}
          >
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {state.journalEntries.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="journal-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No journal entries yet</Text>
              <Text style={styles.emptySubtext}>
                Reflect on your practice sessions and track your progress
              </Text>
            </View>
          )}

          {sortedDates.map((date, dateIndex) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>

              {groupedEntries[date].map((entry, entryIndex) => (
                <Animated.View
                  key={entry.id}
                  entering={FadeIn.delay((dateIndex * 2 + entryIndex) * 50)}
                  style={styles.entryCard}
                >
                  <LinearGradient
                    colors={[COLORS.card, COLORS.cardLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.entryGradient}
                  >
                    <View style={styles.entryContent}>
                      <View style={styles.entryHeader}>
                        <Ionicons name="document-text" size={20} color={COLORS.primary} />
                        <Text style={styles.entryTime}>
                          {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>

                      <Text style={styles.entryText}>{entry.content}</Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Add Entry Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Journal Entry</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How was your practice today?"
                placeholderTextColor={COLORS.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                autoFocus
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddEntry}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Save Entry</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  dateHeader: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  entryCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  entryGradient: {
    padding: 16,
  },
  entryContent: {
    gap: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTime: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  entryText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
