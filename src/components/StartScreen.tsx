import { useState } from 'react';
import './StartScreen.css';
import { WORD_CONFIG, MESSAGES, UI_CONFIG } from '../constants/gameConstants';

interface StartScreenProps {
  onStartGame: (mode: 'custom' | 'random', word?: string) => void;
  onOpenOptions?: () => void;
  onOpenShop?: () => void;
}

export function StartScreen({ onStartGame, onOpenOptions, onOpenShop }: StartScreenProps) {
  const [customWord, setCustomWord] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = customWord.trim().toUpperCase();
    if (word.length > 0) {
      // Validierung der Wortlänge
      if (word.length < WORD_CONFIG.MIN_LENGTH) {
        alert(MESSAGES.WORD_TOO_SHORT);
        return;
      }
      if (word.length > WORD_CONFIG.MAX_LENGTH) {
        alert(MESSAGES.WORD_TOO_LONG);
        return;
      }
      // Nur Buchstaben erlauben
      if (WORD_CONFIG.LETTERS_ONLY.test(word)) {
        onStartGame('custom', word);
      } else {
        alert(MESSAGES.INVALID_WORD);
      }
    }
  };

  const handleMenuClick = (menuItem: string) => {
    switch (menuItem) {
      case 'einzelspieler':
        // Startet das Spiel mit zufälligem Wort
        onStartGame('random');
        break;
      case 'mehrspieler':
        // Öffnet das Formular zum Eingeben eines Wortes
        setShowInput(true);
        break;
      case 'wortliste':
        // Platzhalter - Logik kommt später
        alert('Wortliste erweitern kommt bald!');
        break;
      case 'optionen':
        // Öffnet das Options-Menü
        onOpenOptions?.();
        break;
      default:
        break;
    }
  };

  const handleShopClick = () => {
    onOpenShop?.();
  };

  return (
    <div className="start-screen">
      <button className="shop-button" onClick={handleShopClick}>
        Shop
      </button>
      
      <h1>🎮 Hangman</h1>
      
      <div className="game-modes">
        {!showInput ? (
          <>
            <button 
              className="mode-button" 
              onClick={() => handleMenuClick('einzelspieler')}
            >
              🎯 Einzelspieler
            </button>
            <button 
              className="mode-button" 
              onClick={() => handleMenuClick('mehrspieler')}
            >
              👥 Mehrspieler
            </button>
            <button 
              className="mode-button" 
              onClick={() => handleMenuClick('wortliste')}
            >
              📝 Wortliste Erweitern
            </button>
            <button 
              className="mode-button" 
              onClick={() => handleMenuClick('optionen')}
            >
              ⚙️ Optionen
            </button>
          </>
        ) : (
          <form onSubmit={handleCustomSubmit} className="custom-word-form">
            <label>
              Geben Sie ein Wort ein:
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value.toUpperCase())}
                placeholder="Wort eingeben..."
                autoFocus
                maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
              />
            </label>
            <div className="form-buttons">
              <button type="submit">Bestätigen</button>
              <button type="button" onClick={() => {
                setShowInput(false);
                setCustomWord('');
              }}>
                Zurück
              </button>
            </div>
            <p className="hint">
              💡 Tipp: Nach der Eingabe können Sie den Computer an einen anderen Spieler weitergeben.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

