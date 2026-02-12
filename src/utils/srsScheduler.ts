import type { MusicalPassage } from '../types';
import { SRS_SCHEDULE } from '../types';

// ============================================
// SRS Scheduler - Molly Gebrian Spaced Repetition System
// Schedule: 3on → 1off → 1on → 1off → 1on → 1off → 1on → 7off → 3on → 14off → 3on
// ============================================

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Build a display title from structured passage fields
export function getPassageTitle(passage: MusicalPassage): string {
  const parts: string[] = [];
  if (passage.composer) parts.push(passage.composer);
  if (passage.piece) parts.push(passage.piece);
  if (passage.bars) parts.push(`mm. ${passage.bars}`);
  return parts.join(' — ') || passage.title;
}

// Calculate the next due date for a passage based on its current SRS state
export function calculateNextDueDate(passage: MusicalPassage): string {
  const { srsPhase, lastPracticedDate, startDate } = passage;

  if (srsPhase >= SRS_SCHEDULE.length) {
    // Completed all phases, move to performance bucket
    return '';
  }

  const currentPhase = SRS_SCHEDULE[srsPhase];

  // If it's an "off" phase (daysOn === 0), calculate when next "on" phase starts
  if (currentPhase.daysOn === 0) {
    const baseDate = lastPracticedDate || startDate;
    return addDays(baseDate, currentPhase.daysOff);
  }

  // It's an "on" phase - due every day during this phase
  return lastPracticedDate ? addDays(lastPracticedDate, 1) : startDate;
}

// Check if a passage is due today
export function isPassageDueToday(passage: MusicalPassage): boolean {
  // Initial routine passages are always due
  if (passage.status === 'initial') {
    return true;
  }

  if (passage.status === 'performance') {
    return false;
  }

  const today = getToday();

  // If never practiced, and it's the start date or after, it's due
  if (!passage.lastPracticedDate) {
    return passage.startDate <= today;
  }

  // If already practiced today, not due again
  if (passage.lastPracticedDate === today) {
    return false;
  }

  const currentPhase = SRS_SCHEDULE[passage.srsPhase];

  if (!currentPhase) {
    return false;
  }

  // If it's an "off" phase, check if the off period is complete
  if (currentPhase.daysOn === 0) {
    const daysSinceLastPractice = daysBetween(passage.lastPracticedDate, today);
    return daysSinceLastPractice >= currentPhase.daysOff;
  }

  // It's an "on" phase - check if we still have days left in this phase
  if (passage.phaseDay < currentPhase.daysOn) {
    return true;
  }

  return false;
}

// Advance the passage to the next state after practice
export function advancePassageAfterPractice(passage: MusicalPassage): MusicalPassage {
  const today = getToday();

  // Initial routine passages don't advance through SRS, just track practice
  if (passage.status === 'initial') {
    return {
      ...passage,
      lastPracticedDate: today,
      updatedAt: new Date().toISOString(),
    };
  }

  let { srsPhase, phaseDay } = passage;

  if (srsPhase >= SRS_SCHEDULE.length) {
    // Already completed
    return {
      ...passage,
      status: 'performance',
      completedDate: today,
      lastPracticedDate: today,
      updatedAt: new Date().toISOString(),
    };
  }

  const currentPhase = SRS_SCHEDULE[srsPhase];

  // If it's an "on" phase, increment the day counter
  if (currentPhase.daysOn > 0) {
    phaseDay++;

    // Check if we've completed this phase
    if (phaseDay >= currentPhase.daysOn) {
      srsPhase++;
      phaseDay = 0;

      // Skip any "off" phases (they don't have days to practice)
      while (srsPhase < SRS_SCHEDULE.length && SRS_SCHEDULE[srsPhase].daysOn === 0) {
        srsPhase++;
      }
    }
  } else {
    // Coming back from an "off" phase, move to next
    srsPhase++;
    phaseDay = 0;
  }

  // Check if we've completed all phases
  if (srsPhase >= SRS_SCHEDULE.length) {
    return {
      ...passage,
      srsPhase,
      phaseDay: 0,
      status: 'performance',
      completedDate: today,
      lastPracticedDate: today,
      nextDueDate: undefined,
      updatedAt: new Date().toISOString(),
    };
  }

  const nextDueDate = calculateNextDueDate({
    ...passage,
    srsPhase,
    phaseDay,
    lastPracticedDate: today,
  });

  return {
    ...passage,
    srsPhase,
    phaseDay,
    lastPracticedDate: today,
    nextDueDate,
    updatedAt: new Date().toISOString(),
  };
}

