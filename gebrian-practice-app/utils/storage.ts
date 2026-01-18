import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, PracticeSegment } from '../types';

const STORAGE_KEY = '@gebrian_practice_app_state';

/**
 * Load app state from storage
 */
export const loadAppState = async (): Promise<AppState> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
  } catch (e) {
    console.error('Error loading app state:', e);
  }

  // Return default state
  return {
    segments: [],
    lastUpdateDate: new Date().toISOString(),
  };
};

/**
 * Save app state to storage
 */
export const saveAppState = async (state: AppState): Promise<void> => {
  try {
    const jsonValue = JSON.stringify({
      ...state,
      lastUpdateDate: new Date().toISOString(),
    });
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving app state:', e);
  }
};

/**
 * Add a new segment
 */
export const addSegment = async (segment: PracticeSegment): Promise<void> => {
  const state = await loadAppState();
  state.segments.push(segment);
  await saveAppState(state);
};

/**
 * Update an existing segment
 */
export const updateSegment = async (updatedSegment: PracticeSegment): Promise<void> => {
  const state = await loadAppState();
  state.segments = state.segments.map(seg =>
    seg.id === updatedSegment.id ? updatedSegment : seg
  );
  await saveAppState(state);
};

/**
 * Delete a segment
 */
export const deleteSegment = async (segmentId: string): Promise<void> => {
  const state = await loadAppState();
  state.segments = state.segments.filter(seg => seg.id !== segmentId);
  await saveAppState(state);
};

/**
 * Get all active segments (not performance ready)
 */
export const getActiveSegments = async (): Promise<PracticeSegment[]> => {
  const state = await loadAppState();
  return state.segments.filter(seg => !seg.isPerformanceReady);
};

/**
 * Get all performance ready segments
 */
export const getPerformanceReadySegments = async (): Promise<PracticeSegment[]> => {
  const state = await loadAppState();
  return state.segments.filter(seg => seg.isPerformanceReady);
};

/**
 * Clear all data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};
