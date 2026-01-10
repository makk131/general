import type {
  TechnicalItem,
  MusicalPassage,
  DailyPractice,
  JournalEntry,
  AppSettings,
  AppState,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';

// ============================================
// localStorage Persistence Layer
// Handles saving/loading all data including Base64 images
// ============================================

const STORAGE_KEYS = {
  TECHNICAL_ITEMS: 'practice_orchestrator_technical',
  PASSAGES: 'practice_orchestrator_passages',
  DAILY_PRACTICE: 'practice_orchestrator_daily',
  JOURNAL: 'practice_orchestrator_journal',
  SETTINGS: 'practice_orchestrator_settings',
} as const;

// Generic storage helpers
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    // Handle quota exceeded error for large Base64 images
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
  }
  return defaultValue;
}

// Technical Items
export function saveTechnicalItems(items: TechnicalItem[]): void {
  saveToStorage(STORAGE_KEYS.TECHNICAL_ITEMS, items);
}

export function loadTechnicalItems(): TechnicalItem[] {
  return loadFromStorage<TechnicalItem[]>(STORAGE_KEYS.TECHNICAL_ITEMS, []);
}

// Musical Passages
export function savePassages(passages: MusicalPassage[]): void {
  saveToStorage(STORAGE_KEYS.PASSAGES, passages);
}

export function loadPassages(): MusicalPassage[] {
  return loadFromStorage<MusicalPassage[]>(STORAGE_KEYS.PASSAGES, []);
}

// Daily Practice
export function saveDailyPractice(practice: DailyPractice | null): void {
  saveToStorage(STORAGE_KEYS.DAILY_PRACTICE, practice);
}

export function loadDailyPractice(): DailyPractice | null {
  return loadFromStorage<DailyPractice | null>(STORAGE_KEYS.DAILY_PRACTICE, null);
}

// Journal Entries
export function saveJournalEntries(entries: JournalEntry[]): void {
  saveToStorage(STORAGE_KEYS.JOURNAL, entries);
}

export function loadJournalEntries(): JournalEntry[] {
  return loadFromStorage<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
}

// Settings
export function saveSettings(settings: AppSettings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings(): AppSettings {
  return loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

// Load all app state at once
export function loadAppState(): AppState {
  return {
    technicalItems: loadTechnicalItems(),
    passages: loadPassages(),
    dailyPractice: loadDailyPractice(),
    journalEntries: loadJournalEntries(),
    settings: loadSettings(),
  };
}

// Save all app state at once
export function saveAppState(state: AppState): void {
  saveTechnicalItems(state.technicalItems);
  savePassages(state.passages);
  saveDailyPractice(state.dailyPractice);
  saveJournalEntries(state.journalEntries);
  saveSettings(state.settings);
}

// Image handling utilities
export function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Compress image before storage to save space
export function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Clear all stored data (for debugging/reset)
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Get storage usage info
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }
  // Approximate 5MB limit for most browsers
  const total = 5 * 1024 * 1024;
  return {
    used,
    total,
    percentage: (used / total) * 100,
  };
}
