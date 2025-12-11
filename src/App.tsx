import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { loadWordsFromCSV, getRandomWord, type Word } from './utils/wordLoader';
import './App.css';

type GameMode = 'start' | 'custom' | 'random';
type GameState = {
  mode: GameMode;
  word: string;
  category?: string;
};

function App() {
  const [gameState, setGameState] = useState<GameState>({ mode: 'start', word: '' });
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    // Lade Wörter beim Start
    loadWordsFromCSV().then(loadedWords => {
      setWords(loadedWords);
    });
  }, []);

  const handleStartGame = (mode: 'custom' | 'random', customWord?: string) => {
    if (mode === 'custom' && customWord) {
      setGameState({
        mode: 'custom',
        word: customWord,
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
      });
    }
  };

  const handleGameEnd = (won: boolean) => {
    // Optional: Hier könnte man Statistiken speichern
    console.log(`Spiel beendet: ${won ? 'Gewonnen' : 'Verloren'}`);
  };

  const handleRestart = () => {
    setGameState({ mode: 'start', word: '' });
  };

  return (
    <div className="app">
      {gameState.mode === 'start' ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen
          word={gameState.word}
          category={gameState.category}
          onGameEnd={handleGameEnd}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;

