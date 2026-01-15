import { useState, useEffect } from 'react';
import './OptionsScreen.css';
import { 
  Difficulty as DifficultyValues,
  DIFFICULTY_CONFIGS, 
  GAME_CONFIG,
  type Difficulty,
  type GameSettings 
} from '../constants/gameConstants';
import { loadSettings, saveSettings, resetSettings } from '../utils/settingsUtils';

interface OptionsScreenProps {
  onClose: () => void;
  onSettingsChange?: (settings: GameSettings) => void;
}

export function OptionsScreen({ onClose, onSettingsChange }: OptionsScreenProps) {
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Prüfe ob sich etwas geändert hat
    const current = loadSettings();
    setHasChanges(JSON.stringify(current) !== JSON.stringify(settings));
  }, [settings]);

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSettings(prev => ({ ...prev, difficulty }));
  };

  const handleMaxWrongGuessesChange = (value: number) => {
    const clamped = Math.max(
      GAME_CONFIG.MIN_WRONG_GUESSES,
      Math.min(GAME_CONFIG.MAX_WRONG_GUESSES_LIMIT, value)
    );
    setSettings(prev => ({ ...prev, maxWrongGuesses: clamped }));
  };

  const handleAudioEnabledChange = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, enabled }
    }));
  };

  const handleVolumeChange = (volume: number) => {
    const clamped = Math.max(0, Math.min(100, volume));
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, volume: clamped }
    }));
  };

  const handleSoundEffectsChange = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, soundEffects: enabled }
    }));
  };

  const handleBackgroundMusicChange = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, backgroundMusic: enabled }
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    onSettingsChange?.(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = resetSettings();
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  const handleCancel = () => {
    // Lade die gespeicherten Einstellungen neu
    setSettings(loadSettings());
    onClose();
  };

  return (
    <div className="options-screen">
      <div className="options-container">
        <h1>⚙️ Optionen</h1>

        {/* Schwierigkeitsgrad */}
        <section className="options-section">
          <h2>Schwierigkeitsgrad</h2>
          <div className="difficulty-options">
            {(Object.values(DifficultyValues) as Difficulty[]).map(difficulty => {
              const config = DIFFICULTY_CONFIGS[difficulty];
              return (
                <label key={difficulty} className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value={difficulty}
                    checked={settings.difficulty === difficulty}
                    onChange={() => handleDifficultyChange(difficulty)}
                  />
                  <div className="difficulty-info">
                    <span className="difficulty-name">{config.name}</span>
                    <span className="difficulty-description">{config.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Anzahl Fehlversuche */}
        <section className="options-section">
          <h2>Anzahl Fehlversuche</h2>
          <div className="wrong-guesses-control">
            <label>
              Max. Fehlversuche: <strong>{settings.maxWrongGuesses}</strong>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min={GAME_CONFIG.MIN_WRONG_GUESSES}
                max={GAME_CONFIG.MAX_WRONG_GUESSES_LIMIT}
                value={settings.maxWrongGuesses}
                onChange={(e) => handleMaxWrongGuessesChange(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>{GAME_CONFIG.MIN_WRONG_GUESSES}</span>
                <span>{GAME_CONFIG.MAX_WRONG_GUESSES_LIMIT}</span>
              </div>
            </div>
            <input
              type="number"
              min={GAME_CONFIG.MIN_WRONG_GUESSES}
              max={GAME_CONFIG.MAX_WRONG_GUESSES_LIMIT}
              value={settings.maxWrongGuesses}
              onChange={(e) => handleMaxWrongGuessesChange(Number(e.target.value))}
              className="number-input"
            />
          </div>
        </section>

        {/* Audio-Einstellungen */}
        <section className="options-section">
          <h2>🔊 Audio</h2>
          
          <div className="audio-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.audio.enabled}
                onChange={(e) => handleAudioEnabledChange(e.target.checked)}
              />
              <span>Audio aktivieren</span>
            </label>
          </div>

          {settings.audio.enabled && (
            <>
              <div className="audio-control">
                <label>
                  Lautstärke: <strong>{settings.audio.volume}%</strong>
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="audio-control">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.audio.soundEffects}
                    onChange={(e) => handleSoundEffectsChange(e.target.checked)}
                    disabled={!settings.audio.enabled}
                  />
                  <span>Soundeffekte</span>
                </label>
              </div>

              <div className="audio-control">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.audio.backgroundMusic}
                    onChange={(e) => handleBackgroundMusicChange(e.target.checked)}
                    disabled={!settings.audio.enabled}
                  />
                  <span>Hintergrundmusik</span>
                </label>
              </div>
            </>
          )}
        </section>

        {/* Buttons */}
        <div className="options-buttons">
          <button onClick={handleSave} className="save-button" disabled={!hasChanges}>
            Speichern
          </button>
          <button onClick={handleReset} className="reset-button">
            Zurücksetzen
          </button>
          <button onClick={handleCancel} className="cancel-button">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
