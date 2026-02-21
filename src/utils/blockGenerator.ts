import type {
  TechnicalItem,
  MusicalPassage,
  PracticeBlock,
  PracticeSegment,
  DailyPractice,
  AppSettings,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getDuePassages, getToday, getPassageTitle } from './srsScheduler';

// ============================================
// Smart Block Generator Engine
// Creates configurable number of 20-30 minute blocks with intelligent distribution
//
// Rules:
//   - Never include initial-bucket passages; only active Gebrian passages
//   - Every technical item appears at least once across all blocks for the day
//   - Every passage appears at least twice, spread across different blocks
//   - No item ever repeats within a single block
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

// Generate a single practice block from pre-assigned items.
// assignedItems are the priority items for this block.
// Falls back to unused items from the global pools to fill remaining time.
// No item may appear more than once within a single block.
function generateBlock(
  blockNumber: number,
  assignedItems: Array<TechnicalItem | MusicalPassage>,
  allPassages: MusicalPassage[],
  allTechnical: TechnicalItem[],
  settings: AppSettings
): PracticeBlock {
  const { targetBlockDuration, minSegmentDuration, maxSegmentDuration } = settings;

  const segments: PracticeSegment[] = [];
  let totalDuration = 0;
  let order = 0;
  const usedInBlock = new Set<string>();

  const addItem = (item: TechnicalItem | MusicalPassage): boolean => {
    if (usedInBlock.has(item.id)) return false;

    const remainingTime = targetBlockDuration - totalDuration;
    const maxDur = Math.min(maxSegmentDuration, remainingTime);
    const minDur = Math.min(minSegmentDuration, remainingTime);

    if (minDur < 1) return false;

    const duration = maxDur <= minDur ? minDur : randomDuration(minDur, maxDur);
    segments.push(createSegment(item, duration, order++));
    totalDuration += duration;
    usedInBlock.add(item.id);
    return true;
  };

  // Interleave assigned technical items and passages for natural practice flow
  const assignedTech = shuffle(
    assignedItems.filter(item => item.type === 'technical') as TechnicalItem[]
  );
  const assignedPassages = assignedItems.filter(
    item => item.type === 'passage'
  ) as MusicalPassage[];

  // Build interleaved queue: alternate tech and passages
  const queue: Array<TechnicalItem | MusicalPassage> = [];
  let ti = 0, pi = 0;
  while (ti < assignedTech.length || pi < assignedPassages.length) {
    if (ti < assignedTech.length) queue.push(assignedTech[ti++]);
    if (pi < assignedPassages.length) queue.push(assignedPassages[pi++]);
  }

  // Fill from priority queue first
  for (const item of queue) {
    if (totalDuration >= targetBlockDuration - 1) break;
    addItem(item);
  }

  // Fill any remaining time with unused items from the global pools (still no repeats)
  if (totalDuration < targetBlockDuration - 1) {
    const extras = shuffle([
      ...allPassages.filter(p => !usedInBlock.has(p.id)),
      ...allTechnical.filter(t => !usedInBlock.has(t.id)),
    ]);
    for (const item of extras) {
      if (totalDuration >= targetBlockDuration - 1) break;
      addItem(item);
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

// Main function: Generate daily practice blocks (count controlled by settings.numBlocks)
export function generateDailyPractice(
  technicalItems: TechnicalItem[],
  passages: MusicalPassage[],
  settings: AppSettings = DEFAULT_SETTINGS
): DailyPractice {
  const today = getToday();
  const numBlocks = settings.numBlocks ?? 3;

  // Only include active Gebrian passages — initial-bucket passages are never scheduled.
  // getDuePassages already sorts by priority (earlier SRS phases first).
  const activePassages = getDuePassages(passages).filter(p => p.status === 'active');

  // Shuffle technical items for variety across sessions
  const shuffledTech = shuffle([...technicalItems]);

  // Pre-plan block assignments to guarantee daily coverage:
  //   - Each technical item:  assigned to at least 1 block
  //   - Each active passage: assigned to at least 2 different blocks
  const blockAssignments: Array<Array<TechnicalItem | MusicalPassage>> = Array.from(
    { length: numBlocks },
    () => []
  );

  // Distribute technical items round-robin so they're spread across blocks
  shuffledTech.forEach((tech, idx) => {
    blockAssignments[idx % numBlocks].push(tech);
  });

  // Distribute passages — first occurrence (priority order, round-robin across blocks)
  activePassages.forEach((passage, idx) => {
    blockAssignments[idx % numBlocks].push(passage);
  });

  // Distribute passages — second occurrence, guaranteed in a *different* block
  if (numBlocks >= 2) {
    const offset = Math.max(1, Math.ceil(numBlocks / 2));
    activePassages.forEach((passage, idx) => {
      // Walk forward from the offset position until we find a block without this passage
      for (let delta = 1; delta <= numBlocks; delta++) {
        const targetBlock = (idx + offset + delta - 1) % numBlocks;
        if (!blockAssignments[targetBlock].some(item => item.id === passage.id)) {
          blockAssignments[targetBlock].push(passage);
          break;
        }
      }
    });
  }

  // Generate each block according to its pre-planned assignments
  const blocks: PracticeBlock[] = [];
  for (let i = 0; i < numBlocks; i++) {
    blocks.push(
      generateBlock(i + 1, blockAssignments[i], activePassages, shuffledTech, settings)
    );
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
