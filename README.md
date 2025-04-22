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

### Build & Deployment

#### Build
```bash
# Produktions-Build erstellen
npm run build
```

#### FTP Deployment
Das Projekt unterstützt automatisches FTP Deployment. Folge diesen Schritten:

1. Kopiere `.ftpconfig.template.json` zu `.ftpconfig.json`
2. Fülle die FTP-Zugangsdaten in `.ftpconfig.json` aus:
   ```json
   {
     "host": "dein-ftp-server.com",
     "user": "dein-username",
     "password": "dein-passwort",
     "port": 21
   }
   ```
3. Führe das Deployment aus:
   ```bash
   npm run deploy-ftp
   ```

Die Dateien werden automatisch in das `/coc` Verzeichnis auf dem FTP-Server hochgeladen.

**Wichtig:** Die `.ftpconfig.json` Datei enthält sensitive Daten und ist in `.gitignore` aufgeführt. Committe niemals deine FTP-Zugangsdaten!

## Lizenz

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---
Built with ♥ by the Swiss Pumpfoiling Community