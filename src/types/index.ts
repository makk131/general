// ============================================
// Core Data Types for Dynamic Practice Orchestrator
// ============================================

// Item Categories
export type ItemType = 'technical' | 'passage';
export type PassageStatus = 'initial' | 'active' | 'performance';

// SRS Phase definitions (Molly Gebrian's spaced repetition system)
// Schedule: 3on → 1off → 1on → 1off → 1on → 1off → 1on → 7off → 3on → 14off → 3on → done
export interface SRSPhase {
  daysOn: number;
  daysOff: number;
}

export const SRS_SCHEDULE: SRSPhase[] = [
  { daysOn: 3, daysOff: 0 },   // Phase 0: First 3 days
  { daysOn: 0, daysOff: 1 },   // Phase 1: 1 day off
  { daysOn: 1, daysOff: 0 },   // Phase 2: Review day 1
  { daysOn: 0, daysOff: 1 },   // Phase 3: 1 day off
  { daysOn: 1, daysOff: 0 },   // Phase 4: Review day 2
  { daysOn: 0, daysOff: 1 },   // Phase 5: 1 day off
  { daysOn: 1, daysOff: 0 },   // Phase 6: Review day 3
  { daysOn: 0, daysOff: 7 },   // Phase 7: 1 week off
  { daysOn: 3, daysOff: 0 },   // Phase 8: Reinforcement 3 days
  { daysOn: 0, daysOff: 14 },  // Phase 9: 2 weeks off
  { daysOn: 3, daysOff: 0 },   // Phase 10: Final 3 days
];

// Base item interface
export interface BaseItem {
  id: string;
  title: string;
  notes: string;
  imageData?: string; // Base64 encoded image
  createdAt: string;
  updatedAt: string;
}

// Technical Item - repeats daily
export interface TechnicalItem extends BaseItem {
  type: 'technical';
}

// Musical Passage - follows SRS schedule
export interface MusicalPassage extends BaseItem {
  type: 'passage';
  status: PassageStatus;
  // Structured identification
  composer: string;
  piece: string; // movement or work name
  bars: string; // bar numbers, e.g. "1-16" or "mm. 32-48"
  // SRS tracking (Gebrian system)
  srsPhase: number; // Current phase in SRS_SCHEDULE
  phaseDay: number; // Current day within the phase (0-indexed)
  startDate: string; // When this passage entered the Gebrian system
  lastPracticedDate?: string;
  nextDueDate?: string;
  completedDate?: string; // When it moved to performance bucket
  initialRoutineStartDate?: string; // When passage was first created (initial routine)
  gebriamStartDate?: string; // When passage entered the Gebrian system
}

export type PracticeItem = TechnicalItem | MusicalPassage;

// ============================================
// Practice Block Types
// ============================================

export interface PracticeSegment {
  id: string;
  itemId: string;
  itemType: ItemType;
  duration: number; // in minutes (2-6)
  order: number;
  // Snapshot of item data at generation time
  title: string;
  notes: string;
  imageData?: string;
}

export interface PracticeBlock {
  id: string;
  blockNumber: number; // 1, 2, or 3
  segments: PracticeSegment[];
  totalDuration: number; // Target ~25 minutes
  generatedDate: string;
  completedSegments: string[]; // IDs of completed segments
  isComplete: boolean;
}

export interface DailyPractice {
  date: string; // YYYY-MM-DD format
  blocks: PracticeBlock[];
  generatedAt: string;
}

// ============================================
// Timer Types
// ============================================

export interface TimerState {
  segmentId: string | null;
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

// ============================================
// Journal Types
// ============================================

export interface JournalEntry {
  id: string;
  date: string;
  blockNumber?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// App State Types
// ============================================

export interface AppState {
  technicalItems: TechnicalItem[];
  passages: MusicalPassage[];
  dailyPractice: DailyPractice | null;
  journalEntries: JournalEntry[];
  settings: AppSettings;
}

export interface AppSettings {
  metronomeBPM: number;
  metronomeBeatsPerMeasure: number;
  targetBlockDuration: number; // in minutes, default 25
  minSegmentDuration: number; // default 2
  maxSegmentDuration: number; // default 6
  lastRestDayDate?: string; // YYYY-MM-DD of last rest day taken
}

export const DEFAULT_SETTINGS: AppSettings = {
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  targetBlockDuration: 25,
  minSegmentDuration: 2,
  maxSegmentDuration: 6,
};

// ============================================
// UI Types
// ============================================

export type TabView = 'practice' | 'technical' | 'passages' | 'journal' | 'settings';

export interface EditModalState {
  isOpen: boolean;
  segment: PracticeSegment | null;
  blockId: string | null;
}
