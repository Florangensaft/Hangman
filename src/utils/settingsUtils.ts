import { type GameSettings, DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants/gameConstants';

/**
 * Lädt die Einstellungen aus dem LocalStorage
 */
export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored) as GameSettings;
      // Validiere und merge mit Defaults für fehlende Felder
      const settings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        audio: {
          ...DEFAULT_SETTINGS.audio,
          ...parsed.audio
        }
      };

      // Migration: Falls noch der alte Standardwert (7) gespeichert ist, auf den neuen (11) aktualisieren
      if (settings.maxWrongGuesses === 7) {
        settings.maxWrongGuesses = DEFAULT_SETTINGS.maxWrongGuesses;
      }

      return settings;
    }
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Speichert die Einstellungen im LocalStorage
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
  }
}

/**
 * Setzt die Einstellungen auf die Standardwerte zurück
 */
export function resetSettings(): GameSettings {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
