import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { ShopScreen } from './components/ShopScreen';
import { TestScreen } from './components/TestScreen';
import { loadWordsFromCSV, getRandomWord, type Word } from './utils/wordLoader';
import { Difficulty, DEFAULT_DIFFICULTY, type GameSettings, DEFAULT_SHOP_ITEMS } from './constants/gameConstants';
import { loadSettings } from './utils/settingsUtils';
import { loadShopItems, awardGameCoins } from './utils/shopUtils';
import './App.css';

type GameMode = 'start' | 'custom' | 'random' | 'options';
type GameState = {
  mode: GameMode;
  word: string;
  category?: string;
  difficulty?: Difficulty;
  maxWrongGuesses?: number;
};

// App Component
function App() {
  const [gameState, setGameState] = useState<GameState>({ 
    mode: 'start', 
    word: '',
    difficulty: DEFAULT_DIFFICULTY
  });
  const [words, setWords] = useState<Word[]>([]);
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [showOptions, setShowOptions] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showTest, setShowTest] = useState(false);

  const [selectedFigure, setSelectedFigure] = useState<string>('figure-default');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('background-default');
  const [selectedGallowsId, setSelectedGallowsId] = useState<string>('gallows-default');

  useEffect(() => {
    // Lade Shop Items um ausgerüstete Figur und Hintergrund zu finden
    const shopItems = loadShopItems();
    const equippedFigure = shopItems.find(item => item.category === 'hangman-figures' && item.equipped);
    if (equippedFigure) {
      setSelectedFigure(equippedFigure.id);
    }
    
    const equippedBackground = shopItems.find(item => item.category === 'backgrounds' && item.equipped);
    if (equippedBackground) {
      setSelectedBackgroundId(equippedBackground.id);
    }

    const equippedGallows = shopItems.find(item => item.category === 'gallows' && item.equipped);
    if (equippedGallows) {
      setSelectedGallowsId(equippedGallows.id);
    }
  }, [showShop]); // Update wenn Shop geschlossen wird

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

  const handleOpenShop = () => {
    setShowShop(true);
  };

    const handleCloseShop = () => {
      setShowShop(false);
    };

    const handleOpenTest = () => {
      setShowTest(true);
    };

    const handleCloseTest = () => {
      setShowTest(false);
    };

    const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleGameEnd = (result: {
    won: boolean;
    wrongGuesses: number;
    maxWrongGuesses: number;
    difficulty: Difficulty;
  }) => {
    awardGameCoins(
      result.won,
      result.wrongGuesses,
      result.maxWrongGuesses,
      result.difficulty
    );
  };

  const handleRestart = () => {
    setGameState({ 
      mode: 'start', 
      word: '', 
      difficulty: settings?.difficulty ?? DEFAULT_DIFFICULTY,
      maxWrongGuesses: settings?.maxWrongGuesses
    });
  };


  // Hilfsfunktion um das Hintergrundbild basierend auf der ID zu bekommen
  const getBackgroundImage = () => {
    const item = DEFAULT_SHOP_ITEMS.find(i => i.id === selectedBackgroundId);
    return item?.imagePath;
  };

  const backgroundImage = getBackgroundImage();

  return (
    <div 
      className="app"
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      {gameState.mode === 'start' ? (
        <StartScreen 
          onStartGame={handleStartGame}
          onOpenOptions={handleOpenOptions}
          onOpenShop={handleOpenShop}
          onOpenTest={handleOpenTest}
        />
      ) : (
        <GameScreen
          word={gameState.word}
          category={gameState.category}
          difficulty={gameState.difficulty}
          maxWrongGuesses={gameState.maxWrongGuesses}
          onGameEnd={handleGameEnd}
          onRestart={handleRestart}
          selectedFigure={selectedFigure}
          selectedGallowsId={selectedGallowsId}
        />
      )}
      {showOptions && (
        <OptionsScreen
          onClose={handleCloseOptions}
          onSettingsChange={handleSettingsChange}
        />
      )}
      {showShop && (
        <ShopScreen
          onClose={handleCloseShop}
        />
      )}
      {showTest && (
        <TestScreen
          onBack={handleCloseTest}
        />
      )}
    </div>
  );
}

export default App;
