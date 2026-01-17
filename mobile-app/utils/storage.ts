import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TechnicalItem, MusicalPassage, DailyPractice, JournalEntry, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

// ============================================
// AsyncStorage Wrapper for Mobile App
// ============================================

const KEYS = {
  TECHNICAL_ITEMS: '@gebrian:technical_items',
  PASSAGES: '@gebrian:passages',
  DAILY_PRACTICE: '@gebrian:daily_practice',
  JOURNAL_ENTRIES: '@gebrian:journal_entries',
  SETTINGS: '@gebrian:settings',
};

export interface StorageData {
  technicalItems: TechnicalItem[];
  passages: MusicalPassage[];
  dailyPractice: DailyPractice | null;
  journalEntries: JournalEntry[];
  settings: AppSettings;
}

// Save individual data pieces
export async function saveTechnicalItems(items: TechnicalItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TECHNICAL_ITEMS, JSON.stringify(items));
}

export async function savePassages(passages: MusicalPassage[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PASSAGES, JSON.stringify(passages));
}

export async function saveDailyPractice(practice: DailyPractice | null): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_PRACTICE, JSON.stringify(practice));
}

export async function saveJournalEntries(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Load individual data pieces
export async function loadTechnicalItems(): Promise<TechnicalItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TECHNICAL_ITEMS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function loadPassages(): Promise<MusicalPassage[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PASSAGES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function loadDailyPractice(): Promise<DailyPractice | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.DAILY_PRACTICE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function loadJournalEntries(): Promise<JournalEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Load all data at once
export async function loadAllData(): Promise<StorageData> {
  const [technicalItems, passages, dailyPractice, journalEntries, settings] = await Promise.all([
    loadTechnicalItems(),
    loadPassages(),
    loadDailyPractice(),
    loadJournalEntries(),
    loadSettings(),
  ]);

  return {
    technicalItems,
    passages,
    dailyPractice,
    journalEntries,
    settings,
  };
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.TECHNICAL_ITEMS,
    KEYS.PASSAGES,
    KEYS.DAILY_PRACTICE,
    KEYS.JOURNAL_ENTRIES,
    KEYS.SETTINGS,
  ]);
}

// Image compression for mobile (React Native compatible)
export function compressImageBase64(base64: string): string {
  // For mobile, we'll rely on the image picker to handle compression
  // This is a placeholder for consistency with the web version
  return base64;
}
