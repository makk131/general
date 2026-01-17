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
import { getPhaseDescription } from '../../utils/srsScheduler';
import type { MusicalPassage } from '../../types';

const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#0F172A',
  card: '#1E293B',
  cardLight: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  passage: '#22C55E',
  performance: '#F59E0B',
};

export default function PassagesScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'active' | 'performance'>('active');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const activePassages = state.passages.filter(p => p.status === 'active');
  const performancePassages = state.passages.filter(p => p.status === 'performance');

  const handleAddPassage = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newPassage: MusicalPassage = {
      id: `passage-${Date.now()}`,
      type: 'passage',
      title: title.trim(),
      notes: notes.trim(),
      status: 'active',
      srsPhase: 0,
      phaseDay: 0,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PASSAGE', payload: newPassage });
    setShowModal(false);
    setTitle('');
    setNotes('');
  };

  const handleSkipPhase = (passageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Skip to Next Phase',
      'Are you sure you want to advance this passage to the next section of the schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'SKIP_PASSAGE_PHASE', payload: passageId });
          },
        },
      ]
    );
  };

  const handleDeletePassage = (passageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete Passage', 'Are you sure you want to delete this passage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_PASSAGE', payload: passageId });
        },
      },
    ]);
  };

  const renderPassage = (passage: MusicalPassage, index: number) => {
    const isPerformance = passage.status === 'performance';
    const phaseDesc = getPhaseDescription(passage);

    return (
      <Animated.View
        key={passage.id}
        entering={FadeIn.delay(index * 50)}
        style={styles.passageCard}
      >
        <LinearGradient
          colors={[COLORS.card, COLORS.cardLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.passageGradient}
        >
          <View
            style={[
              styles.passageColorBar,
              { backgroundColor: isPerformance ? COLORS.performance : COLORS.passage },
            ]}
          />

          <View style={styles.passageContent}>
            <View style={styles.passageHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.passageTitle}>{passage.title}</Text>
                {passage.notes && (
                  <Text style={styles.passageNotes} numberOfLines={2}>
                    {passage.notes}
                  </Text>
                )}
              </View>

              {isPerformance ? (
                <View style={[styles.statusBadge, { backgroundColor: COLORS.performance + '30' }]}>
                  <Ionicons name="star" size={14} color={COLORS.performance} />
                  <Text style={[styles.statusText, { color: COLORS.performance }]}>Ready</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: COLORS.passage + '30' }]}>
                  <Ionicons name="trending-up" size={14} color={COLORS.passage} />
                  <Text style={[styles.statusText, { color: COLORS.passage }]}>Active</Text>
                </View>
              )}
            </View>

            <View style={styles.phaseInfo}>
              <Text style={styles.phaseText}>{phaseDesc}</Text>
              {passage.nextDueDate && (
                <Text style={styles.dueDate}>Due: {passage.nextDueDate}</Text>
              )}
            </View>

            <View style={styles.passageActions}>
              {!isPerformance && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSkipPhase(passage.id)}
                >
                  <Ionicons name="play-skip-forward" size={18} color={COLORS.primary} />
                  <Text style={styles.actionButtonText}>Skip Phase</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeletePassage(passage.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Passages</Text>
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

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, tab === 'active' && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab('active');
            }}
          >
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
              Active ({activePassages.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'performance' && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab('performance');
            }}
          >
            <Text style={[styles.tabText, tab === 'performance' && styles.tabTextActive]}>
              Performance ({performancePassages.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Passages List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {tab === 'active' && activePassages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No active passages yet</Text>
              <Text style={styles.emptySubtext}>Add a passage to start practicing</Text>
            </View>
          )}

          {tab === 'performance' && performancePassages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No performance-ready passages</Text>
              <Text style={styles.emptySubtext}>
                Complete all phases to move passages here
              </Text>
            </View>
          )}

          {tab === 'active' &&
            activePassages.map((passage, index) => renderPassage(passage, index))}

          {tab === 'performance' &&
            performancePassages.map((passage, index) => renderPassage(passage, index))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Add Passage Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Passage</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Passage Title"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddPassage}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Add Passage</Text>
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
  addButton: {
    backgroundColor: COLORS.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary + '40',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.text,
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
  },
  passageCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  passageGradient: {
    flexDirection: 'row',
  },
  passageColorBar: {
    width: 5,
  },
  passageContent: {
    flex: 1,
    padding: 16,
  },
  passageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passageTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  passageNotes: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  phaseInfo: {
    backgroundColor: COLORS.card + '80',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  phaseText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dueDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  passageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '20',
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteButton: {
    flex: 0,
    paddingHorizontal: 15,
    backgroundColor: '#EF444420',
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
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
