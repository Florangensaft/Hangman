import { useState, useEffect } from 'react';
import { DEFAULT_SHOP_ITEMS, type ShopItem } from '../constants/gameConstants';
import './TestScreen.css';

interface TestScreenProps {
  onBack: () => void;
}

export function TestScreen({ onBack }: TestScreenProps) {
  // Filter items by category
  const figures = DEFAULT_SHOP_ITEMS.filter(i => i.category === 'hangman-figures');
  const gallows = DEFAULT_SHOP_ITEMS.filter(i => i.category === 'gallows');

  // State for selected items
  const [selectedFigureId, setSelectedFigureId] = useState<string>(figures[0]?.id || '');
  const [selectedGallowsId, setSelectedGallowsId] = useState<string>(gallows[0]?.id || '');

  // State for positioning
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);

  // Get current item objects
  const activeFigure = figures.find(f => f.id === selectedFigureId);
  const activeGallows = gallows.find(g => g.id === selectedGallowsId);

  return (
    <div className="test-screen">
      <div className="test-header">
        <h1>🧪 Asset Test Labor</h1>
        <button className="back-button" onClick={onBack}>Zurück</button>
      </div>

      <div className="test-content">
        <div className="preview-container">
          <div className="preview-box">
            {/* Background: Gallows */}
            {activeGallows?.imagePath && (
              <img 
                src={activeGallows.imagePath} 
                className="gallows-layer" 
                alt="Galgen" 
              />
            )}
            
            {/* Foreground: Figure */}
            {activeFigure?.imagePath && (
              <img 
                src={activeFigure.imagePath} 
                className="figure-layer" 
                alt="Figur"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
                }}
              />
            )}
          </div>
        </div>

        <div className="controls-panel">
          <div className="control-group">
            <h3>Auswahl</h3>
            <label>
              Galgen:
              <select 
                value={selectedGallowsId} 
                onChange={(e) => setSelectedGallowsId(e.target.value)}
              >
                {gallows.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <label>
              Figur:
              <select 
                value={selectedFigureId} 
                onChange={(e) => setSelectedFigureId(e.target.value)}
              >
                {figures.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="control-group">
            <h3>Positionierung (Figur)</h3>
            <label>
              X-Offset ({offsetX}px):
              <input 
                type="range" 
                min="-200" 
                max="200" 
                value={offsetX} 
                onChange={(e) => setOffsetX(Number(e.target.value))} 
              />
            </label>
            <label>
              Y-Offset ({offsetY}px):
              <input 
                type="range" 
                min="-200" 
                max="200" 
                value={offsetY} 
                onChange={(e) => setOffsetY(Number(e.target.value))} 
              />
            </label>
            <label>
              Skalierung ({scale}x):
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.1"
                value={scale} 
                onChange={(e) => setScale(Number(e.target.value))} 
              />
            </label>
            <button onClick={() => { setOffsetX(0); setOffsetY(0); setScale(1); }}>
              Reset Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
