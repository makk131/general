import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useApp } from '../../utils/AppContext';
import type { PracticeBlock, PracticeSegment } from '../../types';

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
  tech: '#3B82F6',
  passage: '#22C55E',
};

export default function PracticeScreen() {
  const { state, dispatch } = useApp();
  const [selectedBlock, setSelectedBlock] = useState(1);

  const currentBlock = state.dailyPractice?.blocks.find(b => b.blockNumber === selectedBlock);

  const handleCompleteSegment = (blockId: string, segment: PracticeSegment) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({
      type: 'COMPLETE_SEGMENT',
      payload: { blockId, segmentId: segment.id, itemId: segment.itemId },
    });
  };

  const handleRegenerate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'GENERATE_DAILY_PRACTICE' });
  };

  if (state.isLoading) {
    return (
      <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!state.dailyPractice) {
    return (
      <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-note" size={80} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Practice Yet</Text>
            <Text style={styles.emptyText}>
              Add some technical items or passages to generate your daily practice
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.background, '#1E1B4B']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Practice</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Block Selector */}
        <View style={styles.blockSelector}>
          {[1, 2, 3].map(num => {
            const block = state.dailyPractice?.blocks.find(b => b.blockNumber === num);
            const isSelected = selectedBlock === num;
            const isComplete = block?.isComplete || false;

            return (
              <TouchableOpacity
                key={num}
                style={[styles.blockTab, isSelected && styles.blockTabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedBlock(num);
                }}
              >
                {isComplete && (
                  <View style={styles.completeBadge}>
                    <Ionicons name="checkmark" size={12} color={COLORS.success} />
                  </View>
                )}
                <Text style={[styles.blockTabText, isSelected && styles.blockTabTextActive]}>
                  Block {num}
                </Text>
                <Text style={[styles.blockDuration, isSelected && styles.blockDurationActive]}>
                  {block?.totalDuration || 0} min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Segments List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {currentBlock?.segments.map((segment, index) => {
            const isCompleted = currentBlock.completedSegments.includes(segment.id);
            const color = segment.itemType === 'technical' ? COLORS.tech : COLORS.passage;

            return (
              <Animated.View
                key={segment.id}
                entering={FadeIn.delay(index * 50)}
                style={styles.segmentCard}
              >
                <LinearGradient
                  colors={[COLORS.card, COLORS.cardLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.segmentGradient}
                >
                  <View style={[styles.segmentColorBar, { backgroundColor: color }]} />

                  <View style={styles.segmentContent}>
                    <View style={styles.segmentHeader}>
                      <Text style={styles.segmentTitle}>{segment.title}</Text>
                      <View style={[styles.durationBadge, { backgroundColor: color + '30' }]}>
                        <Ionicons name="time-outline" size={14} color={color} />
                        <Text style={[styles.durationText, { color }]}>{segment.duration}m</Text>
                      </View>
                    </View>

                    {segment.notes && (
                      <Text style={styles.segmentNotes} numberOfLines={2}>
                        {segment.notes}
                      </Text>
                    )}

                    <View style={styles.segmentFooter}>
                      <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.typeText, { color }]}>
                          {segment.itemType === 'technical' ? 'Technical' : 'Passage'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.completeButton,
                          isCompleted && styles.completeButtonActive,
                        ]}
                        onPress={() => !isCompleted && handleCompleteSegment(currentBlock.id, segment)}
                      >
                        {isCompleted ? (
                          <>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                            <Text style={styles.completeButtonTextActive}>Complete</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={18}
                              color={COLORS.textMuted}
                            />
                            <Text style={styles.completeButtonText}>Mark Complete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}

          <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.regenerateText}>Regenerate Blocks</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  blockSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  blockTab: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  blockTabActive: {
    backgroundColor: COLORS.primary + '40',
  },
  completeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.success + '30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockTabTextActive: {
    color: COLORS.text,
  },
  blockDuration: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  blockDurationActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  segmentCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentGradient: {
    flexDirection: 'row',
  },
  segmentColorBar: {
    width: 5,
  },
  segmentContent: {
    flex: 1,
    padding: 16,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  segmentTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentNotes: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  segmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeButtonActive: {
    opacity: 1,
  },
  completeButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButtonTextActive: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  regenerateText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});
