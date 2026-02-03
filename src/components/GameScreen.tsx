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
  winstreak?: number; // Prop für Endlos-Modus
  onGameEnd: (result: GameEndResult) => void;
  onRestart: () => void;
  selectedFigure: string;
  selectedGallowsId: string;
}

export function GameScreen({ 
  word, 
  category, 
  difficulty = DEFAULT_DIFFICULTY, 
  maxWrongGuesses: customMaxWrongGuesses, 
  winstreak, 
  onGameEnd, 
  onRestart, 
  selectedFigure, 
  selectedGallowsId 
}: GameScreenProps) {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [wrongLettersSet, setWrongLettersSet] = useState<Set<string>>(new Set());
  
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const maxWrongGuesses = customMaxWrongGuesses ?? GAME_CONFIG.MAX_WRONG_GUESSES;

  const normalizedWord = word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const displayWord = word.toUpperCase();

  // Reset-Logik für Endlos-Modus: Wenn ein neues Wort reinkommt, alles zurücksetzen
  useEffect(() => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
    setWrongLettersSet(new Set());
  }, [word]);

  // Prüfe ob Spiel gewonnen
  useEffect(() => {
    if (gameWon || gameLost) return;
    const allLettersGuessed = normalizedWord
      .split('')
      .filter(char => /[A-Z]/.test(char))
      .every(char => guessedLetters.has(char));
    
    if (allLettersGuessed && normalizedWord.length > 0) {
      setGameWon(true);
      onGameEnd({ won: true, wrongGuesses, maxWrongGuesses, difficulty });
    }
  }, [gameWon, gameLost, guessedLetters, normalizedWord, wrongGuesses, maxWrongGuesses, difficulty, onGameEnd]);

  // Prüfe ob Spiel verloren
  useEffect(() => {
    if (gameWon || gameLost) return;
    if (wrongGuesses >= maxWrongGuesses) {
      setGameLost(true);
      onGameEnd({ won: false, wrongGuesses, maxWrongGuesses, difficulty });
    }
  }, [gameWon, gameLost, wrongGuesses, maxWrongGuesses, difficulty, onGameEnd]);

  const handleLetterClick = useCallback((letter: string) => {
    if (gameWon || gameLost || guessedLetters.has(letter)) return;

    const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isInWord = normalizedWord.includes(normalizedLetter);

    setGuessedLetters(prev => new Set(prev).add(letter));

    if (!isInWord) {
      if (difficultyConfig.doublePenaltyOnDuplicate && wrongLettersSet.has(normalizedLetter)) {
        setWrongGuesses(prev => prev + GAME_CONFIG.DUPLICATE_PENALTY_MULTIPLIER);
      } else {
        setWrongGuesses(prev => prev + 1);
      }
      setWrongLettersSet(prev => new Set(prev).add(normalizedLetter));
    }
  }, [guessedLetters, normalizedWord, gameWon, gameLost, difficultyConfig, wrongLettersSet]);

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
        if (!/[A-ZÄÖÜ]/.test(char)) return char;
        const normalizedChar = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return guessedLetters.has(char) || guessedLetters.has(normalizedChar) ? char : '_';
      })
      .join(' ');
  };

  // Image Logic
  let gallowsImage = null;
  const figureImages: string[] = [];
  let figureClass = 'figure-img';

  if (selectedGallowsId === 'gallows-default') {
    if (wrongGuesses >= 1) gallowsImage = galgenRightfoot;
    if (wrongGuesses >= 2) gallowsImage = galgenFullFoot;
    if (wrongGuesses >= 3) gallowsImage = galgenGerade;
    if (wrongGuesses >= 4) gallowsImage = galgenSideSupport;
    if (wrongGuesses >= 5) gallowsImage = galgenFull;
  } else if (selectedGallowsId === 'gallows-1') {
    if (wrongGuesses >= 1) gallowsImage = woodenGallowHalfFoot;
    if (wrongGuesses >= 2) gallowsImage = woodenGallowFoot;
    if (wrongGuesses >= 3) gallowsImage = woodenGallowBalken;
    if (wrongGuesses >= 4) gallowsImage = woodenGallowWithoutSupport;
    if (wrongGuesses >= 5) gallowsImage = woodenGallowFull;
  } else if (selectedGallowsId === 'gallows-2') {
    if (wrongGuesses >= 1) gallowsImage = templeGallowHalfFoot;
    if (wrongGuesses >= 2) gallowsImage = templeGallowFoot;
    if (wrongGuesses >= 3) gallowsImage = templeGallowBalken;
    if (wrongGuesses >= 4) gallowsImage = templeGallowNoSupport;
    if (wrongGuesses >= 5) gallowsImage = templeGallowFull;
  }

  if (selectedFigure === 'figure-default') {
    if (wrongGuesses >= 6) figureImages.push(StickFigHead);
    if (wrongGuesses >= 7) figureImages.push(StickFigBody);
    if (wrongGuesses >= 8) figureImages.push(StickFigFirstLeg);
    if (wrongGuesses >= 9) figureImages.push(StickFigBothLegs);
    if (wrongGuesses >= 10) figureImages.push(StickFigFirstArm);
    if (wrongGuesses >= 11) figureImages.push(fullStickFig);
    figureClass = 'figure-img-stick';
  } else if (selectedFigure === 'figure-1') {
    if (wrongGuesses >= 6) figureImages.push(head1);
    if (wrongGuesses >= 7) figureImages.push(body1);
    if (wrongGuesses >= 8) figureImages.push(legLeft1);
    if (wrongGuesses >= 9) figureImages.push(legRight1);
    if (wrongGuesses >= 10) figureImages.push(armLeft1);
    if (wrongGuesses >= 11) figureImages.push(armRight1);
    figureClass = 'figure-img-pixel';
  } else if (selectedFigure === 'figure-2') {
    if (wrongGuesses === 6) figureImages.push(dinoHead);
    if (wrongGuesses >= 7) figureImages.push(dinoHeadBody);
    if (wrongGuesses >= 8) figureImages.push(dinoFootLeft);
    if (wrongGuesses >= 9) figureImages.push(dinoFootRight);
    if (wrongGuesses >= 10) figureImages.push(dinoArmLeft);
    if (wrongGuesses >= 11) figureImages.push(dinoArmRight);
    figureClass = 'figure-img-dino';
  }

  return (
    <div className="game-screen">
      {/* Winstreak Anzeige */}
      {winstreak !== undefined && (
        <div className="streak-banner">🔥 Streak: {winstreak}</div>
      )}

      <div className="game-header">
        {category && <div className="category">Kategorie: {category}</div>}
        <div className="difficulty">Schwierigkeit: {difficultyConfig.name}</div>
        <div className="wrong-guesses">Fehler: {wrongGuesses} / {maxWrongGuesses}</div>
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

      {/* Normales Modal: Nur wenn KEINE Winstreak aktiv ist (kein Endlos-Modus) */}
      {gameWon && winstreak === undefined && (
        <div className="game-over win">
          <h2>{MESSAGES.WIN}</h2>
          <p>Das Wort war: <strong>{word}</strong></p>
          <p className="coins-earned">
            Du hast {calculateCoins(true, wrongGuesses, maxWrongGuesses, difficulty)} Coins verdient!
          </p>
          <button onClick={onRestart}>Nochmal spielen</button>
        </div>
      )}

      {/* Endlos Feedback: Kurzes Overlay statt Modal bei Sieg in der Streak */}
      {gameWon && winstreak !== undefined && (
        <div className="endless-win-feedback">
          <h2 className="animate-pop">Richtig! 🎉</h2>
          <p>Nächstes Wort kommt...</p>
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

      {!gameLost && (
        <div className={`alphabet ${(gameWon && winstreak !== undefined) ? 'disabled' : ''}`}>
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.has(letter);
            const normalizedLetter = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const isCorrect = isGuessed && normalizedWord.includes(normalizedLetter);
            const showWrong = !difficultyConfig.hideWrongLetters && isGuessed && !normalizedWord.includes(normalizedLetter);

            return (
              <button
                key={letter}
                className={`letter-button ${showWrong ? 'wrong' : ''} ${isCorrect ? 'correct' : ''} ${isGuessed ? 'guessed' : ''}`}
                onClick={() => handleLetterClick(letter)}
                disabled={isGuessed || (gameWon && winstreak !== undefined)}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      <button className="restart-button" onClick={onRestart}>Hauptmenü</button>
    </div>
  );
}

