import { useState, useEffect, useCallback } from 'react';
import './GameScreen.css';
import { 
  GAME_CONFIG, 
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

// Gallows Images
import galgenRightfoot from '../assets/images/gallows/galgenRightfoot.png';
import galgenFullFoot from '../assets/images/gallows/galgenFullFoot.png';
import galgenGerade from '../assets/images/gallows/galgenGerade.png';
import galgenSideSupport from '../assets/images/gallows/galgenSideSupport.png';
import galgenFull from '../assets/images/gallows/galgenFull.png';
// Wooden Gallows Images
import woodenGallowHalfFoot from '../assets/images/gallows/woodenGallowHalfFoot.png';
import woodenGallowFoot from '../assets/images/gallows/woodenGallowFoot.png';
import woodenGallowBalken from '../assets/images/gallows/woodenGallowBalken.png';
import woodenGallowWithoutSupport from '../assets/images/gallows/woodenGallowWithoutSupport.png';
import woodenGallowFull from '../assets/images/gallows/woodenGallowFull.png';
// Temple Gallows Images
import templeGallowHalfFoot from '../assets/images/gallows/templeGallowHalfFoot.png';
import templeGallowFoot from '../assets/images/gallows/templeGallowFoot.png';
import templeGallowBalken from '../assets/images/gallows/templeGallowBalken.png';
import templeGallowNoSupport from '../assets/images/gallows/templeGallowNoSupport.png';
import templeGallowFull from '../assets/images/gallows/templeGallowFull.png';

// Dino Images
import dinoHead from '../assets/images/figures/notComplete/dinoHead.png';
import dinoHeadBody from '../assets/images/figures/notComplete/dinoHeadBody.png';
import dinoFootLeft from '../assets/images/figures/notComplete/dinoFootLeft.png';
import dinoFootRight from '../assets/images/figures/notComplete/dinoFootRight.png';
import dinoArmLeft from '../assets/images/figures/notComplete/dinoArmLeft.png';
import dinoArmRight from '../assets/images/figures/notComplete/dinoArmRight.png';

// Pixel Images
import head1 from '../assets/images/figures/notComplete/head1.png';
import body1 from '../assets/images/figures/notComplete/body1.png';
import legLeft1 from '../assets/images/figures/notComplete/legLeft1.png';
import legRight1 from '../assets/images/figures/notComplete/legRight1.png';
import armLeft1 from '../assets/images/figures/notComplete/armLeft1.png';
import armRight1 from '../assets/images/figures/notComplete/armRight1.png';

// Stick Figure Images
import StickFigHead from '../assets/images/figures/notComplete/StickFigHead.png';
import StickFigBody from '../assets/images/figures/notComplete/StickFigBody.png';
import StickFigFirstLeg from '../assets/images/figures/notComplete/StickFigFirstLeg.png';
import StickFigBothLegs from '../assets/images/figures/notComplete/StickFigBothLegs.png';
import StickFigFirstArm from '../assets/images/figures/notComplete/StickFigFirstArm.png';
import fullStickFig from '../assets/images/figures/complete/fullStickFig.png';

interface GameScreenProps {
  word: string;
  category?: string;
  difficulty?: Difficulty;
  maxWrongGuesses?: number;
  onGameEnd: (result: GameEndResult) => void;
  onRestart: () => void;
  selectedFigure: string;
  selectedGallowsId: string;
}

export function GameScreen({ word, category, difficulty = DEFAULT_DIFFICULTY, maxWrongGuesses: customMaxWrongGuesses, onGameEnd, onRestart, selectedFigure, selectedGallowsId }: GameScreenProps) {
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

  // Determine which images to show
  let gallowsImage = null;
  const figureImages: string[] = [];
  let figureClass = 'figure-img'; // Standard-Klasse

  // Gallows Logic
  if (selectedGallowsId === 'gallows-default') {
    // Standard Gallows (Now Default)
    if (wrongGuesses >= 1) gallowsImage = galgenRightfoot;
    if (wrongGuesses >= 2) gallowsImage = galgenFullFoot;
    if (wrongGuesses >= 3) gallowsImage = galgenGerade;
    if (wrongGuesses >= 4) gallowsImage = galgenSideSupport;
    if (wrongGuesses >= 5) gallowsImage = galgenFull;
  } else {
    // Other Gallows
    if (selectedGallowsId === 'gallows-1') {
      // Wooden Gallows
      if (wrongGuesses >= 1) gallowsImage = woodenGallowHalfFoot;
      if (wrongGuesses >= 2) gallowsImage = woodenGallowFoot;
      if (wrongGuesses >= 3) gallowsImage = woodenGallowBalken;
      if (wrongGuesses >= 4) gallowsImage = woodenGallowWithoutSupport;
      if (wrongGuesses >= 5) gallowsImage = woodenGallowFull;
    } else if (selectedGallowsId === 'gallows-2') {
      // Temple Gallows
      if (wrongGuesses >= 1) gallowsImage = templeGallowHalfFoot;
      if (wrongGuesses >= 2) gallowsImage = templeGallowFoot;
      if (wrongGuesses >= 3) gallowsImage = templeGallowBalken;
      if (wrongGuesses >= 4) gallowsImage = templeGallowNoSupport;
      if (wrongGuesses >= 5) gallowsImage = templeGallowFull;
    } else {
      // Fallback
      if (wrongGuesses >= 1) gallowsImage = galgenRightfoot;
      if (wrongGuesses >= 2) gallowsImage = galgenFullFoot;
      if (wrongGuesses >= 3) gallowsImage = galgenGerade;
      if (wrongGuesses >= 4) gallowsImage = galgenSideSupport;
      if (wrongGuesses >= 5) gallowsImage = galgenFull;
    }
  }

  // Figure Logic based on Selection
  if (selectedFigure === 'figure-default') {
    // Stick Figure (Standard)
    if (wrongGuesses >= 6) figureImages.push(StickFigHead);
    if (wrongGuesses >= 7) figureImages.push(StickFigBody);
    if (wrongGuesses >= 8) figureImages.push(StickFigFirstLeg);
    if (wrongGuesses >= 9) figureImages.push(StickFigBothLegs);
    if (wrongGuesses >= 10) figureImages.push(StickFigFirstArm);
    if (wrongGuesses >= 11) figureImages.push(fullStickFig);
    figureClass = 'figure-img-stick'; // Spezielle Klasse für Positioning
  } 
  else if (selectedFigure === 'figure-2') {
    // Dino
    if (wrongGuesses === 6) figureImages.push(dinoHead);
    if (wrongGuesses >= 7) figureImages.push(dinoHeadBody);
    if (wrongGuesses >= 8) figureImages.push(dinoFootLeft);
    if (wrongGuesses >= 9) figureImages.push(dinoFootRight);
    if (wrongGuesses >= 10) figureImages.push(dinoArmLeft);
    if (wrongGuesses >= 11) figureImages.push(dinoArmRight);
    figureClass = 'figure-img-dino'; // Spezielle Klasse für Positioning
  }
  else if (selectedFigure === 'figure-1') {
    // Pixel
    if (wrongGuesses >= 6) figureImages.push(head1);
    if (wrongGuesses >= 7) figureImages.push(body1);
    if (wrongGuesses >= 8) figureImages.push(legLeft1);
    if (wrongGuesses >= 9) figureImages.push(legRight1);
    if (wrongGuesses >= 10) figureImages.push(armLeft1);
    if (wrongGuesses >= 11) figureImages.push(armRight1);
    figureClass = 'figure-img-pixel'; // Spezielle Klasse für Positioning
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        {category && <div className="category">Kategorie: {category}</div>}
        <div className="difficulty">Schwierigkeit: {difficultyConfig.name}</div>
        <div className="wrong-guesses">
          Fehler: {wrongGuesses} / {maxWrongGuesses}
        </div>
      </div>

      <div className={`hangman-display ${selectedGallowsId}`}>
        {gallowsImage && <img src={gallowsImage} alt="Galgen" className="gallows-img" />}
        {figureImages.map((img, index) => (
          <img key={index} src={img} alt="Figure Part" className={`figure-img ${figureClass}`} />
        ))}
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

