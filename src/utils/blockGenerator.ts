import type {
  TechnicalItem,
  MusicalPassage,
  PracticeBlock,
  PracticeSegment,
  DailyPractice,
  AppSettings,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getDuePassages, getToday } from './srsScheduler';

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
  technical: TechnicalItem[];
  passages: MusicalPassage[];
  fillerPassages: MusicalPassage[]; // For when we run out of due passages
}

// Create a segment from an item
function createSegment(
  item: TechnicalItem | MusicalPassage,
  duration: number,
  order: number
): PracticeSegment {
  return {
    id: generateId(),
    itemId: item.id,
    itemType: item.type,
    duration,
    order,
    title: item.title,
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

  // Track which items we've used in this block to allow re-use for filler
  const passagesUsedThisBlock: MusicalPassage[] = [];

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

    if (item.type === 'passage') {
      passagesUsedThisBlock.push(item);
    }

    return true;
  };

  // Strategy: Interleave technical and passage items
  // Use a weighted random selection favoring due passages
  while (totalDuration < targetBlockDuration - 1) {
    const availablePassages = pool.passages.filter(p => !usedInBlock.has(p.id));
    const availableTechnical = pool.technical.filter(t => !usedInBlock.has(t.id));

    // Calculate weights based on priority
    const passageWeight = availablePassages.length > 0 ? 3 : 0;
    const technicalWeight = availableTechnical.length > 0 ? 2 : 0;
    const fillerWeight =
      passageWeight === 0 && technicalWeight === 0 && passagesUsedThisBlock.length > 0
        ? 1
        : 0;

    const totalWeight = passageWeight + technicalWeight + fillerWeight;

    if (totalWeight === 0) {
      // No items available at all
      break;
    }

    const roll = Math.random() * totalWeight;

    if (roll < passageWeight && availablePassages.length > 0) {
      // Priority 1: Due passage
      const passage = availablePassages[0]; // Already sorted by priority
      pool.passages = pool.passages.filter(p => p.id !== passage.id);
      if (!addSegment(passage)) break;
    } else if (roll < passageWeight + technicalWeight && availableTechnical.length > 0) {
      // Priority 2: Technical item
      const techIndex = Math.floor(Math.random() * availableTechnical.length);
      const tech = availableTechnical[techIndex];
      pool.technical = pool.technical.filter(t => t.id !== tech.id);
      if (!addSegment(tech)) break;
    } else if (fillerWeight > 0) {
      // Priority 3: Filler - repeat passages practiced earlier
      // Reset the "used" status for passages to allow re-use
      const fillerPassage = passagesUsedThisBlock[0];
      passagesUsedThisBlock.push(passagesUsedThisBlock.shift()!); // Rotate
      usedInBlock.delete(fillerPassage.id); // Allow re-use

      // Create segment with modified title to indicate repetition
      const remainingTime = targetBlockDuration - totalDuration;
      const maxDur = Math.min(maxSegmentDuration, remainingTime);
      const minDur = Math.min(minSegmentDuration, remainingTime);

      if (minDur < 1) break;

      const duration = maxDur <= minDur ? minDur : randomDuration(minDur, maxDur);
      const segment: PracticeSegment = {
        id: generateId(),
        itemId: fillerPassage.id,
        itemType: 'passage',
        duration,
        order: order++,
        title: `${fillerPassage.title} (Review)`,
        notes: fillerPassage.notes,
        imageData: fillerPassage.imageData,
      };
      segments.push(segment);
      totalDuration += duration;
    } else {
      // Nothing else to add
      break;
    }
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

  // Get due passages, sorted by priority
  const duePassages = getDuePassages(passages);

  // Create mutable pools for distribution across blocks
  const pool: ItemPool = {
    technical: shuffle([...technicalItems]),
    passages: [...duePassages],
    fillerPassages: [...duePassages], // Backup for when we need fillers
  };

  const blocks: PracticeBlock[] = [];
  const globalUsedSet = new Set<string>(); // Track items used across all blocks

  for (let i = 1; i <= 3; i++) {
    // For each block, allow re-use of technical items but track passages carefully
    const blockUsedSet = new Set<string>();

    // Replenish technical items for each block (they repeat daily)
    if (pool.technical.length < technicalItems.length / 2) {
      pool.technical = shuffle([...technicalItems]);
    }

    const block = generateBlock(i, pool, blockUsedSet, settings);
    blocks.push(block);

    // Merge used items into global set
    blockUsedSet.forEach(id => globalUsedSet.add(id));
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
