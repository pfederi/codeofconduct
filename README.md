# Pumpfoilers Code of Conduct - Switzerland

We believe that the Pumpfoiling Code of Conduct is a living document that can benefit from the contributions and insights of the entire pumpfoiling community. Therefore, we have decided to make the Code of Conduct open-source and share it here on GitHub. By making the Code of Conduct open-source, we hope to foster a culture of collaboration, transparency, and innovation in the pumpfoiling community, and to encourage others to share their ideas, feedback, and suggestions to improve the Code of Conduct over time. We invite all pumpfoiling enthusiasts to join us in this effort and to help us shape the future of pumpfoiling by contributing to the Pumpfoiling Code of Conduct on GitHub. This Code of Conduct is written by and for the Pumpfoilers in Switzerland. Feel free to adapt the Code of Conduct for your country.

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

1. Repository initialisieren:
```bash
git init
git remote add origin https://github.com/pfederi/codeofconduct.git
git pull origin main
```

2. Dependencies installieren:
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

### Local Development

1. Repository initialisieren:
   ```bash
   git init
   git remote add origin https://github.com/pfederi/codeofconduct.git
   git pull origin main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application is now available at: http://localhost:3000 (or another port if 3000 is occupied)

### Create Production Build

1. Create a build:
   ```
   npm run build
   ```

2. The production version of the application will be created in the `dist` directory and is ready for deployment.

### reCAPTCHA Configuration

For production use (not in local development mode), the Google reCAPTCHA v3 spam protection feature is activated and must be configured:

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register your domain
3. Choose "reCAPTCHA v3" as the reCAPTCHA type
4. Add your domain(s) (e.g., `responsible.pumpfoiling.community`)
5. Copy the generated Site Key
6. Replace the reCAPTCHA Site Key in the `dist/index.html` file:
   ```html
   <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY" data-callback="onCaptchaComplete" data-size="invisible"></div>
   ```

### Firebase Configuration

Die Anwendung verwendet Firebase Firestore zur Speicherung der Unterschriften. Aus Sicherheitsgründen sind die Firebase-Konfigurationsdateien nicht im Repository enthalten und müssen manuell erstellt werden:

1. Erstelle ein Firebase-Konto: https://firebase.google.com/
2. Erstelle ein neues Projekt in der Firebase Console
3. Füge eine Web-App zu deinem Projekt hinzu
4. Erstelle folgende Konfigurationsdateien:

   - `src/js/firebase-config.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

   - `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     },
     "firestore": {
       "rules": "firestore.rules",
       "indexes": "firestore.indexes.json"
     }
   }
   ```

   - `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "YOUR_FIREBASE_PROJECT_ID"
     }
   }
   ```

   - `firestore.rules`:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read;
         allow write: if false;
       }
     }
   }
   ```

5. Erstelle eine Firestore-Datenbank im Testmodus
6. Erstelle eine Collection namens "signatories"

**Wichtig:** Diese Konfigurationsdateien enthalten sensitive Informationen und sind in `.gitignore` aufgeführt. Sie werden nicht mit dem Repository geteilt und müssen lokal erstellt werden.

### Deployment

After building, the application can be deployed on a web server of your choice:

- Copy the contents of the `dist` directory to your web server
- Ensure that all requests that are not static assets are redirected to `index.html` (for SPA routing)

Alternatively, you can use Firebase Hosting for easy deployment:

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize project:
   ```
   firebase init
   ```
   - Choose "Hosting"
   - Select your Firebase project
   - Specify `dist` as the public directory
   - Configure as Single-Page App: Yes
   - Overwrite `dist/index.html`: No

4. Deploy to Firebase:
   ```
   firebase deploy
   ```

## License

This work is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
