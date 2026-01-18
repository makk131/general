import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PracticeSegment } from '../types';
import {
  loadAppState,
  updateSegment,
  deleteSegment as deleteSegmentFromStorage,
} from '../utils/storage';
import { advanceSegment, advanceToNextSection } from '../utils/gebrianCalendar';
import { SegmentCard } from '../components/SegmentCard';
import { CalendarVisualization } from '../components/CalendarVisualization';

export const HomeScreen = ({ navigation }: any) => {
  const [segments, setSegments] = useState<PracticeSegment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSegments = async () => {
    const state = await loadAppState();
    const activeSegments = state.segments.filter(seg => !seg.isPerformanceReady);
    setSegments(activeSegments);
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

  const handleAdvance = async (segment: PracticeSegment) => {
    const updatedSegment = advanceSegment(segment);
    await updateSegment(updatedSegment);
    await loadSegments();
  };

  const handleAdvanceToNext = async (segment: PracticeSegment) => {
    const updatedSegment = advanceToNextSection(segment);
    await updateSegment(updatedSegment);
    await loadSegments();
  };

  const handleDelete = async (segmentId: string) => {
    await deleteSegmentFromStorage(segmentId);
    await loadSegments();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Practice Segments</Text>
      <Text style={styles.headerSubtitle}>
        {segments.length} active {segments.length === 1 ? 'segment' : 'segments'}
      </Text>

      <CalendarVisualization />

      {segments.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active segments</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button below to add your first practice segment
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#f0f4f8', '#d9e2ec']}
        style={styles.gradient}
      >
        <FlatList
          data={segments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SegmentCard
              segment={item}
              onAdvance={() => handleAdvance(item)}
              onAdvanceToNext={() => handleAdvanceToNext(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddSegment')}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
});
