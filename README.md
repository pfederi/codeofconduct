# Pumpfoilers Code of Conduct

This repository contains the Code of Conduct website for the pumpfoiling community.

## About

The Pumpfoilers Code of Conduct is a community-driven initiative to establish guidelines for respectful and safe behavior on the water. It promotes safety, respect, responsibility, consideration, adherence to rules, and fun for all participants.

## Features

- Responsive design optimized for all devices
- Multilingual support
- Signature system to show support for the code of conduct
- Interactive card animations
- Modern Swiss-inspired design

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Sass for CSS preprocessing
- Firebase for signature storage and authentication
- i18next for internationalization
- Webpack for asset bundling

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pumpfoilers-code-of-conduct.git
   cd pumpfoilers-code-of-conduct
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore database
   - Set up authentication if required
   - Copy your Firebase config to `src/js/firebase-config.js`

4. Create `.ftpconfig.json` from the template:
   ```
   cp .ftpconfig.template.json .ftpconfig.json
   ```
   Then add your FTP credentials to `.ftpconfig.json`

5. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### FTP Deployment

To deploy via FTP:

```
npm run deploy-ftp
```

This script will build the project and upload it to the server specified in your `.ftpconfig.json`.

### Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Upload the contents of the `dist` directory to your web server.

## Project Structure

```
├── dist/                 # Compiled files (not in version control)
├── src/                  # Source files
│   ├── assets/           # Static assets
│   ├── js/               # JavaScript files
│   ├── scss/             # SCSS files
│   └── index.html        # Main HTML file
├── .ftpconfig.template.json  # FTP configuration template
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── webpack.config.js     # Webpack configuration
└── README.md             # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Pumpfoilers community for the initiative
- All contributors and supporters of the Code of Conduct
- Made with ♥ by Lakeshore Studios