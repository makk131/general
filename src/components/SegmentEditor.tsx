import { useState } from 'react';
import type { PracticeSegment, TechnicalItem, MusicalPassage } from '../types';
import { useApp } from './AppContext';
import { getPassageTitle } from '../utils/srsScheduler';

interface SegmentEditorProps {
  segment: PracticeSegment;
  blockId: string;
  onClose: () => void;
  onDurationChange: (duration: number) => void;
}

export function SegmentEditor({
  segment,
  blockId,
  onClose,
  onDurationChange,
}: SegmentEditorProps) {
  const { state, dispatch } = useApp();
  const [duration, setDuration] = useState(segment.duration);
  const [showSwapPicker, setShowSwapPicker] = useState(false);

  const handleDurationSave = () => {
    if (duration >= 1 && duration <= 15) {
      onDurationChange(duration);
      onClose();
    }
  };

  const handleSwap = (item: TechnicalItem | MusicalPassage) => {
    const title = item.type === 'passage' ? getPassageTitle(item as MusicalPassage) : item.title;
    dispatch({
      type: 'UPDATE_SEGMENT',
      payload: {
        blockId,
        segmentId: segment.id,
        updates: {
          itemId: item.id,
          itemType: item.type,
          title,
          notes: item.notes,
          imageData: item.imageData,
        },
      },
    });
    onClose();
  };

  // Get all available items for swapping (include initial routine passages too)
  const allItems: (TechnicalItem | MusicalPassage)[] = [
    ...state.technicalItems,
    ...state.passages.filter(p => p.status === 'active' || p.status === 'initial'),
  ];

  const getItemTitle = (item: TechnicalItem | MusicalPassage) =>
    item.type === 'passage' ? getPassageTitle(item as MusicalPassage) : item.title;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Segment</h3>

        {!showSwapPicker ? (
          <div className="space-y-6">
            {/* Current Item Info */}
            <div className="bg-[var(--color-bg-input)] rounded-lg p-4">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Current Item</p>
              <p className="text-lg font-medium">{segment.title}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                  segment.itemType === 'technical'
                    ? 'bg-[var(--color-tech-blue)]/20 text-[var(--color-tech-blue)]'
                    : 'bg-[var(--color-music-green)]/20 text-[var(--color-music-green)]'
                }`}
              >
                {segment.itemType === 'technical' ? 'Technical' : 'Passage'}
              </span>
            </div>

            {/* Duration Editor */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-center text-lg
                             border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
                />
                <span className="text-[var(--color-text-secondary)]">min</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleDurationSave}
                className="flex-1 touch-target py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                           text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
              >
                Save Duration
              </button>
              <button
                onClick={() => setShowSwapPicker(true)}
                className="flex-1 touch-target py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                           rounded-lg text-lg font-medium hover:bg-[var(--color-bg-input)]/80 transition-colors"
              >
                Swap Content
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full touch-target py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                         rounded-lg text-lg font-medium hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[var(--color-text-secondary)]">
                Select an item to swap in:
              </p>
              <button
                onClick={() => setShowSwapPicker(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {allItems.length === 0 ? (
                <p className="text-center py-4 text-[var(--color-text-secondary)]">
                  No items available
                </p>
              ) : (
                allItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSwap(item)}
                    className={`
                      w-full text-left p-4 rounded-lg transition-colors
                      ${item.id === segment.itemId
                        ? 'bg-[var(--color-tech-blue)]/20 border-2 border-[var(--color-tech-blue)]'
                        : 'bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-input)]/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          item.type === 'technical'
                            ? 'bg-[var(--color-tech-blue)]'
                            : 'bg-[var(--color-music-green)]'
                        }`}
                      >
                        {item.type === 'technical' ? 'TECH' : 'MUSIC'}
                      </span>
                      <span className="font-medium">{getItemTitle(item)}</span>
                      {item.id === segment.itemId && (
                        <span className="text-[var(--color-tech-blue)] text-sm">(current)</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
