import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { MusicalPassage } from '../types';
import { useApp } from './AppContext';
import { imageFileToBase64, compressImage } from '../utils/storage';
import {
  createNewPassage,
  getPhaseDescription,
  getPassageTitle,
  getGebriamProgress,
  isPassageDueToday,
} from '../utils/srsScheduler';
import { SRS_SCHEDULE } from '../types';

interface PassageFormData {
  composer: string;
  piece: string;
  bars: string;
  notes: string;
  imageData?: string;
}

const emptyForm: PassageFormData = {
  composer: '',
  piece: '',
  bars: '',
  notes: '',
  imageData: undefined,
};

type PassageTab = 'initial' | 'gebrian' | 'performance';

// Visual progress bar for the Gebrian cycle
function GebriamProgressBar({ passage }: { passage: MusicalPassage }) {
  const { step, label } = getGebriamProgress(passage);

  const segments = [
    { key: 'init', short: 'Init', full: 'Initial' },
    { key: '3on', short: '3d', full: '3 days' },
    { key: 'alt', short: 'On/Off', full: 'Alternating' },
    { key: '1wk', short: '1wk', full: '1 week off' },
    { key: '3on2', short: '3d', full: '3 days' },
    { key: '2wk', short: '2wk', full: '2 weeks off' },
    { key: '3on3', short: '3d', full: '3 days' },
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-0.5">
        {segments.map((seg, i) => {
          const isComplete = i < step;
          const isCurrent = i === step;
          return (
            <div
              key={seg.key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                isComplete
                  ? 'bg-[var(--color-music-green)]'
                  : isCurrent
                    ? 'bg-[var(--color-performance-gold)]'
                    : 'bg-[var(--color-bg-input)]'
              }`}
              title={seg.full}
            />
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{label}</p>
    </div>
  );
}

export function PassagesView() {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PassageFormData>(emptyForm);
  const [activeTab, setActiveTab] = useState<PassageTab>('initial');

  const initialPassages = state.passages.filter(p => p.status === 'initial');
  const gebrianPassages = state.passages.filter(p => p.status === 'active');
  const performancePassages = state.passages.filter(p => p.status === 'performance');

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await imageFileToBase64(file);
      const compressed = await compressImage(base64);
      setFormData(prev => ({ ...prev, imageData: compressed }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.composer.trim() && !formData.piece.trim()) return;

    if (editingId) {
      const existing = state.passages.find(p => p.id === editingId);
      if (existing) {
        const title = [formData.composer, formData.piece, formData.bars ? `mm. ${formData.bars}` : '']
          .filter(Boolean)
          .join(' — ');
        dispatch({
          type: 'UPDATE_PASSAGE',
          payload: {
            ...existing,
            title,
            composer: formData.composer,
            piece: formData.piece,
            bars: formData.bars,
            notes: formData.notes,
            imageData: formData.imageData,
          },
        });
      }
    } else {
      const newPassage = createNewPassage(
        formData.composer,
        formData.piece,
        formData.bars,
        formData.notes,
        formData.imageData
      );
      dispatch({ type: 'ADD_PASSAGE', payload: newPassage });
    }

    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (passage: MusicalPassage) => {
    setFormData({
      composer: passage.composer || '',
      piece: passage.piece || '',
      bars: passage.bars || '',
      notes: passage.notes,
      imageData: passage.imageData,
    });
    setEditingId(passage.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this passage?')) {
      dispatch({ type: 'DELETE_PASSAGE', payload: id });
    }
  };

  const handleAdvanceToGebrian = (passage: MusicalPassage) => {
    dispatch({ type: 'ADVANCE_TO_GEBRIAN', payload: passage.id });
  };

  const handleSkipToRest = (passage: MusicalPassage) => {
    if (confirm('Skip remaining on-days and jump straight to the next rest phase?')) {
      dispatch({ type: 'ADVANCE_TO_NEXT_REST', payload: passage.id });
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const renderPassageCard = (passage: MusicalPassage) => {
    const isDue = isPassageDueToday(passage);
    const phaseDescription = getPhaseDescription(passage);
    const displayTitle = getPassageTitle(passage);

    const borderColor =
      passage.status === 'performance'
        ? 'border-[var(--color-performance-gold)]'
        : passage.status === 'initial'
          ? 'border-[var(--color-tech-blue)]'
          : 'border-[var(--color-music-green)]';

    const statusColor =
      passage.status === 'performance'
        ? 'text-[var(--color-performance-gold)]'
        : passage.status === 'initial'
          ? 'text-[var(--color-tech-blue)]'
          : 'text-[var(--color-music-green)]';

    return (
      <div
        key={passage.id}
        className={`bg-[var(--color-bg-card)] rounded-xl p-5 border-l-4 ${borderColor}`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] break-words">
                {displayTitle}
              </h3>
              {isDue && passage.status !== 'initial' && (
                <span className="shrink-0 px-3 py-1 bg-[var(--color-music-green)]/20 text-[var(--color-music-green)]
                                 rounded-full text-sm font-medium">
                  Due Today
                </span>
              )}
              {passage.status === 'active' && !isDue && SRS_SCHEDULE[passage.srsPhase]?.daysOn === 0 && (
                <span className="shrink-0 px-3 py-1 bg-[var(--color-performance-gold)]/15 text-[var(--color-performance-gold)]
                                 rounded-full text-sm font-medium">
                  Resting
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm ${statusColor}`}>
              {phaseDescription}
            </p>
            {passage.notes && (
              <p className="mt-2 text-[var(--color-text-secondary)] whitespace-pre-wrap text-sm">
                {passage.notes}
              </p>
            )}
            {passage.imageData && (
              <div className="mt-3 music-snippet">
                <img src={passage.imageData} alt={displayTitle} className="rounded-lg" />
              </div>
            )}

            {/* Gebrian progress bar for active passages */}
            {passage.status === 'active' && (
              <GebriamProgressBar passage={passage} />
            )}

            {passage.nextDueDate && passage.status === 'active' && (
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Next due: {new Date(passage.nextDueDate + 'T00:00:00').toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {passage.status === 'initial' && (
              <button
                onClick={() => handleAdvanceToGebrian(passage)}
                className="touch-target px-4 py-2 bg-[var(--color-music-green)] text-white
                           rounded-lg text-sm font-medium hover:bg-[var(--color-music-green-dark)] transition-colors"
              >
                Start Gebrian
              </button>
            )}
            {passage.status === 'active' && SRS_SCHEDULE[passage.srsPhase]?.daysOn > 0 && (
              <button
                onClick={() => handleSkipToRest(passage)}
                className="touch-target px-4 py-2 bg-[var(--color-performance-gold)]/20 text-[var(--color-performance-gold)]
                           rounded-lg text-sm font-medium hover:bg-[var(--color-performance-gold)]/30 transition-colors"
              >
                Skip to Rest
              </button>
            )}
            <button
              onClick={() => handleEdit(passage)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                         rounded-lg text-sm hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(passage.id)}
              className="touch-target px-4 py-2 bg-red-900/30 text-red-400
                         rounded-lg text-sm hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getTabPassages = () => {
    switch (activeTab) {
      case 'initial':
        return initialPassages;
      case 'gebrian':
        return gebrianPassages;
      case 'performance':
        return performancePassages;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'initial':
        return 'No passages in initial routine. Add a new passage to get started!';
      case 'gebrian':
        return 'No passages in the Gebrian system yet. Complete the initial routine for a passage, then tap "Start Gebrian" to begin spaced repetition.';
      case 'performance':
        return 'No passages ready for performance yet. Passages move here after completing the full Gebrian cycle.';
    }
  };

  const tabPassages = getTabPassages();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-music-green)]">
          Passages
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="touch-target px-5 py-3 bg-[var(--color-music-green)] text-white rounded-lg
                     text-lg font-medium hover:bg-[var(--color-music-green-dark)] transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setActiveTab('initial')}
          className={`touch-target px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 ${
            activeTab === 'initial'
              ? 'bg-[var(--color-tech-blue)] text-white'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
          }`}
        >
          Initial ({initialPassages.length})
        </button>
        <button
          onClick={() => setActiveTab('gebrian')}
          className={`touch-target px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 ${
            activeTab === 'gebrian'
              ? 'bg-[var(--color-music-green)] text-white'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
          }`}
        >
          Gebrian ({gebrianPassages.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`touch-target px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 ${
            activeTab === 'performance'
              ? 'bg-[var(--color-performance-gold)] text-white'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
          }`}
        >
          Perf. ({performancePassages.length})
        </button>
      </div>

      {/* Gebrian cycle legend (shown on Gebrian tab) */}
      {activeTab === 'gebrian' && gebrianPassages.length > 0 && (
        <div className="bg-[var(--color-bg-card)] rounded-lg p-3 text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text-primary)]">Gebrian cycle:</span>{' '}
          3 days on &rarr; off/on/off/on/off/on &rarr; 1 week off &rarr; 3 days &rarr; 2 weeks off &rarr; 3 days &rarr; Performance
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Passage' : 'New Passage'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Composer *</label>
                <input
                  type="text"
                  value={formData.composer}
                  onChange={e => setFormData(prev => ({ ...prev, composer: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg"
                  placeholder="e.g., Bach"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Piece / Movement *</label>
                <input
                  type="text"
                  value={formData.piece}
                  onChange={e => setFormData(prev => ({ ...prev, piece: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg"
                  placeholder="e.g., Suite No. 6, Prelude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bar Numbers</label>
                <input
                  type="text"
                  value={formData.bars}
                  onChange={e => setFormData(prev => ({ ...prev, bars: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg"
                  placeholder="e.g., 1-16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Practice Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg min-h-[80px]"
                  placeholder="Fingering, bowing, focus areas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Music Snippet (Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                             file:bg-[var(--color-music-green)] file:text-white file:cursor-pointer"
                />
                {formData.imageData && (
                  <div className="mt-3">
                    <img
                      src={formData.imageData}
                      alt="Preview"
                      className="max-h-40 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageData: undefined }))}
                      className="mt-2 text-red-400 text-sm hover:text-red-300"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 touch-target py-3 bg-[var(--color-music-green)] text-white rounded-lg
                             text-lg font-medium hover:bg-[var(--color-music-green-dark)] transition-colors"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 touch-target py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                             rounded-lg text-lg font-medium hover:bg-[var(--color-bg-input)]/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passages List */}
      <div className="space-y-3">
        {tabPassages.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-xl">
            <p className="text-[var(--color-text-secondary)] text-base px-4">
              {getEmptyMessage()}
            </p>
          </div>
        ) : (
          tabPassages.map(renderPassageCard)
        )}
      </div>
    </div>
  );
}
