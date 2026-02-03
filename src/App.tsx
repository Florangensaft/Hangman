import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { ShopScreen } from './components/ShopScreen';
import { TestScreen } from './components/TestScreen';
import { loadWordsFromCSV, getRandomWord, type Word } from './utils/wordLoader';
import { Difficulty, DEFAULT_DIFFICULTY, type GameSettings, DEFAULT_SHOP_ITEMS } from './constants/gameConstants';
import { loadSettings } from './utils/settingsUtils';
import { loadShopItems, awardGameCoins, loadCoins, saveCoins } from './utils/shopUtils';
import './App.css';

type GameMode = 'start' | 'custom' | 'random' | 'options' | 'endless';
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
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [showOptions, setShowOptions] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showTest, setShowTest] = useState(false);

  // Neue States für Features
  const [winstreak, setWinstreak] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(() => loadCoins());

  const [selectedFigure, setSelectedFigure] = useState<string>('figure-default');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('background-default');
  const [selectedGallowsId, setSelectedGallowsId] = useState<string>('gallows-default');

  useEffect(() => {
    const shopItems = loadShopItems();
    const equippedFigure = shopItems.find(item => item.category === 'hangman-figures' && item.equipped);
    if (equippedFigure) setSelectedFigure(equippedFigure.id);
    
    const equippedBackground = shopItems.find(item => item.category === 'backgrounds' && item.equipped);
    if (equippedBackground) setSelectedBackgroundId(equippedBackground.id);

    const equippedGallows = shopItems.find(item => item.category === 'gallows' && item.equipped);
    if (equippedGallows) setSelectedGallowsId(equippedGallows.id);
    
    setCurrentCoins(loadCoins());
  }, [showShop]);

  useEffect(() => {
    loadWordsFromCSV().then(loadedWords => setWords(loadedWords));
  }, []);

  const handleStartGame = (mode: 'custom' | 'random' | 'endless', customWord?: string) => {
    if (!settings) return;
    
    if (mode === 'endless') {
      setWinstreak(0);
      const randomWord = getRandomWord(words.length > 0 ? words : [{ wort: 'APFEL', kategorie: 'Obst' }]);
      setGameState({
        mode: 'endless',
        word: randomWord.wort,
        category: randomWord.kategorie,
        difficulty: settings.difficulty,
        maxWrongGuesses: settings.maxWrongGuesses,
      });
    } else if (mode === 'custom' && customWord) {
      setGameState({ mode: 'custom', word: customWord, difficulty: settings.difficulty, maxWrongGuesses: settings.maxWrongGuesses });
    } else if (mode === 'random') {
      const randomWord = getRandomWord(words);
      setGameState({ mode: 'random', word: randomWord.wort, category: randomWord.kategorie, difficulty: settings.difficulty, maxWrongGuesses: settings.maxWrongGuesses });
    }
  };

  const handleGameEnd = (result: { won: boolean; wrongGuesses: number; maxWrongGuesses: number; difficulty: Difficulty; }) => {
    if (gameState.mode === 'endless') {
      if (result.won) {
        const nextStreak = winstreak + 1;
        setWinstreak(nextStreak);
        
        // Bonus: 1 Coin + 1 extra alle 10 Siege
        const earned = 1 + Math.floor(nextStreak / 10);
        const newTotal = loadCoins() + earned;
        saveCoins(newTotal);
        setCurrentCoins(newTotal);

        // Automatischer Reset zum nächsten Wort
        setTimeout(() => {
          const nextWord = getRandomWord(words);
          setGameState(prev => ({ ...prev, word: nextWord.wort, category: nextWord.kategorie }));
        }, 1200);
      }
    } else {
      awardGameCoins(result.won, result.wrongGuesses, result.maxWrongGuesses, result.difficulty);
      setCurrentCoins(loadCoins());
    }
  };

  const handleRestart = () => {
    setGameState({ 
      mode: 'start', word: '', 
      difficulty: settings?.difficulty ?? DEFAULT_DIFFICULTY,
      maxWrongGuesses: settings?.maxWrongGuesses
    });
  };

  const backgroundImage = DEFAULT_SHOP_ITEMS.find(i => i.id === selectedBackgroundId)?.imagePath;

  return (
    <div className="app" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}>
      
      {/* Coin Anzeige permanent unten rechts */}
      <div className="persistent-coins-badge" onClick={() => setShowShop(true)}>
        <span className="coin-icon">🪙</span> {currentCoins}
      </div>

      {gameState.mode === 'start' ? (
        <StartScreen 
          onStartGame={handleStartGame}
          onOpenOptions={() => setShowOptions(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenTest={() => setShowTest(true)}
        />
      ) : (
        <GameScreen
          word={gameState.word}
          category={gameState.category}
          difficulty={gameState.difficulty}
          maxWrongGuesses={gameState.maxWrongGuesses}
          winstreak={gameState.mode === 'endless' ? winstreak : undefined}
          onGameEnd={handleGameEnd}
          onRestart={handleRestart}
          selectedFigure={selectedFigure}
          selectedGallowsId={selectedGallowsId}
        />
      )}

      {showOptions && <OptionsScreen onClose={() => setShowOptions(false)} onSettingsChange={setSettings} />}
      {showShop && <ShopScreen onClose={() => setShowShop(false)} />}
      {showTest && <TestScreen onBack={() => setShowTest(false)} />}
    </div>
  );
}

export default App;