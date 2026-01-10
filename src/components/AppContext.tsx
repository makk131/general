import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type {
  TechnicalItem,
  MusicalPassage,
  DailyPractice,
  JournalEntry,
  AppSettings,
  TabView,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import {
  loadTechnicalItems,
  loadPassages,
  loadDailyPractice,
  loadJournalEntries,
  loadSettings,
  saveTechnicalItems,
  savePassages,
  saveDailyPractice,
  saveJournalEntries,
  saveSettings,
  generateId,
} from '../utils/storage';
import { generateDailyPractice, needsRegeneration } from '../utils/blockGenerator';
import { advancePassageAfterPractice } from '../utils/srsScheduler';

// ============================================
// App State & Context
// ============================================

interface AppState {
  technicalItems: TechnicalItem[];
  passages: MusicalPassage[];
  dailyPractice: DailyPractice | null;
  journalEntries: JournalEntry[];
  settings: AppSettings;
  currentTab: TabView;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TAB'; payload: TabView }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_TECHNICAL_ITEM'; payload: Omit<TechnicalItem, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TECHNICAL_ITEM'; payload: TechnicalItem }
  | { type: 'DELETE_TECHNICAL_ITEM'; payload: string }
  | { type: 'ADD_PASSAGE'; payload: Omit<MusicalPassage, 'id'> }
  | { type: 'UPDATE_PASSAGE'; payload: MusicalPassage }
  | { type: 'DELETE_PASSAGE'; payload: string }
  | { type: 'SET_DAILY_PRACTICE'; payload: DailyPractice | null }
  | { type: 'REGENERATE_PRACTICE' }
  | { type: 'COMPLETE_SEGMENT'; payload: { blockId: string; segmentId: string; itemId: string } }
  | { type: 'UPDATE_SEGMENT'; payload: { blockId: string; segmentId: string; updates: Record<string, unknown> } }
  | { type: 'DELETE_SEGMENT'; payload: { blockId: string; segmentId: string } }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_JOURNAL_ENTRY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const initialState: AppState = {
  technicalItems: [],
  passages: [],
  dailyPractice: null,
  journalEntries: [],
  settings: DEFAULT_SETTINGS,
  currentTab: 'practice',
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_TAB':
      return { ...state, currentTab: action.payload };

    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoading: false };

    case 'ADD_TECHNICAL_ITEM': {
      const now = new Date().toISOString();
      const newItem: TechnicalItem = {
        ...action.payload,
        type: 'technical',
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const technicalItems = [...state.technicalItems, newItem];
      saveTechnicalItems(technicalItems);
      return { ...state, technicalItems };
    }

    case 'UPDATE_TECHNICAL_ITEM': {
      const technicalItems = state.technicalItems.map(item =>
        item.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : item
      );
      saveTechnicalItems(technicalItems);
      return { ...state, technicalItems };
    }

    case 'DELETE_TECHNICAL_ITEM': {
      const technicalItems = state.technicalItems.filter(item => item.id !== action.payload);
      saveTechnicalItems(technicalItems);
      return { ...state, technicalItems };
    }

    case 'ADD_PASSAGE': {
      const newPassage: MusicalPassage = {
        ...action.payload,
        id: generateId(),
      };
      const passages = [...state.passages, newPassage];
      savePassages(passages);
      return { ...state, passages };
    }

    case 'UPDATE_PASSAGE': {
      const passages = state.passages.map(p =>
        p.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : p
      );
      savePassages(passages);
      return { ...state, passages };
    }

    case 'DELETE_PASSAGE': {
      const passages = state.passages.filter(p => p.id !== action.payload);
      savePassages(passages);
      return { ...state, passages };
    }

    case 'SET_DAILY_PRACTICE': {
      saveDailyPractice(action.payload);
      return { ...state, dailyPractice: action.payload };
    }

    case 'REGENERATE_PRACTICE': {
      const dailyPractice = generateDailyPractice(
        state.technicalItems,
        state.passages,
        state.settings
      );
      saveDailyPractice(dailyPractice);
      return { ...state, dailyPractice };
    }

    case 'COMPLETE_SEGMENT': {
      if (!state.dailyPractice) return state;

      const { blockId, segmentId, itemId } = action.payload;

      // Update the daily practice
      const dailyPractice = {
        ...state.dailyPractice,
        blocks: state.dailyPractice.blocks.map(block => {
          if (block.id !== blockId) return block;

          const completedSegments = [...block.completedSegments, segmentId];
          const isComplete = completedSegments.length === block.segments.length;

          return { ...block, completedSegments, isComplete };
        }),
      };

      // Update the passage's SRS state if it's a passage
      const segment = state.dailyPractice.blocks
        .find(b => b.id === blockId)
        ?.segments.find(s => s.id === segmentId);

      let passages = state.passages;
      if (segment?.itemType === 'passage') {
        const passage = state.passages.find(p => p.id === itemId);
        if (passage) {
          const updatedPassage = advancePassageAfterPractice(passage);
          passages = state.passages.map(p =>
            p.id === itemId ? updatedPassage : p
          );
          savePassages(passages);
        }
      }

      saveDailyPractice(dailyPractice);
      return { ...state, dailyPractice, passages };
    }

    case 'UPDATE_SEGMENT': {
      if (!state.dailyPractice) return state;

      const { blockId, segmentId, updates } = action.payload;

      const dailyPractice = {
        ...state.dailyPractice,
        blocks: state.dailyPractice.blocks.map(block => {
          if (block.id !== blockId) return block;

          const segments = block.segments.map(seg =>
            seg.id === segmentId ? { ...seg, ...updates } : seg
          );

          const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

          return { ...block, segments, totalDuration };
        }),
      };

      saveDailyPractice(dailyPractice);
      return { ...state, dailyPractice };
    }

    case 'DELETE_SEGMENT': {
      if (!state.dailyPractice) return state;

      const { blockId, segmentId } = action.payload;

      const dailyPractice = {
        ...state.dailyPractice,
        blocks: state.dailyPractice.blocks.map(block => {
          if (block.id !== blockId) return block;

          const segments = block.segments
            .filter(s => s.id !== segmentId)
            .map((s, idx) => ({ ...s, order: idx }));

          const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
          const completedSegments = block.completedSegments.filter(id => id !== segmentId);

          return { ...block, segments, totalDuration, completedSegments };
        }),
      };

      saveDailyPractice(dailyPractice);
      return { ...state, dailyPractice };
    }

    case 'ADD_JOURNAL_ENTRY': {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const journalEntries = [newEntry, ...state.journalEntries];
      saveJournalEntries(journalEntries);
      return { ...state, journalEntries };
    }

    case 'UPDATE_JOURNAL_ENTRY': {
      const journalEntries = state.journalEntries.map(entry =>
        entry.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : entry
      );
      saveJournalEntries(journalEntries);
      return { ...state, journalEntries };
    }

    case 'DELETE_JOURNAL_ENTRY': {
      const journalEntries = state.journalEntries.filter(e => e.id !== action.payload);
      saveJournalEntries(journalEntries);
      return { ...state, journalEntries };
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload };
      saveSettings(settings);
      return { ...state, settings };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const technicalItems = loadTechnicalItems();
    const passages = loadPassages();
    let dailyPractice = loadDailyPractice();
    const journalEntries = loadJournalEntries();
    const settings = loadSettings();

    // Check if we need to regenerate today's practice
    if (needsRegeneration(dailyPractice) && (technicalItems.length > 0 || passages.length > 0)) {
      dailyPractice = generateDailyPractice(technicalItems, passages, settings);
      saveDailyPractice(dailyPractice);
    }

    dispatch({
      type: 'LOAD_STATE',
      payload: {
        technicalItems,
        passages,
        dailyPractice,
        journalEntries,
        settings,
      },
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
