import {
  PracticeSegment,
  GEBRIAN_CYCLE_LENGTH,
  PRACTICE_DAYS,
  CYCLES_FOR_PERFORMANCE_READY,
} from '../types';

/**
 * Check if a given day in the cycle is a practice day
 */
export const isPracticeDay = (day: number): boolean => {
  return PRACTICE_DAYS.includes(day);
};

/**
 * Get the next practice day from the current day
 */
export const getNextPracticeDay = (currentDay: number): number => {
  for (let i = 1; i <= GEBRIAN_CYCLE_LENGTH; i++) {
    const nextDay = (currentDay + i) % GEBRIAN_CYCLE_LENGTH;
    if (isPracticeDay(nextDay)) {
      return nextDay;
    }
  }
  return currentDay; // Fallback (should never happen)
};

/**
 * Calculate how many days until the next practice day
 */
export const daysUntilNextPractice = (currentDay: number): number => {
  if (isPracticeDay(currentDay)) return 0;

  for (let i = 1; i <= GEBRIAN_CYCLE_LENGTH; i++) {
    const nextDay = (currentDay + i) % GEBRIAN_CYCLE_LENGTH;
    if (isPracticeDay(nextDay)) {
      return i;
    }
  }
  return 0;
};

/**
 * Advance a segment to the next practice day
 */
export const advanceSegment = (segment: PracticeSegment): PracticeSegment => {
  const nextDay = getNextPracticeDay(segment.currentDay);
  let cyclesCompleted = segment.cyclesCompleted;

  // If we wrapped around (nextDay is less than currentDay), increment cycle count
  if (nextDay < segment.currentDay || (segment.currentDay === 17 && nextDay === 0)) {
    cyclesCompleted++;
  }

  // Check if segment is ready for performance
  const isPerformanceReady = cyclesCompleted >= CYCLES_FOR_PERFORMANCE_READY;

  return {
    ...segment,
    currentDay: nextDay,
    cyclesCompleted,
    isPerformanceReady,
    lastPracticeDate: new Date().toISOString(),
  };
};

/**
 * Advance a segment to the next section (skip rest days within current section)
 * This allows users to manually advance if they don't need all 3 practice days
 */
export const advanceToNextSection = (segment: PracticeSegment): PracticeSegment => {
  const currentDay = segment.currentDay;
  let nextDay = currentDay;
  let cyclesCompleted = segment.cyclesCompleted;

  // Determine current section and jump to next section
  if (currentDay <= 2) {
    // In first 3-day section, jump to day 4 (next 1-day section)
    nextDay = 4;
  } else if (currentDay === 4) {
    // In second 1-day section, jump to day 6 (next 1-day section)
    nextDay = 6;
  } else if (currentDay === 6) {
    // In third 1-day section, jump to day 15 (final 3-day section)
    nextDay = 15;
  } else if (currentDay >= 15 && currentDay <= 17) {
    // In final 3-day section, jump to start of next cycle
    nextDay = 0;
    cyclesCompleted++;
  } else {
    // In rest period, find next practice day
    nextDay = getNextPracticeDay(currentDay);
    if (nextDay < currentDay) {
      cyclesCompleted++;
    }
  }

  const isPerformanceReady = cyclesCompleted >= CYCLES_FOR_PERFORMANCE_READY;

  return {
    ...segment,
    currentDay: nextDay,
    cyclesCompleted,
    isPerformanceReady,
    lastPracticeDate: new Date().toISOString(),
  };
};

/**
 * Get a human-readable description of the current position in the cycle
 */
export const getCycleDayDescription = (day: number): string => {
  if (day >= 0 && day <= 2) return `Day ${day + 1} of 3`;
  if (day === 3) return 'Rest Day';
  if (day === 4) return 'Single Practice Day';
  if (day === 5) return 'Rest Day';
  if (day === 6) return 'Single Practice Day';
  if (day === 7) return 'Rest Day';
  if (day >= 8 && day <= 14) return `Week Off (Day ${day - 7}/7)`;
  if (day >= 15 && day <= 17) return `Day ${day - 14} of 3`;
  if (day >= 18 && day <= 32) return `2-Week Off (Day ${day - 17}/15)`;
  return 'Unknown';
};

/**
 * Get the current section name
 */
export const getCurrentSection = (day: number): string => {
  if (day >= 0 && day <= 2) return 'First 3-Day Practice';
  if (day === 3) return 'Rest Day';
  if (day === 4) return 'Single Practice';
  if (day === 5) return 'Rest Day';
  if (day === 6) return 'Single Practice';
  if (day >= 7 && day <= 14) return 'Week Rest';
  if (day >= 15 && day <= 17) return 'Final 3-Day Practice';
  if (day >= 18) return 'Two-Week Rest';
  return 'Rest';
};

/**
 * Calculate progress percentage through the cycle
 */
export const getCycleProgress = (day: number): number => {
  return (day / GEBRIAN_CYCLE_LENGTH) * 100;
};

/**
 * Get number of practice days completed in current cycle
 */
export const getPracticeDaysCompleted = (currentDay: number): number => {
  return PRACTICE_DAYS.filter(d => d < currentDay).length;
};

/**
 * Create a new practice segment
 */
export const createSegment = (name: string): PracticeSegment => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    dateAdded: new Date().toISOString(),
    currentDay: 0,
    cyclesCompleted: 0,
    isPerformanceReady: false,
    lastPracticeDate: null,
  };
};
