import type {
  TechnicalItem,
  MusicalPassage,
  PracticeBlock,
  PracticeSegment,
  DailyPractice,
  AppSettings,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getDuePassages, getToday, getPassageTitle, getSchedulablePassages } from './srsScheduler';

// ============================================
// Smart Block Generator Engine
// Creates 3 x 25-minute blocks with intelligent interleaving
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate a random duration between min and max (inclusive)
function randomDuration(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array using Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface ItemPool {
  technical: TechnicalItem[]; // This block's assigned technical items
  passages: MusicalPassage[];
  fillerPassages: MusicalPassage[]; // All active passages for review
}

// Create a segment from an item
function createSegment(
  item: TechnicalItem | MusicalPassage,
  duration: number,
  order: number
): PracticeSegment {
  const title = item.type === 'passage' ? getPassageTitle(item as MusicalPassage) : item.title;
  return {
    id: generateId(),
    itemId: item.id,
    itemType: item.type,
    duration,
    order,
    title,
    notes: item.notes,
    imageData: item.imageData,
  };
}

// Generate a single practice block with intelligent filling
function generateBlock(
  blockNumber: number,
  pool: ItemPool,
  usedInBlock: Set<string>,
  settings: AppSettings
): PracticeBlock {
  const {
    targetBlockDuration,
    minSegmentDuration,
    maxSegmentDuration,
  } = settings;

  const segments: PracticeSegment[] = [];
  let totalDuration = 0;
  let order = 0;

  // Helper to add a segment
  const addSegment = (item: TechnicalItem | MusicalPassage) => {
    const remainingTime = targetBlockDuration - totalDuration;
    const maxDur = Math.min(maxSegmentDuration, remainingTime);
    const minDur = Math.min(minSegmentDuration, remainingTime);

    if (minDur < 1) return false;

    const duration = maxDur <= minDur ? minDur : randomDuration(minDur, maxDur);
    const segment = createSegment(item, duration, order++);
    segments.push(segment);
    totalDuration += duration;
    usedInBlock.add(item.id);

    return true;
  };

  // Helper to add a review passage segment
  const addReviewSegment = (passage: MusicalPassage) => {
    const remainingTime = targetBlockDuration - totalDuration;
    const maxDur = Math.min(maxSegmentDuration, remainingTime);
    const minDur = Math.min(minSegmentDuration, remainingTime);

    if (minDur < 1) return false;

    const duration = maxDur <= minDur ? minDur : randomDuration(minDur, maxDur);
    const segment: PracticeSegment = {
      id: generateId(),
      itemId: passage.id,
      itemType: 'passage',
      duration,
      order: order++,
      title: `${getPassageTitle(passage)} (Review)`,
      notes: passage.notes,
      imageData: passage.imageData,
    };
    segments.push(segment);
    totalDuration += duration;
    return true;
  };

  // Strategy: Interleave this block's assigned technical items (each exactly
  // once) with musical passages. Music fills the majority of time; technical
  // items are spaced out evenly throughout the block.

  // Figure out roughly how many segments we'll have, then space tech items out
  const techItems = [...pool.technical];
  let techPlaced = 0;
  let segmentsSinceTech = 0;
  // Place a tech item roughly every N segments to spread them out
  const totalEstimatedSegments = Math.floor(targetBlockDuration / ((minSegmentDuration + maxSegmentDuration) / 2));
  const techInterval = techItems.length > 0
    ? Math.max(1, Math.floor(totalEstimatedSegments / (techItems.length + 1)))
    : Infinity;

  let fillerIndex = 0;

  while (totalDuration < targetBlockDuration - 1) {
    // Check if it's time to place a technical item
    const shouldPlaceTech = techPlaced < techItems.length && segmentsSinceTech >= techInterval;

    if (shouldPlaceTech) {
      const tech = techItems[techPlaced];
      techPlaced++;
      segmentsSinceTech = 0;
      if (!addSegment(tech)) break;
      continue;
    }

    // Otherwise fill with music
    const availablePassages = pool.passages.filter(p => !usedInBlock.has(p.id));
    const hasFillers = pool.fillerPassages.length > 0;

    if (availablePassages.length > 0) {
      // Due passage first
      const passage = availablePassages[0];
      pool.passages = pool.passages.filter(p => p.id !== passage.id);
      if (!addSegment(passage)) break;
    } else if (hasFillers) {
      // Review passage — rotate through all active passages
      const fillerPassage = pool.fillerPassages[fillerIndex % pool.fillerPassages.length];
      fillerIndex++;
      usedInBlock.delete(fillerPassage.id);
      if (!addReviewSegment(fillerPassage)) break;
    } else if (techPlaced < techItems.length) {
      // Only tech items left, place them
      const tech = techItems[techPlaced];
      techPlaced++;
      segmentsSinceTech = 0;
      if (!addSegment(tech)) break;
      continue;
    } else {
      break;
    }

    segmentsSinceTech++;
  }

  // If block filled before all tech items were placed, append the remaining ones
  while (techPlaced < techItems.length && totalDuration < targetBlockDuration + maxSegmentDuration) {
    const tech = techItems[techPlaced];
    techPlaced++;
    if (!addSegment(tech)) break;
  }

  return {
    id: generateId(),
    blockNumber,
    segments,
    totalDuration,
    generatedDate: getToday(),
    completedSegments: [],
    isComplete: false,
  };
}

// Main function: Generate all 3 daily practice blocks
export function generateDailyPractice(
  technicalItems: TechnicalItem[],
  passages: MusicalPassage[],
  settings: AppSettings = DEFAULT_SETTINGS
): DailyPractice {
  const today = getToday();

  // Get due passages (SRS priority) and all schedulable passages (for review)
  const duePassages = getDuePassages(passages);
  const allSchedulable = getSchedulablePassages(passages);

  // Pre-distribute technical items evenly across 3 blocks (each appears exactly once)
  const shuffledTech = shuffle([...technicalItems]);
  const techPerBlock: TechnicalItem[][] = [[], [], []];
  shuffledTech.forEach((item, i) => {
    techPerBlock[i % 3].push(item);
  });

  // Due passages are shared across blocks (consumed from pool as used)
  const sharedPassagePool = [...duePassages];
  const fillerPool = shuffle([...allSchedulable]);

  const blocks: PracticeBlock[] = [];

  for (let i = 1; i <= 3; i++) {
    const blockUsedSet = new Set<string>();
    const pool: ItemPool = {
      technical: techPerBlock[i - 1],
      passages: sharedPassagePool,
      fillerPassages: fillerPool,
    };

    const block = generateBlock(i, pool, blockUsedSet, settings);
    blocks.push(block);
  }

  return {
    date: today,
    blocks,
    generatedAt: new Date().toISOString(),
  };
}

// Update a segment in a block
export function updateSegment(
  dailyPractice: DailyPractice,
  blockId: string,
  segmentId: string,
  updates: Partial<Pick<PracticeSegment, 'duration' | 'title' | 'notes' | 'imageData'>>
): DailyPractice {
  return {
    ...dailyPractice,
    blocks: dailyPractice.blocks.map(block => {
      if (block.id !== blockId) return block;

      const updatedSegments = block.segments.map(segment => {
        if (segment.id !== segmentId) return segment;
        return { ...segment, ...updates };
      });

      // Recalculate total duration
      const totalDuration = updatedSegments.reduce((sum, s) => sum + s.duration, 0);

      return { ...block, segments: updatedSegments, totalDuration };
    }),
  };
}

// Delete a segment from a block
export function deleteSegment(
  dailyPractice: DailyPractice,
  blockId: string,
  segmentId: string
): DailyPractice {
  return {
    ...dailyPractice,
    blocks: dailyPractice.blocks.map(block => {
      if (block.id !== blockId) return block;

      const updatedSegments = block.segments
        .filter(s => s.id !== segmentId)
        .map((s, idx) => ({ ...s, order: idx }));

      const totalDuration = updatedSegments.reduce((sum, s) => sum + s.duration, 0);

      return {
        ...block,
        segments: updatedSegments,
        totalDuration,
        completedSegments: block.completedSegments.filter(id => id !== segmentId),
      };
    }),
  };
}

// Swap a segment's content with a different item
export function swapSegmentItem(
  dailyPractice: DailyPractice,
  blockId: string,
  segmentId: string,
  newItem: TechnicalItem | MusicalPassage
): DailyPractice {
  return {
    ...dailyPractice,
    blocks: dailyPractice.blocks.map(block => {
      if (block.id !== blockId) return block;

      return {
        ...block,
        segments: block.segments.map(segment => {
          if (segment.id !== segmentId) return segment;
          return {
            ...segment,
            itemId: newItem.id,
            itemType: newItem.type,
            title: newItem.title,
            notes: newItem.notes,
            imageData: newItem.imageData,
          };
        }),
      };
    }),
  };
}

// Mark a segment as completed
export function markSegmentComplete(
  dailyPractice: DailyPractice,
  blockId: string,
  segmentId: string
): DailyPractice {
  return {
    ...dailyPractice,
    blocks: dailyPractice.blocks.map(block => {
      if (block.id !== blockId) return block;

      const completedSegments = [...block.completedSegments, segmentId];
      const isComplete = completedSegments.length === block.segments.length;

      return { ...block, completedSegments, isComplete };
    }),
  };
}

// Check if today's practice needs regeneration
export function needsRegeneration(dailyPractice: DailyPractice | null): boolean {
  if (!dailyPractice) return true;
  return dailyPractice.date !== getToday();
}
