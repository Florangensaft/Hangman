export interface Word {
  wort: string;
  kategorie: string;
}

export async function loadWordsFromCSV(): Promise<Word[]> {
  try {
    const response = await fetch('/data/woerter.csv');
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Erste Zeile überspringen (Header)
    const words: Word[] = [];
    for (let i = 1; i < lines.length; i++) {
      const [wort, kategorie] = lines[i].split(',');
      if (wort && kategorie) {
        words.push({
          wort: wort.trim().toUpperCase(),
          kategorie: kategorie.trim()
        });
      }
    }
    
    return words;
  } catch (error) {
    console.error('Fehler beim Laden der Wörter:', error);
    // Fallback-Wörter
    return [
      { wort: 'APFEL', kategorie: 'Obst' },
      { wort: 'COMPUTER', kategorie: 'Technik' },
      { wort: 'SCHULE', kategorie: 'Bildung' }
    ];
  }
}

export function getRandomWord(words: Word[]): Word {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

