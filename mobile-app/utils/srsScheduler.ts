import type { MusicalPassage } from '../types';
import { SRS_SCHEDULE } from '../types';

// ============================================
// SRS Scheduler - Handles Spaced Repetition Logic
// Schedule: 3 on → 1 off → 1 on → 1 off → 1 on → 7 off → 3 on → 14 off → 3 on
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

// NEW: Skip to next phase manually (user requested feature)
export function skipToNextPhase(passage: MusicalPassage): MusicalPassage {
  const today = getToday();
  let { srsPhase, phaseDay } = passage;

  if (srsPhase >= SRS_SCHEDULE.length) {
    return passage;
  }

  const currentPhase = SRS_SCHEDULE[srsPhase];

  // If in an "on" phase, complete it immediately
  if (currentPhase.daysOn > 0) {
    phaseDay = currentPhase.daysOn;
    srsPhase++;
    phaseDay = 0;

    // Skip any "off" phases
    while (srsPhase < SRS_SCHEDULE.length && SRS_SCHEDULE[srsPhase].daysOn === 0) {
      srsPhase++;
    }
  } else {
    // If in an "off" phase, skip to next "on" phase
    srsPhase++;
    phaseDay = 0;
    while (srsPhase < SRS_SCHEDULE.length && SRS_SCHEDULE[srsPhase].daysOn === 0) {
      srsPhase++;
    }
  }

  // Check if completed
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

// Get human-readable phase description
export function getPhaseDescription(passage: MusicalPassage): string {
  if (passage.status === 'performance') {
    return 'Performance Ready';
  }

  if (passage.srsPhase >= SRS_SCHEDULE.length) {
    return 'Completed';
  }

  const phase = SRS_SCHEDULE[passage.srsPhase];
  const phaseNames = [
    'Initial Learning (Day 1-3)',
    'Rest Day 1',
    'Review Day 1',
    'Rest Day 2',
    'Review Day 2',
    'Extended Rest (7 days)',
    'Reinforcement (Day 1-3)',
    'Long-term Rest (14 days)',
    'Final Review (Day 1-3)',
  ];

  const phaseName = phaseNames[passage.srsPhase] || `Phase ${passage.srsPhase + 1}`;

  if (phase.daysOn > 0) {
    return `${phaseName} - Day ${passage.phaseDay + 1}/${phase.daysOn}`;
  }

  return phaseName;
}

// Get passages that are due today, sorted by priority
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

// Create a new passage with initial SRS state
export function createNewPassage(
  title: string,
  notes: string,
  imageData?: string
): Omit<MusicalPassage, 'id'> {
  const today = getToday();
  return {
    type: 'passage',
    title,
    notes,
    imageData,
    status: 'active',
    srsPhase: 0,
    phaseDay: 0,
    startDate: today,
    nextDueDate: today,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
