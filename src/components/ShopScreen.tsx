import { useState, useEffect } from 'react';
import './ShopScreen.css';
import { 
  type ShopCategory, 
  type ShopItem,
  SHOP_CATEGORIES 
} from '../constants/gameConstants';
import { loadShopItems, loadCoins, saveCoins, purchaseItem, equipItem } from '../utils/shopUtils';

interface ShopScreenProps {
  onClose: () => void;
}

export function ShopScreen({ onClose }: ShopScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('hangman-figures');
  const [shopItems, setShopItems] = useState<ShopItem[]>(loadShopItems());
  const [coins, setCoins] = useState<number>(loadCoins());
  const [message, setMessage] = useState<string>('');
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  useEffect(() => {
    // Lade aktuelle Daten beim Öffnen
    setShopItems(loadShopItems());
    setCoins(loadCoins());
  }, []);

  const handlePurchase = (itemId: string) => {
    const result = purchaseItem(itemId, shopItems, coins);
    setShopItems(result.newItems);
    setCoins(result.newCoins);
    setMessage(result.message);
    
    // Nach 3 Sekunden Nachricht entfernen
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEquip = (itemId: string, category: ShopCategory) => {
    if (!shopItems.find(item => item.id === itemId)?.unlocked) {
      setMessage('Item muss erst gekauft werden!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const newItems = equipItem(itemId, category, shopItems);
    setShopItems(newItems);
    setMessage('Item ausgerüstet!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBuyCoins = () => {
    // Füge 1000 Coins hinzu ("Mama's Kreditkarte")
    const currentCoins = typeof coins === 'number' ? coins : 0;
    const newCoins = currentCoins + 1000;
    
    console.log(`Füge 1000 Coins hinzu. Alt: ${currentCoins}, Neu: ${newCoins}`);
    
    saveCoins(newCoins);
    setCoins(newCoins);
    setShowBuyCoins(false);
    setMessage('🎉 Danke Mama! 1000 Coins erhalten!');
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  return (
    <div className="shop-screen">
      {/* Pseudo-Shop Modal */}
      {showBuyCoins && (
        <div className="buy-coins-modal" onClick={() => setShowBuyCoins(false)}>
          <div className="buy-coins-content" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Coins kaufen</h2>
            <p>Möchten Sie <strong>1.000 Coins</strong> für <strong>99,99€</strong> kaufen?</p>
            <div className="buy-coins-buttons">
              <button className="buy-button fake" onClick={() => alert('Fehler: Verbindung zur Bank fehlgeschlagen (Zum Glück!)')}>
                Kaufen (99,99€)
              </button>
              <button className="buy-button mom" onClick={handleBuyCoins}>
                💳 Mama's Kreditkarte (Gratis)
              </button>
              <button className="cancel-button" onClick={() => setShowBuyCoins(false)}>
                Abbrechen
              </button>
            </div>
            <p className="disclaimer">*Dies ist nur eine Simulation. Es wird kein echtes Geld abgebucht.</p>
          </div>
        </div>
      )}

      <div className="shop-container">
        <div className="shop-header">
          <h1>🛒 Shop</h1>
          <div className="coins-display" onClick={() => setShowBuyCoins(true)} title="Klicken um Coins zu kaufen">
            <span className="coins-icon">🪙</span>
            <span className="coins-amount">{coins}</span>
            <span className="add-coins-badge">+</span>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {message && (
          <div className={`shop-message ${message.includes('erfolgreich') || message.includes('ausgerüstet') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Kategorien */}
        <div className="shop-categories">
          {(Object.keys(SHOP_CATEGORIES) as ShopCategory[]).map(category => {
            const categoryInfo = SHOP_CATEGORIES[category];
            return (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-icon">{categoryInfo.icon}</span>
                <span className="category-name">{categoryInfo.name}</span>
              </button>
            );
          })}
        </div>

        {/* Items */}
        <div className="shop-items">
          {filteredItems.length === 0 ? (
            <div className="no-items">Keine Items in dieser Kategorie verfügbar.</div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`shop-item ${item.unlocked ? 'unlocked' : 'locked'} ${item.equipped ? 'equipped' : ''}`}
              >
                <div className="item-image">
                  {item.imagePath ? (
                    <img src={item.imagePath} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">
                      {SHOP_CATEGORIES[item.category].icon}
                    </div>
                  )}
                  {item.equipped && <div className="equipped-badge">✓ Ausgerüstet</div>}
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="item-footer">
                    {item.unlocked ? (
                      <div className="item-actions">
                        {!item.equipped && (
                          <button 
                            className="equip-button"
                            onClick={() => handleEquip(item.id, item.category)}
                          >
                            Ausrüsten
                          </button>
                        )}
                        {item.equipped && (
                          <span className="equipped-text">Ausgerüstet</span>
                        )}
                      </div>
                    ) : (
                      <div className="item-purchase">
                        <span className="item-price">🪙 {item.price}</span>
                        <button 
                          className={`purchase-button ${coins >= item.price ? '' : 'disabled'}`}
                          onClick={() => handlePurchase(item.id)}
                          disabled={coins < item.price}
                        >
                          Kaufen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
