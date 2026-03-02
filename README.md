# Pumpfoilers Code of Conduct

A community-driven initiative for safe and respectful pumpfoiling on Swiss waters.

**Live:** [responsible.pumpfoiling.community](https://responsible.pumpfoiling.community)

## Features

- Multilingual (DE / EN / FR / IT) with dynamic language switching
- Signatory system with Firestore backend and pagination/sorting/search
- Supporter application workflow (submit → admin review → approval email)
- Admin dashboard with CRUD for supporters and signatories, drag-and-drop reorder
- Toast notifications and confirm dialogs (custom, no native alerts)
- GSAP scroll animations, custom cursor, dark mode
- Responsive design optimized for all devices
- Spam protection (honeypot, rate limiting, reCAPTCHA v3)
- FTP deployment with TLS encryption

## Tech Stack

- **Frontend:** HTML5, SCSS, Vanilla JS (ES6+)
- **Build:** Vite with chunk splitting (Firebase, GSAP)
- **Database:** Firebase Firestore + Storage
- **Email:** EmailJS (approval & notification emails)
- **Animations:** GSAP + ScrollTrigger
- **Deployment:** FTP via `basic-ftp` (TLS)

## Setup

1. Clone and install:
   ```bash
   git clone https://github.com/yourusername/pumpfoilers-code-of-conduct.git
   cd pumpfoilers-code-of-conduct
   npm install
   ```

2. Configure Firebase — copy and fill in your credentials:
   ```bash
   cp src/js/firebase-config.example.js src/js/firebase-config.js
   ```

3. Configure EmailJS — copy and fill in your keys:
   ```bash
   cp src/js/emailjs-config.example.js src/js/emailjs-config.js
   ```

4. Configure FTP — copy and fill in your credentials:
   ```bash
   cp .ftpconfig.template.json .ftpconfig.json
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy-ftp` | Build + deploy via FTP |

## Project Structure

```
├── admin.html                # Admin dashboard
├── index.html                # Public website
├── vite.config.js            # Vite config (multi-page, chunk splitting)
├── deploy.js                 # FTP deployment script
├── public/
│   └── .htaccess             # Apache URL rewriting (clean URLs)
├── src/
│   ├── js/
│   │   ├── main.js           # Main website logic
│   │   ├── admin.js          # Admin dashboard logic
│   │   ├── db.js             # Firebase Firestore/Storage API
│   │   ├── firebase-config.js      # Firebase credentials (gitignored)
│   │   └── emailjs-config.js       # EmailJS credentials (gitignored)
│   ├── scss/
│   │   ├── style.scss        # Main styles
│   │   └── admin.scss        # Admin styles
│   └── images/               # Logos, hero images, supporter logos
├── content/
│   └── translations/         # i18n JSON files (de, en, fr, it)
└── code-of-conduct-text/     # Downloadable Code of Conduct documents
```

## Environment Files

These files contain secrets and are **not** tracked in Git:

- `src/js/firebase-config.js` — Firebase project credentials
- `src/js/emailjs-config.js` — EmailJS keys and admin email
- `.ftpconfig.json` — FTP server credentials

Example templates (`*.example.js`, `*.template.json`) are provided in the repo.

## License

CC BY-NC-SA 4.0 — see [LICENSE](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Acknowledgements

- Pumpfoilers community for the initiative
- All contributors and supporters of the Code of Conduct
- Made with ♥ by [Lakeshore Studios](https://lakeshorestudios.ch)
