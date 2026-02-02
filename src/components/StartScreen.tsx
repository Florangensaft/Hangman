import { useState } from 'react';
import './StartScreen.css';
import { WORD_CONFIG, MESSAGES, UI_CONFIG } from '../constants/gameConstants';
import { loadWordList, saveWordList, addWordSafe, removeWord, type WordListData } from '../utils/wordlistUtils';

interface StartScreenProps {
  onStartGame: (mode: 'custom' | 'random', word?: string) => void;
  onOpenOptions?: () => void;
  onOpenShop?: () => void;
}

export function StartScreen({ onStartGame, onOpenOptions, onOpenShop }: StartScreenProps) {
  const [customWord, setCustomWord] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Neu: Wortlisten-UI
  const [showWordlist, setShowWordlist] = useState(false);
  const [wordlist, setWordlist] = useState<WordListData>(() => loadWordList());
  const [newWord, setNewWord] = useState('');
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select');
  const [selectedCategory, setSelectedCategory] = useState(wordlist.categories[0] ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [wlMessage, setWlMessage] = useState<string>('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = customWord.trim().toUpperCase();
    if (word.length > 0) {
      if (word.length < WORD_CONFIG.MIN_LENGTH) { alert(MESSAGES.WORD_TOO_SHORT); return; }
      if (word.length > WORD_CONFIG.MAX_LENGTH) { alert(MESSAGES.WORD_TOO_LONG); return; }
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
        onStartGame('random');
        break;
      case 'mehrspieler':
        setShowInput(true);
        setShowWordlist(false);
        break;
      case 'wortliste':
        setShowWordlist(true);
        setShowInput(false);
        break;
      case 'optionen':
        onOpenOptions?.();
        break;
      default:
        break;
    }
  };

  const handleShopClick = () => onOpenShop?.();

  // Wortliste: hinzufügen
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newWord.trim().toUpperCase();
    const category = (categoryMode === 'select' ? selectedCategory : newCategory).trim().toUpperCase();

    if (word.length < WORD_CONFIG.MIN_LENGTH) { setWlMessage(MESSAGES.WORD_TOO_SHORT); return; }
    if (word.length > WORD_CONFIG.MAX_LENGTH) { setWlMessage(MESSAGES.WORD_TOO_LONG); return; }
    if (!WORD_CONFIG.LETTERS_ONLY.test(word)) { setWlMessage(MESSAGES.INVALID_WORD); return; }
    if (!category) { setWlMessage('Bitte eine Kategorie wählen oder neu anlegen.'); return; }

    const res = addWordSafe(wordlist, { word, category });
    if (!res.ok || !res.next) { setWlMessage(res.error ?? 'Unbekannter Fehler.'); return; }
    saveWordList(res.next);
    setWordlist(res.next);
    setWlMessage(`✔️ Hinzugefügt: ${word} in ${category}`);
    setNewWord('');
    if (categoryMode === 'new') {
      setSelectedCategory(category);
      setCategoryMode('select');
      setNewCategory('');
    }
  };

  // Wortliste: löschen (optional)
  const handleRemoveWord = (word: string, category: string) => {
    const next = removeWord(wordlist, { word, category });
    saveWordList(next);
    setWordlist(next);
  };

  return (
    <div className="start-screen">
      <button className="shop-button" onClick={handleShopClick}>Shop</button>
      <h1>🎮 Hangman</h1>

      <div className="game-modes">
        {!showInput && !showWordlist ? (
          <>
            <button className="mode-button" onClick={() => handleMenuClick('einzelspieler')}>🎯 Einzelspieler</button>
            <button className="mode-button" onClick={() => handleMenuClick('mehrspieler')}>👥 Mehrspieler</button>
            <button className="mode-button" onClick={() => handleMenuClick('wortliste')}>📝 Wortliste Erweitern</button>
            <button className="mode-button" onClick={() => handleMenuClick('optionen')}>⚙️ Optionen</button>
          </>
        ) : showInput ? (
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
              <button type="button" onClick={() => { setShowInput(false); setCustomWord(''); }}>Zurück</button>
            </div>
            <p className="hint">💡 Tipp: Nach der Eingabe können Sie den Computer an einen anderen Spieler weitergeben.</p>
          </form>
        ) : (
          /* --- Wortlisten-Panel --- */
          <div className="wordlist-panel">
            <h2>📝 Wortliste erweitern</h2>
            <form className="wordlist-form" onSubmit={handleAddWord}>
              <label>
                Wort
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                  placeholder="z. B. ELEFANT"
                  maxLength={UI_CONFIG.INPUT_MAX_LENGTH}
                />
              </label>

              <div className="category-row">
                <label className="category-label">Kategorie</label>
                <div className="category-switch">
                  <label><input type="radio" checked={categoryMode==='select'} onChange={()=>setCategoryMode('select')} /> Bestehende</label>
                  <label><input type="radio" checked={categoryMode==='new'} onChange={()=>setCategoryMode('new')} /> Neue</label>
                </div>
              </div>

              {categoryMode === 'select' ? (
                <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}>
                  {wordlist.categories.length === 0 && <option value="">(keine Kategorien)</option>}
                  {wordlist.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e)=>setNewCategory(e.target.value.toUpperCase())}
                  placeholder="NEUE KATEGORIE"
                />
              )}

              <div className="form-buttons">
                <button type="submit">Hinzufügen</button>
                <button type="button" onClick={() => { setShowWordlist(false); setWlMessage(''); }}>Zurück</button>
              </div>

              {wlMessage && <p className="hint">{wlMessage}</p>}
            </form>

            <div className="wordlist-list">
              <h3>Aktuelle Wörter</h3>
              {wordlist.words.length === 0 ? (
                <p className="hint">Noch keine Wörter vorhanden.</p>
              ) : (
                <ul>
                  {wordlist.words.map((w) => (
                    <li key={`${w.category}:${w.word}`}>
                      <span className="badge">{w.category}</span> {w.word}
                      <button className="mini-delete" onClick={() => handleRemoveWord(w.word, w.category)}>Löschen</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
