import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { TechnicalItem } from '../types';
import { useApp } from './AppContext';
import { imageFileToBase64, compressImage } from '../utils/storage';

interface ItemFormData {
  title: string;
  notes: string;
  imageData?: string;
}

const emptyForm: ItemFormData = { title: '', notes: '', imageData: undefined };

export function TechnicalItemsView() {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(emptyForm);

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
      const existing = state.technicalItems.find(i => i.id === editingId);
      if (existing) {
        dispatch({
          type: 'UPDATE_TECHNICAL_ITEM',
          payload: {
            ...existing,
            ...formData,
          },
        });
      }
    } else {
      dispatch({
        type: 'ADD_TECHNICAL_ITEM',
        payload: {
          type: 'technical',
          title: formData.title,
          notes: formData.notes,
          imageData: formData.imageData,
        },
      });
    }

    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: TechnicalItem) => {
    setFormData({
      title: item.title,
      notes: item.notes,
      imageData: item.imageData,
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this technical item?')) {
      dispatch({ type: 'DELETE_TECHNICAL_ITEM', payload: id });
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-tech-blue)]">
          Technical Items
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="touch-target px-6 py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                     text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
        >
          + Add Item
        </button>
      </div>

      <p className="text-[var(--color-text-secondary)]">
        Technical items repeat daily in your practice blocks. Add scales, exercises, warm-ups, and other fundamentals.
      </p>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Technical Item' : 'New Technical Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none
                             text-lg"
                  placeholder="e.g., C Major Scale"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none
                             text-lg min-h-[100px]"
                  placeholder="Practice tips, tempo markings, etc."
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
                             file:bg-[var(--color-tech-blue)] file:text-white file:cursor-pointer"
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
                  className="flex-1 touch-target py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                             text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Item
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

      {/* Items List */}
      <div className="space-y-4">
        {state.technicalItems.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-xl">
            <p className="text-[var(--color-text-secondary)] text-lg">
              No technical items yet. Add your first one!
            </p>
          </div>
        ) : (
          state.technicalItems.map(item => (
            <div
              key={item.id}
              className="bg-[var(--color-bg-card)] rounded-xl p-5 border-l-4 border-[var(--color-tech-blue)]"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  {item.notes && (
                    <p className="mt-2 text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {item.notes}
                    </p>
                  )}
                  {item.imageData && (
                    <div className="mt-3 music-snippet">
                      <img src={item.imageData} alt={item.title} className="rounded-lg" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="touch-target px-4 py-2 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                               rounded-lg hover:bg-[var(--color-bg-input)]/80 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="touch-target px-4 py-2 bg-red-900/30 text-red-400
                               rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
