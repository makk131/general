import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PracticeSegment } from '../types';
import {
  loadAppState,
  deleteSegment as deleteSegmentFromStorage,
} from '../utils/storage';

export const PerformanceReadyScreen = () => {
  const [segments, setSegments] = useState<PracticeSegment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSegments = async () => {
    const state = await loadAppState();
    const performanceReady = state.segments.filter(seg => seg.isPerformanceReady);
    setSegments(performanceReady);
  };

  useFocusEffect(
    useCallback(() => {
      loadSegments();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSegments();
    setRefreshing(false);
  };

  const handleDelete = async (segment: PracticeSegment) => {
    Alert.alert(
      'Remove Segment',
      `Remove "${segment.name}" from Performance Ready?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteSegmentFromStorage(segment.id);
            await loadSegments();
          },
        },
      ]
    );
  };

  const renderSegment = ({ item }: { item: PracticeSegment }) => (
    <View style={styles.segmentCard}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.badge}>✓ READY</Text>
            <Text style={styles.segmentName}>{item.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.cyclesCompleted}</Text>
            <Text style={styles.statLabel}>Cycles Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {item.dateAdded
                ? Math.floor(
                    (new Date().getTime() - new Date(item.dateAdded).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0}
            </Text>
            <Text style={styles.statLabel}>Days in Training</Text>
          </View>
        </View>

        {item.lastPracticeDate && (
          <Text style={styles.lastPractice}>
            Last practiced: {new Date(item.lastPracticeDate).toLocaleDateString()}
          </Text>
        )}
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Performance Ready</Text>
      <Text style={styles.headerSubtitle}>
        {segments.length} {segments.length === 1 ? 'segment' : 'segments'} ready
        for performance
      </Text>

      {segments.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <Text style={styles.emptyText}>No performance-ready segments yet</Text>
          <Text style={styles.emptySubtext}>
            Segments automatically move here after completing 3 full Gebrian cycles
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#ecfdf5', '#d1fae5']}
        style={styles.gradient}
      >
        <FlatList
          data={segments}
          keyExtractor={(item) => item.id}
          renderItem={renderSegment}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#047857',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  segmentCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  segmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  lastPractice: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
});
