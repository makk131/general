import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  TechnicalItem,
  MusicalPassage,
  DailyPractice,
  JournalEntry,
  AppSettings,
  PracticeSegment,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';
import {
  loadAllData,
  saveTechnicalItems,
  savePassages,
  saveDailyPractice,
  saveJournalEntries,
  saveSettings,
} from './storage';
import { generateDailyPractice, needsRegeneration, markSegmentComplete } from './blockGenerator';
import { advancePassageAfterPractice, skipToNextPhase } from './srsScheduler';

// ============================================
// App State & Context
// ============================================

interface AppState {
  technicalItems: TechnicalItem[];
  passages: MusicalPassage[];
  dailyPractice: DailyPractice | null;
  journalEntries: JournalEntry[];
  settings: AppSettings;
  isLoading: boolean;
}

type AppAction =
  | { type: 'LOAD_DATA'; payload: Omit<AppState, 'isLoading'> }
  | { type: 'ADD_TECHNICAL_ITEM'; payload: TechnicalItem }
  | { type: 'UPDATE_TECHNICAL_ITEM'; payload: TechnicalItem }
  | { type: 'DELETE_TECHNICAL_ITEM'; payload: string }
  | { type: 'ADD_PASSAGE'; payload: MusicalPassage }
  | { type: 'UPDATE_PASSAGE'; payload: MusicalPassage }
  | { type: 'DELETE_PASSAGE'; payload: string }
  | { type: 'SKIP_PASSAGE_PHASE'; payload: string }
  | { type: 'GENERATE_DAILY_PRACTICE' }
  | { type: 'COMPLETE_SEGMENT'; payload: { blockId: string; segmentId: string; itemId: string } }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: AppState = {
  technicalItems: [],
  passages: [],
  dailyPractice: null,
  journalEntries: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...action.payload, isLoading: false };

    case 'ADD_TECHNICAL_ITEM': {
      const technicalItems = [...state.technicalItems, action.payload];
      saveTechnicalItems(technicalItems);
      return { ...state, technicalItems };
    }

    case 'UPDATE_TECHNICAL_ITEM': {
      const technicalItems = state.technicalItems.map(item =>
        item.id === action.payload.id ? action.payload : item
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
      const passages = [...state.passages, action.payload];
      savePassages(passages);
      return { ...state, passages };
    }

    case 'UPDATE_PASSAGE': {
      const passages = state.passages.map(p => (p.id === action.payload.id ? action.payload : p));
      savePassages(passages);
      return { ...state, passages };
    }

    case 'DELETE_PASSAGE': {
      const passages = state.passages.filter(p => p.id !== action.payload);
      savePassages(passages);
      return { ...state, passages };
    }

    case 'SKIP_PASSAGE_PHASE': {
      const passages = state.passages.map(p =>
        p.id === action.payload ? skipToNextPhase(p) : p
      );
      savePassages(passages);
      return { ...state, passages };
    }

    case 'GENERATE_DAILY_PRACTICE': {
      const dailyPractice = generateDailyPractice(
        state.technicalItems,
        state.passages,
        state.settings
      );
      saveDailyPractice(dailyPractice);
      return { ...state, dailyPractice };
    }

    case 'COMPLETE_SEGMENT': {
      const { blockId, segmentId, itemId } = action.payload;
      if (!state.dailyPractice) return state;

      const updatedPractice = markSegmentComplete(state.dailyPractice, blockId, segmentId);

      // Find the passage that was practiced and advance it
      const passage = state.passages.find(p => p.id === itemId && p.type === 'passage');
      let updatedPassages = state.passages;

      if (passage) {
        updatedPassages = state.passages.map(p =>
          p.id === itemId ? advancePassageAfterPractice(p as MusicalPassage) : p
        );
        savePassages(updatedPassages);
      }

      saveDailyPractice(updatedPractice);
      return { ...state, dailyPractice: updatedPractice, passages: updatedPassages };
    }

    case 'ADD_JOURNAL_ENTRY': {
      const journalEntries = [...state.journalEntries, action.payload];
      saveJournalEntries(journalEntries);
      return { ...state, journalEntries };
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload };
      saveSettings(settings);
      return { ...state, settings };
    }

    case 'CLEAR_ALL_DATA':
      return { ...initialState, isLoading: false };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load data on mount
    loadAllData().then(data => {
      dispatch({ type: 'LOAD_DATA', payload: data });

      // Check if we need to regenerate daily practice
      if (needsRegeneration(data.dailyPractice)) {
        setTimeout(() => dispatch({ type: 'GENERATE_DAILY_PRACTICE' }), 100);
      }
    });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
