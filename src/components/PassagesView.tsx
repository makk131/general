import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { MusicalPassage } from '../types';
import { useApp } from './AppContext';
import { imageFileToBase64, compressImage } from '../utils/storage';
import { createNewPassage, getPhaseDescription, isPassageDueToday } from '../utils/srsScheduler';

interface PassageFormData {
  title: string;
  notes: string;
  imageData?: string;
}

const emptyForm: PassageFormData = { title: '', notes: '', imageData: undefined };

export function PassagesView() {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PassageFormData>(emptyForm);
  const [activeTab, setActiveTab] = useState<'active' | 'performance'>('active');

  const activePassages = state.passages.filter(p => p.status === 'active');
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
    if (!formData.title.trim()) return;

    if (editingId) {
      const existing = state.passages.find(p => p.id === editingId);
      if (existing) {
        dispatch({
          type: 'UPDATE_PASSAGE',
          payload: {
            ...existing,
            title: formData.title,
            notes: formData.notes,
            imageData: formData.imageData,
          },
        });
      }
    } else {
      const newPassage = createNewPassage(formData.title, formData.notes, formData.imageData);
      dispatch({ type: 'ADD_PASSAGE', payload: newPassage });
    }

    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (passage: MusicalPassage) => {
    setFormData({
      title: passage.title,
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

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const renderPassageCard = (passage: MusicalPassage) => {
    const isDue = isPassageDueToday(passage);
    const phaseDescription = getPhaseDescription(passage);

    return (
      <div
        key={passage.id}
        className={`bg-[var(--color-bg-card)] rounded-xl p-5 border-l-4 ${
          passage.status === 'performance'
            ? 'border-[var(--color-performance-gold)]'
            : 'border-[var(--color-music-green)]'
        }`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {passage.title}
              </h3>
              {isDue && (
                <span className="px-3 py-1 bg-[var(--color-music-green)]/20 text-[var(--color-music-green)]
                                 rounded-full text-sm font-medium">
                  Due Today
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm ${
              passage.status === 'performance'
                ? 'text-[var(--color-performance-gold)]'
                : 'text-[var(--color-music-green)]'
            }`}>
              {phaseDescription}
            </p>
            {passage.notes && (
              <p className="mt-2 text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {passage.notes}
              </p>
            )}
            {passage.imageData && (
              <div className="mt-3 music-snippet">
                <img src={passage.imageData} alt={passage.title} className="rounded-lg" />
              </div>
            )}
            {passage.nextDueDate && passage.status === 'active' && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Next due: {new Date(passage.nextDueDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(passage)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                         rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(passage.id)}
              className="touch-target px-4 py-2 bg-red-900/30 text-red-400
                         rounded-lg hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-music-green)]">
          Musical Passages
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="touch-target px-6 py-3 bg-[var(--color-music-green)] text-white rounded-lg
                     text-lg font-medium hover:bg-[var(--color-music-green-dark)] transition-colors"
        >
          + Add Passage
        </button>
      </div>

      <p className="text-[var(--color-text-secondary)]">
        Passages follow a spaced repetition schedule to build long-term memory.
        Completed passages move to the Performance bucket.
      </p>

      {/* Tabs for Active vs Performance */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`touch-target px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-[var(--color-music-green)] text-white'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
          }`}
        >
          Active ({activePassages.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`touch-target px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
            activeTab === 'performance'
              ? 'bg-[var(--color-performance-gold)] text-white'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'
          }`}
        >
          Performance ({performancePassages.length})
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Passage' : 'New Passage'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg"
                  placeholder="e.g., Bach Prelude mm. 1-16"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-music-green)] focus:outline-none
                             text-lg min-h-[100px]"
                  placeholder="Practice focus, fingering, dynamics..."
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
                  {editingId ? 'Update' : 'Add'} Passage
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
      <div className="space-y-4">
        {activeTab === 'active' ? (
          activePassages.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-xl">
              <p className="text-[var(--color-text-secondary)] text-lg">
                No active passages. Add your first one to start learning!
              </p>
            </div>
          ) : (
            activePassages.map(renderPassageCard)
          )
        ) : performancePassages.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-xl">
            <p className="text-[var(--color-text-secondary)] text-lg">
              No passages in the performance bucket yet.
              Complete the SRS schedule to move passages here.
            </p>
          </div>
        ) : (
          performancePassages.map(renderPassageCard)
        )}
      </div>
    </div>
  );
}
