// src/utils/wordlistUtils.ts
export type PvEWord = { word: string; category: string };

export type WordListData = {
  categories: string[];   // bekannte Kategorien (dient der Auswahl)
  words: PvEWord[];       // Einträge
};

const STORAGE_KEY = 'hangman_wordlist_v1';

const DEFAULT_DATA: WordListData = {
  categories: ['TIERE', 'STAEDTE', 'SPORT', 'FILME'],
  words: [
    // Optionale Seeds (können leer sein)
    // { word: 'ELEFANT', category: 'TIERE' },
  ],
};

export function loadWordList(): WordListData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as WordListData;
    // minimaler Fallback
    if (!parsed.categories) parsed.categories = [];
    if (!parsed.words) parsed.words = [];
    return parsed;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveWordList(data: WordListData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addWordSafe(
  data: WordListData,
  entry: PvEWord
): { ok: boolean; error?: string; next?: WordListData } {
  const w = entry.word.trim().toUpperCase();
  const c = entry.category.trim().toUpperCase();
  if (!w || !c) return { ok: false, error: 'Wort und Kategorie sind Pflicht.' };

  // Nur A-Z (dein WORD_CONFIG.LETTERS_ONLY ist im UI – hier einfache Absicherung)
  if (!/^[A-ZÄÖÜß]+$/.test(w)) return { ok: false, error: 'Nur Buchstaben erlaubt.' };

  // Duplikate verhindern
  if (data.words.some(x => x.word === w && x.category === c)) {
    return { ok: false, error: 'Dieses Wort existiert in dieser Kategorie bereits.' };
  }

  const next: WordListData = {
    categories: Array.from(new Set([...data.categories, c])),
    words: [...data.words, { word: w, category: c }].sort((a, b) =>
      a.category.localeCompare(b.category) || a.word.localeCompare(b.word)
    ),
  };
  return { ok: true, next };
}

export function removeWord(
  data: WordListData,
  entry: PvEWord
): WordListData {
  const w = entry.word.toUpperCase();
  const c = entry.category.toUpperCase();
  const nextWords = data.words.filter(x => !(x.word === w && x.category === c));
  return { ...data, words: nextWords };
}
