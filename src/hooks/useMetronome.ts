import { useState, useCallback, useRef, useEffect } from 'react';

export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
}

export interface UseMetronomeReturn {
  state: MetronomeState;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setBpm: (bpm: number) => void;
  setBeatsPerMeasure: (beats: number) => void;
}

// High-precision Web Audio metronome
export function useMetronome(
  initialBpm: number = 120,
  initialBeatsPerMeasure: number = 4
): UseMetronomeReturn {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    bpm: initialBpm,
    beatsPerMeasure: initialBeatsPerMeasure,
    currentBeat: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const timerIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const bpmRef = useRef<number>(initialBpm);
  const beatsPerMeasureRef = useRef<number>(initialBeatsPerMeasure);

  // Schedule ahead time (in seconds) for smooth audio
  const scheduleAheadTime = 0.1;
  const lookahead = 25; // ms

  // Create or get AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Play a click sound
  const playClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = getAudioContext();

    // Create oscillator for click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Higher pitch for accent (first beat)
    osc.frequency.value = isAccent ? 1000 : 800;
    osc.type = 'sine';

    // Quick attack and decay for click sound
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(isAccent ? 0.5 : 0.3, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }, [getAudioContext]);

  // Scheduler function - runs in a loop to schedule beats
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const secondsPerBeat = 60 / bpmRef.current;

    // Schedule all beats that are due within our schedule window
    while (nextBeatTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const isAccent = currentBeatRef.current === 0;
      playClick(nextBeatTimeRef.current, isAccent);

      // Update current beat for UI
      setState(prev => ({
        ...prev,
        currentBeat: currentBeatRef.current,
      }));

      // Advance to next beat
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current;
      nextBeatTimeRef.current += secondsPerBeat;
    }
  }, [playClick]);

  // Start the metronome
  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    const ctx = getAudioContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    isPlayingRef.current = true;
    currentBeatRef.current = 0;
    nextBeatTimeRef.current = ctx.currentTime;

    setState(prev => ({ ...prev, isPlaying: true, currentBeat: 0 }));

    // Start the scheduling loop
    const tick = () => {
      scheduler();
      if (isPlayingRef.current) {
        timerIdRef.current = window.setTimeout(tick, lookahead);
      }
    };
    tick();
  }, [getAudioContext, scheduler]);

  // Stop the metronome
  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false, currentBeat: 0 }));
  }, []);

  // Toggle play/stop
  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Set BPM
  const setBpm = useCallback((bpm: number) => {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    bpmRef.current = clampedBpm;
    setState(prev => ({ ...prev, bpm: clampedBpm }));
  }, []);

  // Set beats per measure
  const setBeatsPerMeasure = useCallback((beats: number) => {
    const clampedBeats = Math.max(1, Math.min(12, beats));
    beatsPerMeasureRef.current = clampedBeats;
    currentBeatRef.current = currentBeatRef.current % clampedBeats;
    setState(prev => ({ ...prev, beatsPerMeasure: clampedBeats }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    state,
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure,
  };
}
