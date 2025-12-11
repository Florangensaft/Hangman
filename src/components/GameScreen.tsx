import { useState, useEffect, useCallback } from 'react';
import './GameScreen.css';

interface GameScreenProps {
  word: string;
  category?: string;
  onGameEnd: (won: boolean) => void;
  onRestart: () => void;
}

const MAX_WRONG_GUESSES = 7;
const HANGMAN_STAGES = [
  '', // 0 Fehler
  '  |\n  |\n  |\n  |\n  |\n__|__', // 1 Fehler
  '  +---+\n  |   |\n  |\n  |\n  |\n  |\n__|__', // 2 Fehler
  '  +---+\n  |   |\n  |   O\n  |\n  |\n  |\n__|__', // 3 Fehler
  '  +---+\n  |   |\n  |   O\n  |   |\n  |\n  |\n__|__', // 4 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\n  |\n  |\n__|__', // 5 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |\n  |\n__|__', // 6 Fehler
  '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  /\n  |\n__|__', // 7 Fehler (verloren)
];

export function GameScreen({ word, category, onGameEnd, onRestart }: GameScreenProps) {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  // Normalisiere das Wort (Umlaute behandeln)
  const normalizedWord = word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const displayWord = word.toUpperCase();

  // Prüfe ob Spiel gewonnen
  useEffect(() => {
    const allLettersGuessed = normalizedWord
      .split('')
      .filter(char => /[A-Z]/.test(char))
      .every(char => guessedLetters.has(char));
    
    if (allLettersGuessed && normalizedWord.length > 0) {
      setGameWon(true);
      onGameEnd(true);
    }
  }, [guessedLetters, normalizedWord, onGameEnd]);

  // Prüfe ob Spiel verloren
  useEffect(() => {
    if (wrongGuesses >= MAX_WRONG_GUESSES) {
      setGameLost(true);
      onGameEnd(false);
    }
  }, [wrongGuesses, onGameEnd]);

  const handleLetterClick = useCallback((letter: string) => {
    if (gameWon || gameLost || guessedLetters.has(letter)) {
      return;
    }

    const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isInWord = normalizedWord.includes(normalizedLetter);

    setGuessedLetters(prev => new Set(prev).add(letter));

    if (!isInWord) {
      setWrongGuesses(prev => prev + 1);
    }
  }, [guessedLetters, normalizedWord, gameWon, gameLost]);

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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

  return (
    <div className="game-screen">
      <div className="game-header">
        {category && <div className="category">Kategorie: {category}</div>}
        <div className="wrong-guesses">
          Fehler: {wrongGuesses} / {MAX_WRONG_GUESSES}
        </div>
      </div>

      <div className="hangman-display">
        <pre className="hangman-art">{HANGMAN_STAGES[wrongGuesses]}</pre>
      </div>

      <div className="word-display">
        <h2>{getDisplayWord()}</h2>
      </div>

      {gameWon && (
        <div className="game-over win">
          <h2>🎉 Gewonnen!</h2>
          <p>Das Wort war: <strong>{word}</strong></p>
          <button onClick={onRestart}>Nochmal spielen</button>
        </div>
      )}

      {gameLost && (
        <div className="game-over lose">
          <h2>😢 Verloren!</h2>
          <p>Das Wort war: <strong>{word}</strong></p>
          <button onClick={onRestart}>Nochmal spielen</button>
        </div>
      )}

      {!gameWon && !gameLost && (
        <div className="alphabet">
          {alphabet.map(letter => {
            const isGuessed = guessedLetters.has(letter);
            const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const isWrong = isGuessed && !normalizedWord.includes(normalizedLetter);
            const isCorrect = isGuessed && normalizedWord.includes(normalizedLetter);

            return (
              <button
                key={letter}
                className={`letter-button ${isWrong ? 'wrong' : ''} ${isCorrect ? 'correct' : ''} ${isGuessed ? 'guessed' : ''}`}
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

