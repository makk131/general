import { useState } from 'react';
import { useMetronome } from '../hooks/useMetronome';
import { useApp } from './AppContext';

export function Metronome() {
  const { state: appState, dispatch } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    state,
    toggle,
    setBpm,
    setBeatsPerMeasure,
  } = useMetronome(
    appState.settings.metronomeBPM,
    appState.settings.metronomeBeatsPerMeasure
  );

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { metronomeBPM: newBpm } });
  };

  const handleBeatsChange = (newBeats: number) => {
    setBeatsPerMeasure(newBeats);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { metronomeBeatsPerMeasure: newBeats } });
  };

  // Quick tempo adjustments
  const adjustBpm = (delta: number) => {
    handleBpmChange(Math.max(20, Math.min(300, state.bpm + delta)));
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={toggle}
        className={`
          touch-target px-4 py-2 rounded-lg text-lg font-medium transition-all
          ${state.isPlaying
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)]/80'
          }
        `}
      >
        <span className="flex items-center gap-2">
          <span className={state.isPlaying ? 'animate-pulse' : ''}>♩</span>
          <span>{state.bpm}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="ml-1 text-sm opacity-70 hover:opacity-100"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 bg-[var(--color-bg-card)] rounded-xl p-4 shadow-xl z-50 w-72">
          <h4 className="font-bold mb-4 text-center">Metronome</h4>

          {/* BPM Display with Beat Indicator */}
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold mb-2">
              {state.bpm}
              <span className="text-lg text-[var(--color-text-secondary)] ml-2">BPM</span>
            </div>

            {/* Beat Indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: state.beatsPerMeasure }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-4 h-4 rounded-full transition-all
                    ${state.isPlaying && state.currentBeat === i
                      ? i === 0
                        ? 'bg-red-500 scale-125'
                        : 'bg-[var(--color-tech-blue)] scale-110'
                      : 'bg-[var(--color-bg-input)]'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* BPM Slider */}
          <div className="mb-4">
            <input
              type="range"
              min="20"
              max="300"
              value={state.bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Quick BPM Buttons */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => adjustBpm(-10)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] rounded-lg
                         hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              -10
            </button>
            <button
              onClick={() => adjustBpm(-1)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] rounded-lg
                         hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              -1
            </button>
            <button
              onClick={() => adjustBpm(1)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] rounded-lg
                         hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              +1
            </button>
            <button
              onClick={() => adjustBpm(10)}
              className="touch-target px-4 py-2 bg-[var(--color-bg-input)] rounded-lg
                         hover:bg-[var(--color-bg-input)]/80 transition-colors"
            >
              +10
            </button>
          </div>

          {/* Time Signature */}
          <div className="flex items-center justify-center gap-4">
            <label className="text-[var(--color-text-secondary)]">Beats:</label>
            <select
              value={state.beatsPerMeasure}
              onChange={(e) => handleBeatsChange(parseInt(e.target.value))}
              className="px-4 py-2 bg-[var(--color-bg-input)] rounded-lg text-lg
                         border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 12].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Common Tempo Presets */}
          <div className="mt-4 pt-4 border-t border-[var(--color-bg-input)]">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2 text-center">Presets</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Largo', bpm: 50 },
                { label: 'Adagio', bpm: 70 },
                { label: 'Andante', bpm: 90 },
                { label: 'Moderato', bpm: 110 },
                { label: 'Allegro', bpm: 140 },
                { label: 'Presto', bpm: 180 },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleBpmChange(preset.bpm)}
                  className={`
                    px-3 py-1 rounded text-sm transition-colors
                    ${state.bpm === preset.bpm
                      ? 'bg-[var(--color-tech-blue)] text-white'
                      : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)]/80'
                    }
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone metronome for Settings page
export function MetronomePanel() {
  const { state: appState, dispatch } = useApp();

  const {
    state,
    toggle,
    setBpm,
    setBeatsPerMeasure,
  } = useMetronome(
    appState.settings.metronomeBPM,
    appState.settings.metronomeBeatsPerMeasure
  );

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { metronomeBPM: newBpm } });
  };

  const handleBeatsChange = (newBeats: number) => {
    setBeatsPerMeasure(newBeats);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { metronomeBeatsPerMeasure: newBeats } });
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 text-center">Metronome</h3>

      {/* Large Play Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggle}
          className={`
            w-24 h-24 rounded-full text-4xl font-bold transition-all
            ${state.isPlaying
              ? 'bg-red-600 text-white hover:bg-red-700 scale-105'
              : 'bg-[var(--color-tech-blue)] text-white hover:bg-[var(--color-tech-blue-dark)]'
            }
          `}
        >
          {state.isPlaying ? '⏹' : '▶'}
        </button>
      </div>

      {/* BPM Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-mono font-bold mb-2">{state.bpm}</div>
        <div className="text-[var(--color-text-secondary)]">beats per minute</div>
      </div>

      {/* Beat Indicator */}
      <div className="flex justify-center gap-3 mb-6">
        {Array.from({ length: state.beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`
              w-6 h-6 rounded-full transition-all
              ${state.isPlaying && state.currentBeat === i
                ? i === 0
                  ? 'bg-red-500 scale-150'
                  : 'bg-[var(--color-tech-blue)] scale-125'
                : 'bg-[var(--color-bg-input)]'
              }
            `}
          />
        ))}
      </div>

      {/* BPM Slider */}
      <div className="mb-6">
        <input
          type="range"
          min="20"
          max="300"
          value={state.bpm}
          onChange={(e) => handleBpmChange(parseInt(e.target.value))}
          className="w-full h-3 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mt-1">
          <span>20</span>
          <span>300</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => handleBpmChange(Math.max(20, state.bpm - 5))}
          className="touch-target w-12 h-12 bg-[var(--color-bg-input)] rounded-lg text-xl
                     hover:bg-[var(--color-bg-input)]/80 transition-colors"
        >
          -5
        </button>
        <input
          type="number"
          min="20"
          max="300"
          value={state.bpm}
          onChange={(e) => handleBpmChange(Math.max(20, Math.min(300, parseInt(e.target.value) || 120)))}
          className="w-24 px-3 py-2 rounded-lg bg-[var(--color-bg-input)] text-center text-2xl
                     border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
        />
        <button
          onClick={() => handleBpmChange(Math.min(300, state.bpm + 5))}
          className="touch-target w-12 h-12 bg-[var(--color-bg-input)] rounded-lg text-xl
                     hover:bg-[var(--color-bg-input)]/80 transition-colors"
        >
          +5
        </button>
      </div>

      {/* Beats Per Measure */}
      <div className="flex items-center justify-center gap-4">
        <label className="text-[var(--color-text-secondary)]">Time Signature:</label>
        <select
          value={state.beatsPerMeasure}
          onChange={(e) => handleBeatsChange(parseInt(e.target.value))}
          className="px-4 py-3 bg-[var(--color-bg-input)] rounded-lg text-xl
                     border border-transparent focus:border-[var(--color-tech-blue)] focus:outline-none"
        >
          {[2, 3, 4, 5, 6, 7, 8, 9, 12].map(n => (
            <option key={n} value={n}>{n}/4</option>
          ))}
        </select>
      </div>
    </div>
  );
}
