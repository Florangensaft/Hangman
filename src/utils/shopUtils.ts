import { type ShopItem, DEFAULT_SHOP_ITEMS, STORAGE_KEYS } from '../constants/gameConstants';

/**
 * Lädt die Shop-Items aus dem LocalStorage
 */
export function loadShopItems(): ShopItem[] {
  let storedItems: ShopItem[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
    if (stored) {
      storedItems = JSON.parse(stored) as ShopItem[];
    }
  } catch (error) {
    console.error('Fehler beim Laden der Shop-Items:', error);
  }

  if (storedItems.length === 0) {
    saveShopItems(DEFAULT_SHOP_ITEMS);
    return DEFAULT_SHOP_ITEMS;
  }

  // Merge stored state with default config
  const mergedItems = DEFAULT_SHOP_ITEMS.map(defaultItem => {
    const storedItem = storedItems.find(i => i.id === defaultItem.id);
    if (storedItem) {
      // Preserve unlocked and equipped state
      return {
        ...defaultItem,
        unlocked: storedItem.unlocked,
        equipped: storedItem.equipped
      };
    }
    return defaultItem;
  });

  // Save merged items to ensure consistency
  saveShopItems(mergedItems);
  return mergedItems;
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
