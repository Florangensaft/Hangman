import {
  type ShopItem,
  type Difficulty,
  DEFAULT_SHOP_ITEMS,
  STORAGE_KEYS,
  SCORING_CONFIG
} from '../constants/gameConstants';

/**
 * Lädt die Shop-Items aus dem LocalStorage
 */
export function loadShopItems(): ShopItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
    if (stored) {
      return JSON.parse(stored) as ShopItem[];
    }
  } catch (error) {
    console.error('Fehler beim Laden der Shop-Items:', error);
  }
  // Initialisiere mit Default-Items
  saveShopItems(DEFAULT_SHOP_ITEMS);
  return DEFAULT_SHOP_ITEMS;
}

/**
 * Speichert die Shop-Items im LocalStorage
 */
export function saveShopItems(items: ShopItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Fehler beim Speichern der Shop-Items:', error);
  }
}

/**
 * Lädt die Coins aus dem LocalStorage
 */
export function loadCoins(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COINS);
    if (stored) {
      return Number.parseInt(stored, 10);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Coins:', error);
  }
  // Starte mit 0 Coins
  saveCoins(0);
  return 0;
}

/**
 * Speichert die Coins im LocalStorage
 */
export function saveCoins(coins: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
  } catch (error) {
    console.error('Fehler beim Speichern der Coins:', error);
  }
}

/**
 * Kauft ein Shop-Item
 */
export function purchaseItem(itemId: string, items: ShopItem[], coins: number): { success: boolean; newItems: ShopItem[]; newCoins: number; message: string } {
  const item = items.find(i => i.id === itemId);
  
  if (!item) {
    return { success: false, newItems: items, newCoins: coins, message: 'Item nicht gefunden!' };
  }
  
  if (item.unlocked) {
    return { success: false, newItems: items, newCoins: coins, message: 'Item bereits freigeschaltet!' };
  }
  
  if (coins < item.price) {
    return { success: false, newItems: items, newCoins: coins, message: 'Nicht genug Coins!' };
  }
  
  const newItems = items.map(i => 
    i.id === itemId ? { ...i, unlocked: true } : i
  );
  
  const newCoins = coins - item.price;
  
  saveShopItems(newItems);
  saveCoins(newCoins);
  
  return { 
    success: true, 
    newItems, 
    newCoins, 
    message: `${item.name} erfolgreich gekauft!` 
  };
}

/**
 * Berechnet die Coins für ein beendetes Spiel (nur Berechnung, keine Persistenz).
 * Nutzbar für UI-Anzeige und von awardGameCoins.
 */
export function calculateCoins(
  won: boolean,
  wrongGuesses: number,
  maxWrongGuesses: number,
  difficulty: Difficulty
): number {
  if (!SCORING_CONFIG.ENABLED) return 0;

  if (won) {
    const remainingGuesses = maxWrongGuesses - wrongGuesses;
    const multiplier = SCORING_CONFIG.DIFFICULTY_MULTIPLIER[difficulty];
    const raw =
      (SCORING_CONFIG.BASE_POINTS +
        remainingGuesses * SCORING_CONFIG.BONUS_PER_REMAINING_GUESS -
        wrongGuesses * SCORING_CONFIG.PENALTY_PER_WRONG_GUESS) *
      multiplier;
    return Math.max(SCORING_CONFIG.MIN_COINS_WIN, Math.floor(raw));
  } else {
    return SCORING_CONFIG.CONSOLATION_COINS_LOSS;
  }
}

/**
 * Vergibt Coins für ein beendetes Spiel und speichert den neuen Stand.
 * Gibt die verdienten Coins zurück.
 */
export function awardGameCoins(
  won: boolean,
  wrongGuesses: number,
  maxWrongGuesses: number,
  difficulty: Difficulty
): number {
  const coinsEarned = calculateCoins(won, wrongGuesses, maxWrongGuesses, difficulty);
  if (coinsEarned > 0) {
    const current = loadCoins();
    saveCoins(current + coinsEarned);
  }
  return coinsEarned;
}

/**
 * Rüstet ein Shop-Item aus
 */
export function equipItem(itemId: string, category: ShopItem['category'], items: ShopItem[]): ShopItem[] {
  const newItems = items.map(item => {
    if (item.category === category) {
      return { ...item, equipped: item.id === itemId };
    }
    return item;
  });
  
  saveShopItems(newItems);
  return newItems;
}
