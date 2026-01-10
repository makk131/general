import { AppProvider, useApp } from './components/AppContext';
import { Header } from './components/Header';
import { PracticeView } from './components/PracticeView';
import { TechnicalItemsView } from './components/TechnicalItemsView';
import { PassagesView } from './components/PassagesView';
import { JournalView } from './components/JournalView';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const { state } = useApp();

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">♩</div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (state.currentTab) {
      case 'practice':
        return <PracticeView />;
      case 'technical':
        return <TechnicalItemsView />;
      case 'passages':
        return <PassagesView />;
      case 'journal':
        return <JournalView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PracticeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
        Dynamic Practice Orchestrator
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
