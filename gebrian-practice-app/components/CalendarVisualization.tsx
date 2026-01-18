import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PRACTICE_DAYS, GEBRIAN_CYCLE_LENGTH } from '../types';

interface CalendarVisualizationProps {
  currentDay?: number;
}

export const CalendarVisualization: React.FC<CalendarVisualizationProps> = ({
  currentDay,
}) => {
  const renderDay = (day: number) => {
    const isPractice = PRACTICE_DAYS.includes(day);
    const isCurrent = day === currentDay;

    return (
      <View
        key={day}
        style={[
          styles.dayContainer,
          isPractice && styles.practiceDay,
          isCurrent && styles.currentDay,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            isPractice && styles.practiceDayText,
            isCurrent && styles.currentDayText,
          ]}
        >
          {day + 1}
        </Text>
      </View>
    );
  };

  const renderWeek = (startDay: number, endDay: number, label: string) => {
    const days = [];
    for (let i = startDay; i <= endDay; i++) {
      days.push(renderDay(i));
    }

    return (
      <View key={label} style={styles.weekContainer}>
        <Text style={styles.weekLabel}>{label}</Text>
        <View style={styles.daysRow}>{days}</View>
      </View>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Gebrian Calendar Pattern</Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.practiceDay]} />
            <Text style={styles.legendText}>Practice</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.restDay]} />
            <Text style={styles.legendText}>Rest</Text>
          </View>
          {currentDay !== undefined && (
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.currentDay]} />
              <Text style={styles.legendText}>Current</Text>
            </View>
          )}
        </View>

        {renderWeek(0, 2, '3 Practice Days')}
        {renderWeek(3, 3, 'Rest Day')}
        {renderWeek(4, 4, '1 Practice Day')}
        {renderWeek(5, 5, 'Rest Day')}
        {renderWeek(6, 6, '1 Practice Day')}
        {renderWeek(7, 14, 'Week Rest')}
        {renderWeek(15, 17, '3 Practice Days')}
        {renderWeek(18, 32, 'Two-Week Rest')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minWidth: 600,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  weekContainer: {
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceDay: {
    backgroundColor: '#667eea',
  },
  restDay: {
    backgroundColor: '#e0e0e0',
  },
  currentDay: {
    backgroundColor: '#f59e0b',
    borderWidth: 2,
    borderColor: '#d97706',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  practiceDayText: {
    color: '#ffffff',
  },
  currentDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
