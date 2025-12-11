import { useState } from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: (mode: 'custom' | 'random', word?: string) => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  const [customWord, setCustomWord] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = customWord.trim().toUpperCase();
    if (word.length > 0) {
      // Nur Buchstaben erlauben
      if (/^[A-ZÄÖÜß]+$/.test(word)) {
        onStartGame('custom', word);
      } else {
        alert('Bitte geben Sie nur Buchstaben ein!');
      }
    }
  };

  return (
    <div className="start-screen">
      <h1>🎮 Hangman</h1>
      <div className="game-modes">
        {!showInput ? (
          <>
            <button 
              className="mode-button" 
              onClick={() => setShowInput(true)}
            >
              ✏️ Selbst eingeben
            </button>
            <button 
              className="mode-button" 
              onClick={() => onStartGame('random')}
            >
              🎲 Überrasche mich
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
                maxLength={20}
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

