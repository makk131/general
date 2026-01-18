import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PracticeSegment } from '../types';
import {
  getCycleDayDescription,
  getCurrentSection,
  getCycleProgress,
  isPracticeDay,
} from '../utils/gebrianCalendar';

interface SegmentCardProps {
  segment: PracticeSegment;
  onAdvance: () => void;
  onAdvanceToNext: () => void;
  onDelete: () => void;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  onAdvance,
  onAdvanceToNext,
  onDelete,
}) => {
  const progress = getCycleProgress(segment.currentDay);
  const isPracticeDayToday = isPracticeDay(segment.currentDay);
  const section = getCurrentSection(segment.currentDay);
  const dayDescription = getCycleDayDescription(segment.currentDay);

  const handleDelete = () => {
    Alert.alert(
      'Delete Segment',
      `Are you sure you want to delete "${segment.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isPracticeDayToday ? ['#667eea', '#764ba2'] : ['#434343', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {segment.name}
          </Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleText}>Cycle {segment.cyclesCompleted + 1}</Text>
            <Text style={styles.sectionText}>{section}</Text>
          </View>
          <Text style={styles.dayDescription}>{dayDescription}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.advanceButton]}
            onPress={onAdvance}
          >
            <Text style={styles.buttonText}>
              {isPracticeDayToday ? '✓ Complete Practice' : 'Next Practice'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={onAdvanceToNext}
          >
            <Text style={styles.buttonText}>Skip to Next →</Text>
          </TouchableOpacity>
        </View>

        {segment.lastPracticeDate && (
          <Text style={styles.lastPractice}>
            Last: {new Date(segment.lastPracticeDate).toLocaleDateString()}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
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
  infoContainer: {
    marginBottom: 12,
  },
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cycleText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  dayDescription: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  advanceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lastPractice: {
    marginTop: 8,
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.6,
    textAlign: 'center',
  },
});
