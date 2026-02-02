import { useState, useEffect, useCallback } from 'react';
import './GameScreen.css';
import { 
  GAME_CONFIG, 
  HANGMAN_STAGES, 
  ALPHABET,
  MESSAGES,
  Difficulty,
  DEFAULT_DIFFICULTY,
  DIFFICULTY_CONFIGS
} from '../constants/gameConstants';
import { calculateCoins } from '../utils/shopUtils';

export interface GameEndResult {
  won: boolean;
  wrongGuesses: number;
  maxWrongGuesses: number;
  difficulty: Difficulty;
}

interface GameScreenProps {
  word: string;
  category?: string;
  difficulty?: Difficulty;
  maxWrongGuesses?: number;
  onGameEnd: (result: GameEndResult) => void;
  onRestart: () => void;
}

export function GameScreen({ word, category, difficulty = DEFAULT_DIFFICULTY, maxWrongGuesses: customMaxWrongGuesses, onGameEnd, onRestart }: GameScreenProps) {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [wrongLettersSet, setWrongLettersSet] = useState<Set<string>>(new Set()); // Für Duplikat-Erkennung (Hard-Modus)
  
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const maxWrongGuesses = customMaxWrongGuesses ?? GAME_CONFIG.MAX_WRONG_GUESSES;

  // Normalisiere das Wort (Umlaute behandeln)
  const normalizedWord = word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const displayWord = word.toUpperCase();

  // Prüfe ob Spiel gewonnen
  useEffect(() => {
    if (gameWon || gameLost) return;
    const allLettersGuessed = normalizedWord
      .split('')
      .filter(char => /[A-Z]/.test(char))
      .every(char => guessedLetters.has(char));
    
    if (allLettersGuessed && normalizedWord.length > 0) {
      setGameWon(true);
      onGameEnd({
        won: true,
        wrongGuesses,
        maxWrongGuesses,
        difficulty
      });
    }
  }, [gameWon, gameLost, guessedLetters, normalizedWord, wrongGuesses, maxWrongGuesses, difficulty, onGameEnd]);

  // Prüfe ob Spiel verloren
  useEffect(() => {
    if (gameWon || gameLost) return;
    if (wrongGuesses >= maxWrongGuesses) {
      setGameLost(true);
      onGameEnd({
        won: false,
        wrongGuesses,
        maxWrongGuesses,
        difficulty
      });
    }
  }, [gameWon, gameLost, wrongGuesses, maxWrongGuesses, difficulty, onGameEnd]);

  const handleLetterClick = useCallback((letter: string) => {
    if (gameWon || gameLost || guessedLetters.has(letter)) {
      return;
    }

    const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isInWord = normalizedWord.includes(normalizedLetter);

    setGuessedLetters(prev => new Set(prev).add(letter));

    if (!isInWord) {
      // Hard-Modus: Doppelte Strafe bei wiederholtem falschem Raten
      if (difficultyConfig.doublePenaltyOnDuplicate && wrongLettersSet.has(normalizedLetter)) {
        setWrongGuesses(prev => prev + GAME_CONFIG.DUPLICATE_PENALTY_MULTIPLIER);
      } else {
        setWrongGuesses(prev => prev + 1);
      }
      setWrongLettersSet(prev => new Set(prev).add(normalizedLetter));
    }
  }, [guessedLetters, normalizedWord, gameWon, gameLost, difficultyConfig, wrongLettersSet]);

  // Keyboard-Events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-ZÄÖÜ]$/.test(key) && !guessedLetters.has(key)) {
        handleLetterClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleLetterClick, guessedLetters]);

  const getDisplayWord = () => {
    return displayWord
      .split('')
      .map(char => {
        if (!/[A-ZÄÖÜ]/.test(char)) {
          return char; // Leerzeichen, Bindestriche etc. anzeigen
        }
        const normalizedChar = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return guessedLetters.has(char) || guessedLetters.has(normalizedChar) 
          ? char 
          : '_';
      })
      .join(' ');
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        {category && <div className="category">Kategorie: {category}</div>}
        <div className="difficulty">Schwierigkeit: {difficultyConfig.name}</div>
        <div className="wrong-guesses">
          Fehler: {wrongGuesses} / {maxWrongGuesses}
        </div>
      </div>

      <div className="hangman-display">
        <pre className="hangman-art">
          {HANGMAN_STAGES[Math.min(wrongGuesses, HANGMAN_STAGES.length - 1)]}
        </pre>
      </div>

      <div className="word-display">
        <h2>{getDisplayWord()}</h2>
      </div>

      {gameWon && (
        <div className="game-over win">
          <h2>{MESSAGES.WIN}</h2>
          <p>Das Wort war: <strong>{word}</strong></p>
          <p className="coins-earned">
            Du hast {calculateCoins(true, wrongGuesses, maxWrongGuesses, difficulty)} Coins verdient!
          </p>
          <button onClick={onRestart}>Nochmal spielen</button>
        </div>
      )}

      {gameLost && (
        <div className="game-over lose">
          <h2>{MESSAGES.LOSE}</h2>
          <p>Das Wort war: <strong>{word}</strong></p>
          <p className="coins-earned">
            Du hast {calculateCoins(false, wrongGuesses, maxWrongGuesses, difficulty)} Trost-Coins verdient!
          </p>
          <button onClick={onRestart}>Nochmal spielen</button>
        </div>
      )}

      {!gameWon && !gameLost && (
        <div className="alphabet">
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.has(letter);
            const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const isWrong = isGuessed && !normalizedWord.includes(normalizedLetter);
            const isCorrect = isGuessed && normalizedWord.includes(normalizedLetter);
            
            // Mittel/Schwer-Modus: Falsche Buchstaben nicht als "wrong" markieren (verstecken)
            const showWrong = !difficultyConfig.hideWrongLetters && isWrong;

            return (
              <button
                key={letter}
                className={`letter-button ${showWrong ? 'wrong' : ''} ${isCorrect ? 'correct' : ''} ${isGuessed ? 'guessed' : ''}`}
                onClick={() => handleLetterClick(letter)}
                disabled={isGuessed}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      <button className="restart-button" onClick={onRestart}>
        Neues Spiel
      </button>
    </div>
  );
}

