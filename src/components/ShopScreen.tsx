import { useState, useEffect } from 'react';
import './ShopScreen.css';
import { 
  type ShopCategory, 
  type ShopItem,
  SHOP_CATEGORIES 
} from '../constants/gameConstants';
import { loadShopItems, loadCoins, purchaseItem, equipItem, saveCoins } from '../utils/shopUtils';

type PaymentMethod = 'paypal' | 'card' | 'paysafe';
type PaymentStep = 'select' | 'paypal' | 'card' | 'paysafe' | 'success';
interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  amount?: number;     // Coins, die gutgeschrieben werden (Default: 1000)
  priceEuro?: number;  // Anzeige-Preis (Default: 99.99)
}
/**
 * PaymentModal – simuliert einen kleinen Checkout-Dialog:
 * Methode wählen -> Eingaben/Weiterleitung -> Success (immer positiv).
 */
function PaymentModal({
  visible,
  onClose,
  onSuccess,
  amount = 1000,
  priceEuro = 99.99
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('select');
  const [, setMethod] = useState<PaymentMethod | null>(null);
  // Simple Formstates (keine echte Validierung, da immer erfolgreich)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [paysafeCode, setPaysafeCode] = useState('');
  useEffect(() => {
    if (visible) {
      setStep('select');
      setMethod(null);
      setCard({ number: '', name: '', expiry: '', cvc: '' });
      setPaysafeCode('');
    }
  }, [visible]);
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, onClose]);
  if (!visible) return null;
  const finish = () => {
    onSuccess(amount);
    setStep('success');
    // Modal auto-schließen, nachdem Coins gutgeschrieben wurden
    setTimeout(() => onClose(), 1800);
  };
  const openPaypal = () => {
    window.open('https://www.paypal.com', '_blank', 'noopener,noreferrer');
    finish();
  };
  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    finish();
  };
  const submitPaysafe = (e: React.FormEvent) => {
    e.preventDefault();
    finish();
  };
  return (
    
<div
  className="buy-coins-modal is-open"
  role="dialog"
  aria-modal="true"
  onClick={onClose}
>
      <div className="buy-coins-content" onClick={(e) => e.stopPropagation()} aria-live="polite">
        <h2>💰 Coins kaufen</h2>
        <p>
          Möchten Sie <strong>{amount.toLocaleString('de-DE')} Coins</strong> für{' '}
          <strong>{priceEuro.toFixed(2)}€</strong> kaufen?
        </p>
        {step === 'select' && (
          <>
            <h3>Bezahlmethode auswählen</h3>
            <div className="method-grid">
              <button className="method-btn" onClick={() => { setMethod('paypal'); setStep('paypal'); }}>
                <span>🅿️ PayPal</span>
              </button>
              <button className="method-btn" onClick={() => { setMethod('card'); setStep('card'); }}>
                <span>💳 Kreditkarte</span>
              </button>
              <button className="method-btn" onClick={() => { setMethod('paysafe'); setStep('paysafe'); }}>
                <span>🔒 Paysafe</span>
              </button>
            </div>
          </>
        )}
        {step === 'paypal' && (
          <>
            <h3>PayPal</h3>
            <p>Du wirst zu PayPal weitergeleitet. Nach Abschluss kehrst du hierher zurück.</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={openPaypal}>Zu PayPal wechseln</button>
              <button className="btn btn-secondary" onClick={() => setStep('select')}>Zurück</button>
            </div>
          </>
        )}
        {step === 'card' && (
          <>
            <h3>Kreditkarte</h3>
            <form className="card-form" onSubmit={submitCard}>
              <label>
                Kartennummer
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />
              </label>
              <div className="row">
                <label>
                  Ablauf (MM/JJ)
                  <input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="08/28"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                </label>
                <label>
                  CVC
                  <input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Karteninhaber
                <input
                  autoComplete="cc-name"
                  placeholder="Max Mustermann"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </label>
              <div className="actions">
                <button type="submit" className="btn btn-primary">
                  Jetzt bezahlen ({priceEuro.toFixed(2)}€)
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setStep('select')}>
                  Zurück
                </button>
              </div>
            </form>
          </>
        )}
        {step === 'paysafe' && (
          <>
            <h3>Paysafe</h3>
            <form onSubmit={submitPaysafe}>
              <label>
                Code eingeben
                <input
                  inputMode="numeric"
                  placeholder="16-stelliger Code"
                  value={paysafeCode}
                  onChange={(e) => setPaysafeCode(e.target.value)}
                />
              </label>
              <div className="actions">
                <button type="submit" className="btn btn-primary">Einlösen</button>
                <button type="button" className="btn btn-secondary" onClick={() => setStep('select')}>
                  Zurück
                </button>
              </div>
            </form>
          </>
        )}
        {step === 'success' && (
          <div className="success-screen">
            <div className="big-emoji">🎉</div>
            <h3>Aufladen erfolgreich</h3>
            <p>+{amount.toLocaleString('de-DE')} Coins wurden gutgeschrieben.</p>
          </div>
        )}
        <div className="footer">
          <button className="btn btn-ghost" onClick={onClose}>Abbrechen</button>
          <p className="disclaimer">*Dies ist nur eine Simulation. Es wird kein echtes Geld abgebucht.</p>
        </div>
      </div>
    </div>
  );
}

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
  // Coins gutschreiben (wird vom PaymentModal aufgerufen)
  const creditCoins = (amount: number) => {
    const currentCoins = typeof coins === 'number' ? coins : 0;
    const newCoins = currentCoins + amount;
    saveCoins(newCoins);
    setCoins(newCoins);
    setMessage(`🎉 Aufladen erfolgreich! +${amount.toLocaleString('de-DE')} Coins erhalten.`);
    setTimeout(() => setMessage(''), 3000);
  };
  const filteredItems = shopItems.filter(item => item.category === selectedCategory);
  return (
    <div className="shop-screen">
      {/* Neues Payment-Modal */}
      <PaymentModal
        visible={showBuyCoins}
        onClose={() => setShowBuyCoins(false)}
        onSuccess={creditCoins}
        amount={1000}
        priceEuro={99.99}
      />
      <div className="shop-container">
        <div className="shop-header">
          <h1>🛒 Shop</h1>
          {/* Coins-Anzeige öffnet Payment */}
          <div
            className="coins-display"
            onClick={() => setShowBuyCoins(true)}
            title="Klicken um Coins zu kaufen"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowBuyCoins(true)}
          >
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
