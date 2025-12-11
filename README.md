# Hangman Spiel

Ein interaktives Hangman-Spiel entwickelt mit React und TypeScript.

## Features

- 🎮 **Zwei Spielmodi:**
  - **Selbst eingeben**: Ein Spieler gibt ein Wort ein und gibt den Computer weiter
  - **Überrasche mich**: Einzelspielermodus mit zufälligem Wort aus der CSV-Datei

- 📝 **Wortliste**: Wörter werden aus einer CSV-Datei geladen (`public/data/woerter.csv`)
- ⌨️ **Tastatursteuerung**: Buchstaben können per Tastatur oder Maus eingegeben werden
- 🎨 **Moderne UI**: Schönes, responsives Design

## Installation

1. Abhängigkeiten installieren:
```bash
npm install
```

2. Entwicklungsserver starten:
```bash
npm run dev
```

3. Im Browser öffnen (normalerweise http://localhost:5173)

## Projektstruktur

```
├── src/
│   ├── components/
│   │   ├── StartScreen.tsx      # Startbildschirm mit Spielmodus-Auswahl
│   │   ├── StartScreen.css
│   │   ├── GameScreen.tsx       # Hauptspiel-Komponente
│   │   └── GameScreen.css
│   ├── utils/
│   │   └── wordLoader.ts        # Lädt Wörter aus CSV-Datei
│   ├── App.tsx                  # Hauptkomponente
│   ├── App.css
│   └── main.tsx                 # Einstiegspunkt
├── public/
│   └── data/
│       └── woerter.csv          # Wortliste (Format: Wort,Kategorie)
└── package.json
```

## Wörter hinzufügen

Um neue Wörter hinzuzufügen, bearbeiten Sie die Datei `public/data/woerter.csv`:

```csv
Wort,Kategorie
NEUES_WORT,Kategorie_Name
```

## Build für Produktion

```bash
npm run build
```

Die gebauten Dateien befinden sich im `dist/` Ordner.

## Technologien

- React 18
- TypeScript
- Vite
- CSS3

