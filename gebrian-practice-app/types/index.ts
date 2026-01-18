export interface PracticeSegment {
  id: string;
  name: string;
  dateAdded: string; // ISO string
  currentDay: number; // Current day in the Gebrian cycle (0-32)
  cyclesCompleted: number; // How many full cycles completed
  isPerformanceReady: boolean;
  lastPracticeDate: string | null; // ISO string
}

export interface AppState {
  segments: PracticeSegment[];
  lastUpdateDate: string; // ISO string
}

// Gebrian Calendar: 33-day cycle
// Days 0-2: Practice (3 on)
// Day 3: Off (1 off)
// Day 4: Practice (1 on)
// Day 5: Off (1 off)
// Day 6: Practice (1 on)
// Day 7: Off (1 off)
// Days 8-14: Off (week off = 7 days)
// Days 15-17: Practice (3 on)
// Days 18-32: Off (2 weeks off = 15 days)
// Total: 8 practice days per 33-day cycle

export const GEBRIAN_CYCLE_LENGTH = 33;
export const PRACTICE_DAYS = [0, 1, 2, 4, 6, 15, 16, 17];
export const CYCLES_FOR_PERFORMANCE_READY = 3; // After 3 complete cycles, move to performance ready
