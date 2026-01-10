import type { TabView } from '../types';
import { useApp } from './AppContext';

const tabs: { id: TabView; label: string; icon: string }[] = [
  { id: 'practice', label: 'Practice', icon: '▶' },
  { id: 'technical', label: 'Technical', icon: '⚙' },
  { id: 'passages', label: 'Passages', icon: '♪' },
  { id: 'journal', label: 'Journal', icon: '✎' },
  { id: 'settings', label: 'Settings', icon: '☰' },
];

export function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className="bg-[var(--color-bg-card)] border-b border-[var(--color-bg-input)] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold text-center mb-4 text-[var(--color-text-primary)]">
          Practice Orchestrator
        </h1>
        <nav className="flex justify-center gap-1 sm:gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
              className={`
                touch-target px-3 sm:px-5 py-3 rounded-lg text-base sm:text-lg font-medium
                transition-all duration-200 flex items-center gap-2
                ${state.currentTab === tab.id
                  ? 'bg-[var(--color-tech-blue)] text-white shadow-lg'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)]/80'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
