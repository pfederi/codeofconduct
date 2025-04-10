# Pumpfoilers Code of Conduct

The Pumpfoilers Code of Conduct establishes guidelines for safe and respectful pumpfoiling in Switzerland. As a community-driven initiative, it sets standards for responsible behavior on the water and promotes safety within our growing sport.

🌊 [Join our Community](https://pumpfoiling.community)

## Technical Implementation

Our web application is built with modern technologies and best practices:

- **Design System**: Swiss Design principles with a clean, responsive layout
- **Internationalization**: Full support for DE, EN, FR, and IT
- **Frontend**: Responsive layout with modern CSS Grid and Flexbox
- **Animations**: GSAP (GreenSock Animation Platform) for smooth transitions
- **Backend**: Firebase for secure data storage and hosting
- **Security**: reCAPTCHA v3 integration for spam protection

## Development Guide

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Git

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/pfederi/codeofconduct.git
cd codeofconduct

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:3000` with hot reload enabled.

### Build Process

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Deploy to Firebase
firebase deploy
```

### Firebase Configuration

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in test mode
3. Create a collection named "signatories"
4. Set up your Firebase configuration:
   
   Create `src/js/firebase-config.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### Security Configuration

1. Set up reCAPTCHA v3:
   - Register at [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Choose reCAPTCHA v3
   - Add your domain
   - Copy the Site Key to your environment variables

2. Configure Firestore Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /signatories/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Project Structure

```
codeofconduct/
├── src/
│   ├── js/
│   │   ├── firebase-config.js
│   │   └── main.js
│   ├── css/
│   │   └── style.css
│   └── index.html
├── public/
│   └── assets/
├── dist/           # Production build
└── firebase.json   # Firebase configuration
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This work is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) - Creative Commons Attribution-NonCommercial-ShareAlike 4.0

---
Built with ♥ by the Swiss Pumpfoiling Community