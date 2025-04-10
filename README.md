# Pumpfoilers Code of Conduct

Der Pumpfoilers Code of Conduct definiert die Grundsätze für sicheres und respektvolles Pumpfoilen in der Schweiz. Als Community-getriebene Initiative setzt er Standards für verantwortungsvolles Verhalten auf dem Wasser.

🌊 [Zur Community](https://pumpfoiling.community)

## Technische Umsetzung

- Swiss Design System
- Mehrsprachig (DE, EN, FR, IT)
- Responsive Layout
- GSAP Animationen
- Firebase Integration

## Entwicklung

### Setup

```bash
# Repository klonen
git clone https://github.com/pfederi/codeofconduct.git
cd codeofconduct

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### Build

```bash
# Produktions-Build erstellen
npm run build

# Deployment auf Firebase
firebase deploy
```

### Firebase Setup

1. Firebase Projekt in der [Firebase Console](https://console.firebase.google.com/) erstellen
2. Firestore Datenbank im Testmodus erstellen
3. Collection "signatories" anlegen
4. Firebase Config in `src/js/firebase-config.js` einfügen

## Lizenz

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) - Creative Commons Attribution-NonCommercial-ShareAlike 4.0