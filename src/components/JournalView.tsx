import { useState, type FormEvent } from 'react';
import type { JournalEntry } from '../types';
import { useApp } from './AppContext';
import { getToday } from '../utils/srsScheduler';

export function JournalView() {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [blockNumber, setBlockNumber] = useState<number | undefined>(undefined);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingId) {
      const existing = state.journalEntries.find(e => e.id === editingId);
      if (existing) {
        dispatch({
          type: 'UPDATE_JOURNAL_ENTRY',
          payload: {
            ...existing,
            content,
            blockNumber,
          },
        });
      }
    } else {
      dispatch({
        type: 'ADD_JOURNAL_ENTRY',
        payload: {
          date: getToday(),
          content,
          blockNumber,
        },
      });
    }

    setContent('');
    setBlockNumber(undefined);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setContent(entry.content);
    setBlockNumber(entry.blockNumber);
    setEditingId(entry.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this journal entry?')) {
      dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: id });
    }
  };

  const handleCancel = () => {
    setContent('');
    setBlockNumber(undefined);
    setEditingId(null);
    setIsFormOpen(false);
  };

  // Group entries by date
  const entriesByDate = state.journalEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  const sortedDates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Practice Journal
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="touch-target px-6 py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                     text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
        >
          + New Entry
        </button>
      </div>

      <p className="text-[var(--color-text-secondary)]">
        Record your reflections, insights, and progress after each practice session.
      </p>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Entry' : 'New Journal Entry'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Practice Block (optional)
                </label>
                <select
                  value={blockNumber || ''}
                  onChange={e => setBlockNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none
                             text-lg"
                >
                  <option value="">General reflection</option>
                  <option value="1">Block 1</option>
                  <option value="2">Block 2</option>
                  <option value="3">Block 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reflection *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                             border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none
                             text-lg min-h-[200px]"
                  placeholder="What went well? What was challenging? What do you want to focus on next time?"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 touch-target py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                             text-lg font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
                >
                  {editingId ? 'Update' : 'Save'} Entry
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

      {/* Entries List */}
      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-xl">
            <p className="text-[var(--color-text-secondary)] text-lg">
              No journal entries yet. Start reflecting on your practice!
            </p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-[var(--color-text-secondary)] mb-3 sticky top-0 bg-[var(--color-bg-dark)] py-2">
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-4">
                {entriesByDate[date].map(entry => (
                  <div
                    key={entry.id}
                    className="bg-[var(--color-bg-card)] rounded-xl p-5"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {entry.blockNumber && (
                          <span className="px-3 py-1 bg-[var(--color-tech-blue)]/20 text-[var(--color-tech-blue)]
                                           rounded-full text-sm font-medium">
                            Block {entry.blockNumber}
                          </span>
                        )}
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="touch-target px-3 py-1 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                                     rounded-lg text-sm hover:bg-[var(--color-bg-input)]/80 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="touch-target px-3 py-1 bg-red-900/30 text-red-400
                                     rounded-lg text-sm hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
