import { useState, useCallback } from 'react';
import type React from 'react';
import type { PracticeBlock, PracticeSegment } from '../types';
import { useApp } from './AppContext';
import { useTimer, formatTime } from '../hooks/useTimer';
import { SegmentEditor } from './SegmentEditor';
import { Metronome } from './Metronome';

function SegmentTimer({
  segment,
  blockId,
  isCompleted,
  isExpanded,
  onExpand,
  onComplete,
}: {
  segment: PracticeSegment;
  blockId: string;
  isCompleted: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onComplete: () => void;
}) {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(segment.notes || '');
  const [noteDirty, setNoteDirty] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'UPDATE_SEGMENT',
      payload: { blockId, segmentId: segment.id, updates: { notes: noteText } },
    });
    if (segment.itemType === 'passage') {
      const passage = state.passages.find(p => p.id === segment.itemId);
      if (passage) {
        dispatch({ type: 'UPDATE_PASSAGE', payload: { ...passage, notes: noteText } });
      }
    }
    setNoteDirty(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleTimerComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const { state: timerState, start, pause, reset, setDuration } = useTimer(
    segment.duration,
    handleTimerComplete
  );

  const isTechnical = segment.itemType === 'technical';
  const borderColor = isTechnical ? 'var(--color-tech-blue)' : 'var(--color-music-green)';
  const bgColor = isTechnical ? 'var(--color-tech-blue)' : 'var(--color-music-green)';

  const handleDurationChange = (newDuration: number) => {
    dispatch({
      type: 'UPDATE_SEGMENT',
      payload: {
        blockId,
        segmentId: segment.id,
        updates: { duration: newDuration },
      },
    });
    setDuration(newDuration);
  };

  const handleDelete = () => {
    if (confirm('Delete this segment?')) {
      dispatch({
        type: 'DELETE_SEGMENT',
        payload: { blockId, segmentId: segment.id },
      });
    }
  };

  return (
    <div
      className={`
        bg-[var(--color-bg-card)] rounded-xl overflow-hidden transition-all duration-300
        ${isCompleted ? 'opacity-50' : ''}
        ${timerState.isRunning ? 'segment-active' : ''}
      `}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onExpand}
      >
        <div className="flex items-center gap-4 flex-1">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: bgColor }}
          >
            {isTechnical ? 'TECH' : 'MUSIC'}
          </span>
          <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through' : ''}`}>
            {segment.title}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
            {formatTime(timerState.remainingSeconds)}
          </span>
          <span className="text-[var(--color-text-secondary)]">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Timer Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isCompleted && (
              <>
                {!timerState.isRunning ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); start(); }}
                    className="touch-target px-6 py-3 bg-green-600 text-white rounded-lg
                               text-lg font-bold hover:bg-green-700 transition-colors"
                  >
                    ▶ Start
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); pause(); }}
                    className="touch-target px-6 py-3 bg-yellow-600 text-white rounded-lg
                               text-lg font-bold hover:bg-yellow-700 transition-colors"
                  >
                    ⏸ Pause
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="touch-target px-4 py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                             rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                  className="touch-target px-4 py-3 bg-[var(--color-bg-input)] text-green-400
                             rounded-lg hover:bg-green-900/30 transition-colors"
                >
                  ✓ Complete
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="touch-target px-4 py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                         rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="touch-target px-4 py-3 bg-red-900/30 text-red-400
                         rounded-lg hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${timerState.isRunning ? 'timer-active' : ''}`}
              style={{
                width: `${timerState.progress}%`,
                backgroundColor: bgColor,
              }}
            />
          </div>

          {/* Notes */}
          {segment.itemType === 'passage' ? (
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => { setNoteText(e.target.value); setNoteDirty(true); setNoteSaved(false); }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Add practice notes for next time…"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                           border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                           text-sm min-h-[72px] resize-none"
              />
              {(noteDirty || noteSaved) && (
                <button
                  onClick={handleSaveNote}
                  className={`touch-target px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    noteSaved
                      ? 'bg-green-700/40 text-green-300'
                      : 'bg-[var(--color-music-green)] text-white hover:bg-[var(--color-music-green-dark)]'
                  }`}
                >
                  {noteSaved ? '✓ Saved' : 'Save note'}
                </button>
              )}
            </div>
          ) : segment.notes ? (
            <div className="bg-[var(--color-bg-input)] rounded-lg p-4">
              <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {segment.notes}
              </p>
            </div>
          ) : null}

          {/* Music Snippet */}
          {segment.imageData && (
            <div className="music-snippet bg-white/5 p-2 rounded-lg">
              <img
                src={segment.imageData}
                alt={segment.title}
                className="max-h-[300px] w-full object-contain rounded"
              />
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <SegmentEditor
          segment={segment}
          blockId={blockId}
          onClose={() => setIsEditing(false)}
          onDurationChange={handleDurationChange}
        />
      )}
    </div>
  );
}

function BlockView({
  block,
  blockNumber,
}: {
  block: PracticeBlock;
  blockNumber: number;
}) {
  const [expandedSegmentId, setExpandedSegmentId] = useState<string | null>(null);
  const { dispatch } = useApp();

  const handleSegmentComplete = (segmentId: string, itemId: string) => {
    dispatch({
      type: 'COMPLETE_SEGMENT',
      payload: { blockId: block.id, segmentId, itemId },
    });
  };

  const completedCount = block.completedSegments.length;
  const totalCount = block.segments.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-[var(--color-bg-card)]/50 rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
          Block {blockNumber}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[var(--color-text-secondary)]">
            {completedCount}/{totalCount} complete
          </span>
          <span className="text-lg font-mono">
            ~{block.totalDuration} min
          </span>
          {block.isComplete && (
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
              ✓ Done
            </span>
          )}
        </div>
      </div>

      {/* Block Progress */}
      <div className="h-1 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Segments */}
      <div className="space-y-3">
        {block.segments.map(segment => (
          <SegmentTimer
            key={segment.id}
            segment={segment}
            blockId={block.id}
            isCompleted={block.completedSegments.includes(segment.id)}
            isExpanded={expandedSegmentId === segment.id}
            onExpand={() =>
              setExpandedSegmentId(
                expandedSegmentId === segment.id ? null : segment.id
              )
            }
            onComplete={() => handleSegmentComplete(segment.id, segment.itemId)}
          />
        ))}
      </div>
    </div>
  );
}

export function PracticeView() {
  const { state, dispatch } = useApp();
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);

  const handleRegenerate = () => {
    if (confirm('Regenerate today\'s practice blocks? This will reset your progress.')) {
      dispatch({ type: 'REGENERATE_PRACTICE' });
    }
  };

  const handleDayOff = () => {
    if (confirm('Take a full day off? All resting passages will return one day later than scheduled.')) {
      dispatch({ type: 'TAKE_DAY_OFF' });
    }
  };

  // Check if we have any items to practice
  const hasItems = state.technicalItems.length > 0 || state.passages.length > 0;

  if (!hasItems) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="bg-[var(--color-bg-card)] rounded-xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Welcome to Practice Orchestrator!</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            To get started, add some Technical Items or Musical Passages.
            The app will automatically generate your daily practice blocks.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'technical' })}
              className="touch-target px-6 py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                         text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
            >
              Add Technical Items
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'passages' })}
              className="touch-target px-6 py-3 bg-[var(--color-music-green)] text-white rounded-lg
                         text-lg font-medium hover:bg-[var(--color-music-green-dark)] transition-colors"
            >
              Add Passages
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.dailyPractice) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="bg-[var(--color-bg-card)] rounded-xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Generate Today's Practice</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Ready to practice? Generate your three 25-minute blocks.
          </p>
          <button
            onClick={() => dispatch({ type: 'REGENERATE_PRACTICE' })}
            className="touch-target px-8 py-4 bg-[var(--color-tech-blue)] text-white rounded-lg
                       text-xl font-bold hover:bg-[var(--color-tech-blue-dark)] transition-colors"
          >
            Generate Practice Blocks
          </button>
        </div>
      </div>
    );
  }

  const { blocks } = state.dailyPractice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Today's Practice
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Metronome />
          <button
            onClick={handleDayOff}
            className="touch-target px-4 py-2 bg-[var(--color-bg-input)] text-[var(--color-performance-gold)]
                       rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
          >
            Day Off
          </button>
          <button
            onClick={handleRegenerate}
            className="touch-target px-4 py-2 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                       rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      {/* Block Tabs */}
      <div className="flex gap-2">
        {blocks.map((block, index) => (
          <button
            key={block.id}
            onClick={() => setActiveBlockIndex(index)}
            className={`
              touch-target px-6 py-3 rounded-lg text-lg font-medium transition-colors flex-1
              ${activeBlockIndex === index
                ? 'bg-[var(--color-tech-blue)] text-white'
                : block.isComplete
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
              }
            `}
          >
            Block {index + 1}
            {block.isComplete && ' ✓'}
          </button>
        ))}
      </div>

      {/* Active Block */}
      {blocks[activeBlockIndex] && (
        <BlockView
          block={blocks[activeBlockIndex]}
          blockNumber={activeBlockIndex + 1}
        />
      )}
    </div>
  );
}
