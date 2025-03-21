# Pumpfoilers Code of Conduct - Switzerland

We believe that the Pumpfoiling Code of Conduct is a living document that can benefit from the contributions and insights of the entire pumpfoiling community. Therefore, we have decided to make the Code of Conduct open-source and share it here on GitHub. By making the Code of Conduct open-source, we hope to foster a culture of collaboration, transparency, and innovation in the pumpfoiling community, and to encourage others to share their ideas, feedback, and suggestions to improve the Code of Conduct over time. We invite all pumpfoiling enthusiasts to join us in this effort and to help us shape the future of pumpfoiling by contributing to the Pumpfoiling Code of Conduct on GitHub. This Code of Condcut is written by and for the Pumpfoilers in Switzerland. Feel free to adapt the Code of Conduct for your country.

Visit our community: https://pumpfoiling.community

## Features

- Responsive Design based on Swiss Design principles (Müller Brockmann Grid)
- Maritime color scheme
- Animations with GSAP
- Supporter organizations list
- Signature functionality with local storage
- Complete Code of Conduct text
- Multilingual support (German, English, French, Italian)

## Installation and Development

### Prerequisites

- Node.js (Version 16 or higher)
- npm or yarn

### Installation

1. Clone repository or download files
2. Install dependencies:

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The website will be available at http://localhost:3000 (or another port if 3000 is in use).

### Build for Production

```bash
npm run build
```

The output files will be in the `dist` directory.

## Deployment

### Lokale Entwicklung

1. Repository klonen:
   ```
   git clone https://github.com/pfederi/codeofconduct.git
   cd codeofconduct
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Entwicklungsserver starten:
   ```
   npm run dev
   ```

4. Die Anwendung ist nun verfügbar unter: http://localhost:3000 (oder einem anderen Port, falls 3000 belegt ist)

### Produktivbuild erstellen

1. Build erstellen:
   ```
   npm run build
   ```

2. Die Produktionsversion der Anwendung wird im `dist`-Verzeichnis erstellt und ist bereit für das Deployment.

### reCAPTCHA Konfiguration

Für den Produktiveinsatz (nicht im lokalen Entwicklungsmodus) ist die Google reCAPTCHA v3 Spam-Schutzfunktion aktiviert und muss konfiguriert werden:

1. Gehe zu [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Registriere deine Domain
3. Wähle "reCAPTCHA v3" als reCAPTCHA-Typ
4. Füge deine Domain(s) hinzu (z.B. `codeofconduct.pumpfoiling.community`)
5. Kopiere den generierten Site-Key
6. Ersetze in der `dist/index.html` Datei den reCAPTCHA Site-Key:
   ```html
   <div class="g-recaptcha" data-sitekey="DEIN_SITE_KEY" data-callback="onCaptchaComplete" data-size="invisible"></div>
   ```

### Firebase Konfiguration

Die Anwendung verwendet Firebase Firestore zur Speicherung der Unterschriften:

1. Erstelle ein Firebase-Konto: https://firebase.google.com/
2. Erstelle ein neues Projekt in der Firebase-Konsole
3. Füge eine Web-App zu deinem Projekt hinzu
4. Kopiere die Firebase-Konfiguration aus der Firebase-Konsole
5. Öffne die Datei `src/js/firebase-config.js` und ersetze die Platzhalter-Werte
6. Erstelle eine Firestore-Datenbank im Testmodus
7. Erstelle eine Sammlung namens "signatories"

### Deployment

Nach dem Build kann die Anwendung auf einem Webserver deiner Wahl bereitgestellt werden:

- Kopiere den Inhalt des `dist`-Verzeichnisses auf deinen Webserver
- Stelle sicher, dass alle Anfragen, die keine statischen Assets sind, zur `index.html` weitergeleitet werden (für SPA-Routing)

Alternativ kannst du Firebase Hosting für ein einfaches Deployment nutzen:

1. Firebase CLI installieren:
   ```
   npm install -g firebase-tools
   ```

2. Bei Firebase anmelden:
   ```
   firebase login
   ```

3. Projekt initialisieren:
   ```
   firebase init
   ```
   - Wähle "Hosting"
   - Wähle dein Firebase-Projekt
   - Gib `dist` als öffentliches Verzeichnis an
   - Konfiguriere als Single-Page-App: Ja
   - Überschreibe `dist/index.html`: Nein

4. Deployment auf Firebase:
   ```
   firebase deploy
   ```

## License

This work is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
