import { useApp } from './AppContext';
import { MetronomePanel } from './Metronome';
import { clearAllData, getStorageInfo } from '../utils/storage';

export function SettingsView() {
  const { state, dispatch } = useApp();
  const storageInfo = getStorageInfo();

  const handleSettingChange = (key: string, value: number) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value },
    });
  };

  const handleClearData = () => {
    if (confirm('This will delete ALL your data including items, passages, practice history, and journal entries. This cannot be undone. Are you sure?')) {
      if (confirm('Really delete everything?')) {
        clearAllData();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
        Settings
      </h2>

      {/* Practice Block Settings */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-bold">Practice Blocks</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Block Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="60"
                value={state.settings.targetBlockDuration}
                onChange={(e) => handleSettingChange('targetBlockDuration', parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="60"
                value={state.settings.targetBlockDuration}
                onChange={(e) => handleSettingChange('targetBlockDuration', Math.max(10, Math.min(60, parseInt(e.target.value) || 25)))}
                className="w-20 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-center text-lg
                           border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
              />
              <span className="text-[var(--color-text-secondary)]">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Segment Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={state.settings.minSegmentDuration}
                onChange={(e) => handleSettingChange('minSegmentDuration', parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="10"
                value={state.settings.minSegmentDuration}
                onChange={(e) => handleSettingChange('minSegmentDuration', Math.max(1, Math.min(10, parseInt(e.target.value) || 2)))}
                className="w-20 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-center text-lg
                           border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
              />
              <span className="text-[var(--color-text-secondary)]">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Segment Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="15"
                value={state.settings.maxSegmentDuration}
                onChange={(e) => handleSettingChange('maxSegmentDuration', parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="2"
                max="15"
                value={state.settings.maxSegmentDuration}
                onChange={(e) => handleSettingChange('maxSegmentDuration', Math.max(2, Math.min(15, parseInt(e.target.value) || 6)))}
                className="w-20 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-center text-lg
                           border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
              />
              <span className="text-[var(--color-text-secondary)]">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metronome */}
      <MetronomePanel />

      {/* Storage Info */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold">Storage</h3>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">Used Space</span>
            <span className="text-[var(--color-text-primary)]">
              {(storageInfo.used / 1024).toFixed(1)} KB / {(storageInfo.total / 1024 / 1024).toFixed(0)} MB
            </span>
          </div>
          <div className="h-2 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-tech-blue)] transition-all"
              style={{ width: `${Math.min(100, storageInfo.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {storageInfo.percentage.toFixed(1)}% used
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-bg-input)]">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Your data is stored locally in your browser. Export your data regularly to prevent loss.
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                const data = {
                  technicalItems: state.technicalItems,
                  passages: state.passages,
                  journalEntries: state.journalEntries,
                  settings: state.settings,
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `practice-orchestrator-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="touch-target px-6 py-3 bg-[var(--color-tech-blue)] text-white rounded-lg
                         font-medium hover:bg-[var(--color-tech-blue-dark)] transition-colors"
            >
              Export Data
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    if (confirm('This will replace all your current data. Continue?')) {
                      if (data.technicalItems) {
                        data.technicalItems.forEach((item: unknown) => {
                          dispatch({ type: 'ADD_TECHNICAL_ITEM', payload: item as Omit<import('../types').TechnicalItem, 'id' | 'createdAt' | 'updatedAt'> });
                        });
                      }
                      if (data.passages) {
                        data.passages.forEach((p: unknown) => {
                          dispatch({ type: 'ADD_PASSAGE', payload: p as Omit<import('../types').MusicalPassage, 'id'> });
                        });
                      }
                      if (data.journalEntries) {
                        data.journalEntries.forEach((e: unknown) => {
                          dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: e as Omit<import('../types').JournalEntry, 'id' | 'createdAt' | 'updatedAt'> });
                        });
                      }
                      if (data.settings) {
                        dispatch({ type: 'UPDATE_SETTINGS', payload: data.settings });
                      }
                      alert('Data imported successfully!');
                    }
                  } catch (error) {
                    alert('Failed to import data. Please check the file format.');
                  }
                };
                input.click();
              }}
              className="touch-target px-6 py-3 bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]
                         rounded-lg font-medium hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
        <p className="text-[var(--color-text-secondary)]">
          Permanently delete all your data. This action cannot be undone.
        </p>
        <button
          onClick={handleClearData}
          className="touch-target px-6 py-3 bg-red-600 text-white rounded-lg
                     font-medium hover:bg-red-700 transition-colors"
        >
          Delete All Data
        </button>
      </div>

      {/* About */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold">About</h3>
        <div className="text-[var(--color-text-secondary)] space-y-2">
          <p><strong>Dynamic Practice Orchestrator</strong></p>
          <p>A smart, interleaved practice assistant for musicians.</p>
          <p className="text-sm">
            Uses spaced repetition to help you learn and retain musical passages effectively.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-bg-input)]">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <strong>SRS Schedule:</strong> 3 days on → 1 off → 1 on → 1 off → 1 on → 7 off → 3 on → 14 off → 3 on → Performance Ready
          </p>
        </div>
      </div>
    </div>
  );
}
