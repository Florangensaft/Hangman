/**
 * Spiel-Konstanten für das Hangman-Spiel
 * Zentrale Konfiguration für einfache Erweiterbarkeit
 */

// ============================================
// SCHWIERIGKEITSGRADE
// ============================================
export type Difficulty = 'easy' | 'medium' | 'hard';

export const Difficulty = {
  EASY: 'easy' as const,
  MEDIUM: 'medium' as const,
  HARD: 'hard' as const
} as const;

export interface DifficultyConfig {
  name: string;
  description: string;
  hideWrongLetters: boolean; // Versteckt falsch geratene Buchstaben im Alphabet
  doublePenaltyOnDuplicate: boolean; // Doppelte Strafe bei wiederholtem falschem Raten
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: {
    name: 'Leicht',
    description: 'Standard-Modus: Alle falschen Buchstaben werden angezeigt',
    hideWrongLetters: false,
    doublePenaltyOnDuplicate: false
  },
  [Difficulty.MEDIUM]: {
    name: 'Mittel',
    description: 'Falsch geratene Buchstaben werden nicht mehr angezeigt',
    hideWrongLetters: true,
    doublePenaltyOnDuplicate: false
  },
  [Difficulty.HARD]: {
    name: 'Schwer',
    description: 'Doppelte Strafe bei wiederholtem falschem Raten eines Buchstabens',
    hideWrongLetters: true,
    doublePenaltyOnDuplicate: true
  }
};

// Standard-Schwierigkeitsgrad
export const DEFAULT_DIFFICULTY = Difficulty.EASY;

// ============================================
// WORT-KONFIGURATION
// ============================================
export const WORD_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 20,
  ALLOWED_CHARS: /^[A-ZÄÖÜß\s-]+$/i, // Erlaubt Buchstaben, Leerzeichen und Bindestriche
  LETTERS_ONLY: /^[A-ZÄÖÜß]+$/i // Nur Buchstaben (für Custom Word Input)
} as const;

// ============================================
// ALPHABET
// ============================================
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

// ============================================
// SPIEL-KONFIGURATION
// ============================================
export const GAME_CONFIG = {
  MAX_WRONG_GUESSES: 7, // Standard-Anzahl Fehlversuche
  MIN_WRONG_GUESSES: 1, // Minimum Fehlversuche
  MAX_WRONG_GUESSES_LIMIT: 12, // Maximum Fehlversuche (Limit)
  DUPLICATE_PENALTY_MULTIPLIER: 2 // Multiplikator für wiederholte falsche Buchstaben (Hard-Modus)
} as const;

// ============================================
// HANGMAN-VISUALISIERUNG
// ============================================
export const HANGMAN_STAGES = [
  '', // 0 Fehler
  '  |\n  |\n  |\n  |\n  |\n__|__', // 1 Fehler
  '  +---+\n  |   |\n  |\n  |\n  |\n  |\n__|__', // 2 Fehler
  '  +---+\n  |   |\n  |   O\n  |\n  |\n  |\n__|__', // 3 Fehler
  '  +---+\n  |   |\n  |   O\n  |   |\n  |\n  |\n__|__', // 4 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\n  |\n  |\n__|__', // 5 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |\n  |\n__|__', // 6 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  /\n  |\n__|__', // 7 Fehler (verloren)
] as const;

// ============================================
// UI-KONSTANTEN
// ============================================
export const UI_CONFIG = {
  INPUT_MAX_LENGTH: 20,
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 300 // ms für Input-Debouncing
} as const;

// ============================================
// SPIEL-MODI
// ============================================
export type GameMode = 'start' | 'custom' | 'random';

export const GameMode = {
  START: 'start' as const,
  CUSTOM: 'custom' as const,
  RANDOM: 'random' as const
} as const;

// ============================================
// TIMER-KONFIGURATION (für zukünftige Features)
// ============================================
export const TIMER_CONFIG = {
  ENABLED: false, // Feature-Flag
  DEFAULT_TIME_SECONDS: 300, // 5 Minuten
  WARNING_THRESHOLD_SECONDS: 60 // Warnung bei 1 Minute Rest
} as const;

// ============================================
// PUNKTE-SYSTEM (für zukünftige Features)
// ============================================
export const SCORING_CONFIG = {
  ENABLED: false, // Feature-Flag
  BASE_POINTS: 100,
  BONUS_PER_REMAINING_GUESS: 10,
  PENALTY_PER_WRONG_GUESS: 5,
  DIFFICULTY_MULTIPLIER: {
    [Difficulty.EASY]: 1.0,
    [Difficulty.MEDIUM]: 1.5,
    [Difficulty.HARD]: 2.0
  }
} as const;

// ============================================
// ASSET-PFADE (für zukünftige Features)
// ============================================
export const ASSET_PATHS = {
  SOUNDS: {
    CLICK: '/assets/sounds/click.mp3',
    SUCCESS: '/assets/sounds/success.mp3',
    FAILURE: '/assets/sounds/failure.mp3',
    BACKGROUND: '/assets/sounds/background.mp3'
  },
  IMAGES: {
    HANGMAN_BASE: '/assets/images/hangman-base.png',
    LOGO: '/assets/images/logo.png'
  }
} as const;

// ============================================
// LOKALSPEICHER-KEYS
// ============================================
export const STORAGE_KEYS = {
  HIGHSCORE: 'hangman_highscore',
  SETTINGS: 'hangman_settings',
  STATISTICS: 'hangman_statistics',
  PREFERENCES: 'hangman_preferences'
} as const;

// ============================================
// EINSTELLUNGEN (SETTINGS)
// ============================================
export type GameSettings = {
  difficulty: Difficulty;
  maxWrongGuesses: number;
  audio: {
    enabled: boolean;
    volume: number; // 0-100
    soundEffects: boolean;
    backgroundMusic: boolean;
  };
};

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: DEFAULT_DIFFICULTY,
  maxWrongGuesses: GAME_CONFIG.MAX_WRONG_GUESSES,
  audio: {
    enabled: true,
    volume: 50,
    soundEffects: true,
    backgroundMusic: false
  }
};

// ============================================
// NACHRICHTEN & TEXTE
// ============================================
export const MESSAGES = {
  WIN: '🎉 Gewonnen!',
  LOSE: '😢 Verloren!',
  INVALID_WORD: 'Bitte geben Sie nur Buchstaben ein!',
  WORD_TOO_SHORT: `Das Wort muss mindestens ${WORD_CONFIG.MIN_LENGTH} Zeichen lang sein!`,
  WORD_TOO_LONG: `Das Wort darf maximal ${WORD_CONFIG.MAX_LENGTH} Zeichen lang sein!`
} as const;