// Advance a passage from initial routine into the Gebrian system
export function advanceToGebrian(passage: MusicalPassage): MusicalPassage {
  const today = getToday();
  return {
    ...passage,
    status: 'active',
    srsPhase: 0,
    phaseDay: 0,
    startDate: today,
    gebriamStartDate: today,
    nextDueDate: today,
    lastPracticedDate: undefined,
    updatedAt: new Date().toISOString(),
  };
}

// Get human-readable phase description
export function getPhaseDescription(passage: MusicalPassage): string {
  if (passage.status === 'initial') {
    return 'Initial Routine';
  }

  if (passage.status === 'performance') {
    return 'Performance Ready';
  }

  if (passage.srsPhase >= SRS_SCHEDULE.length) {
    return 'Completed';
  }

  const phase = SRS_SCHEDULE[passage.srsPhase];
  const phaseNames = [
    'Initial Learning (Day 1-3)',
    'Rest Day',
    'Review Day 1',
    'Rest Day',
    'Review Day 2',
    'Rest Day',
    'Review Day 3',
    'Extended Rest (1 week)',
    'Reinforcement (Day 1-3)',
    'Long Rest (2 weeks)',
    'Final Review (Day 1-3)',
  ];

  const phaseName = phaseNames[passage.srsPhase] || `Phase ${passage.srsPhase + 1}`;

  if (phase.daysOn > 0) {
    return `${phaseName} — Day ${passage.phaseDay + 1}/${phase.daysOn}`;
  }

  return phaseName;
}

// Get a short summary of where the passage is in the Gebrian cycle
export function getGebriamProgress(passage: MusicalPassage): { step: number; totalSteps: number; label: string } {
  if (passage.status === 'initial') {
    return { step: 0, totalSteps: 7, label: 'Initial Routine' };
  }
  if (passage.status === 'performance') {
    return { step: 7, totalSteps: 7, label: 'Performance Ready' };
  }

  // Map SRS phases to user-friendly Gebrian cycle steps:
  // Step 1: Initial 3 days (phases 0)
  // Step 2: Alternating on/off (phases 1-6)
  // Step 3: 1 week rest (phase 7)
  // Step 4: Reinforcement 3 days (phase 8)
  // Step 5: 2 week rest (phase 9)
  // Step 6: Final 3 days (phase 10)
  const phaseToStep: Record<number, { step: number; label: string }> = {
    0: { step: 1, label: '3 days on' },
    1: { step: 2, label: 'Day off' },
    2: { step: 2, label: 'Day on' },
    3: { step: 2, label: 'Day off' },
    4: { step: 2, label: 'Day on' },
    5: { step: 2, label: 'Day off' },
    6: { step: 2, label: 'Day on' },
    7: { step: 3, label: '1 week off' },
    8: { step: 4, label: '3 days on' },
    9: { step: 5, label: '2 weeks off' },
    10: { step: 6, label: '3 days on' },
  };

  const info = phaseToStep[passage.srsPhase] || { step: 6, label: 'Final' };
  return { step: info.step, totalSteps: 7, label: info.label };
}

// Get passages that are due today, sorted by priority
// Only includes active (Gebrian) passages — initial routine and performance
// passages are practiced separately in blocked practice sessions.
export function getDuePassages(passages: MusicalPassage[]): MusicalPassage[] {
  return passages
    .filter(p => p.status === 'active' && isPassageDueToday(p))
    .sort((a, b) => {
      // Prioritize earlier phases (newer learnings need more attention)
      if (a.srsPhase !== b.srsPhase) {
        return a.srsPhase - b.srsPhase;
      }
      // Then by phase day
      if (a.phaseDay !== b.phaseDay) {
        return a.phaseDay - b.phaseDay;
      }
      // Then by start date (older first)
      return a.startDate.localeCompare(b.startDate);
    });
}

// Get passages in the performance bucket
export function getPerformancePassages(passages: MusicalPassage[]): MusicalPassage[] {
  return passages.filter(p => p.status === 'performance');
}

// Create a new passage with initial routine state (or directly as performance ready)
export function createNewPassage(
  composer: string,
  piece: string,
  bars: string,
  notes: string,
  imageData?: string,
  asPerformance: boolean = false
): Omit<MusicalPassage, 'id'> {
  const today = getToday();
  const title = [composer, piece, bars ? `mm. ${bars}` : ''].filter(Boolean).join(' — ');

  if (asPerformance) {
    return {
      type: 'passage',
      title,
      composer,
      piece,
      bars,
      notes,
      imageData,
      status: 'performance',
      srsPhase: SRS_SCHEDULE.length,
      phaseDay: 0,
      startDate: today,
      completedDate: today,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    type: 'passage',
    title,
    composer,
    piece,
    bars,
    notes,
    imageData,
    status: 'initial',
    srsPhase: 0,
    phaseDay: 0,
    startDate: today,
    initialRoutineStartDate: today,
    nextDueDate: today,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
