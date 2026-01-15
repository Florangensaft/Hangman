import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { loadWordsFromCSV, getRandomWord, type Word } from './utils/wordLoader';
import { Difficulty, DEFAULT_DIFFICULTY, type GameSettings } from './constants/gameConstants';
import { loadSettings } from './utils/settingsUtils';
import './App.css';

type GameMode = 'start' | 'custom' | 'random' | 'options';
type GameState = {
  mode: GameMode;
  word: string;
  category?: string;
  difficulty?: Difficulty;
  maxWrongGuesses?: number;
};

function App() {
  const [gameState, setGameState] = useState<GameState>({ 
    mode: 'start', 
    word: '',
    difficulty: DEFAULT_DIFFICULTY
  });
  const [words, setWords] = useState<Word[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Lade Einstellungen beim Start
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, []);

  useEffect(() => {
    // Lade Wörter beim Start
    loadWordsFromCSV().then(loadedWords => {
      setWords(loadedWords);
    });
  }, []);

  const handleStartGame = (mode: 'custom' | 'random', customWord?: string) => {
    if (!settings) return; // Warte bis Settings geladen sind
    
    if (mode === 'custom' && customWord) {
      setGameState({
        mode: 'custom',
        word: customWord,
        difficulty: settings.difficulty,
        maxWrongGuesses: settings.maxWrongGuesses,
      });
    } else if (mode === 'random') {
      const randomWord = getRandomWord(words.length > 0 ? words : [
        { wort: 'APFEL', kategorie: 'Obst' },
        { wort: 'COMPUTER', kategorie: 'Technik' },
        { wort: 'SCHULE', kategorie: 'Bildung' }
      ]);
      setGameState({
        mode: 'random',
        word: randomWord.wort,
        category: randomWord.kategorie,
        difficulty: settings.difficulty,
        maxWrongGuesses: settings.maxWrongGuesses,
      });
    }
  };

  const handleOpenOptions = () => {
    setShowOptions(true);
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleGameEnd = (won: boolean) => {
    // Optional: Hier könnte man Statistiken speichern
    console.log(`Spiel beendet: ${won ? 'Gewonnen' : 'Verloren'}`);
  };

  const handleRestart = () => {
    setGameState({ 
      mode: 'start', 
      word: '', 
      difficulty: settings?.difficulty ?? DEFAULT_DIFFICULTY,
      maxWrongGuesses: settings?.maxWrongGuesses
    });
  };

  // Warte bis Settings geladen sind
  if (!settings) {
    return <div className="app">Lade...</div>;
  }

  return (
    <div className="app">
      {gameState.mode === 'start' ? (
        <StartScreen 
          onStartGame={handleStartGame}
          onOpenOptions={handleOpenOptions}
        />
      ) : (
        <GameScreen
          word={gameState.word}
          category={gameState.category}
          difficulty={gameState.difficulty}
          maxWrongGuesses={gameState.maxWrongGuesses}
          onGameEnd={handleGameEnd}
          onRestart={handleRestart}
        />
      )}
      {showOptions && (
        <OptionsScreen
          onClose={handleCloseOptions}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </div>
  );
}

export default App;

