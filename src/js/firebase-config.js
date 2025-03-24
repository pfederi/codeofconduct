// Firebase configuration
// Using environment variables for security
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/* 
  How to set up Firebase:
  1. Go to https://console.firebase.google.com/
  2. Click "Add project" and follow the steps to create a new project
  3. Once your project is created, click on "Web" (<>) to add a web app
  4. Register your app with a nickname (e.g., "pumpfoilers-coc")
  5. Copy the configuration object provided and add it to your .env file
  6. Go to Firestore Database in the left sidebar and click "Create database"
  7. Start in test mode for development (you can adjust security rules later)
  8. Choose a location closest to your users (e.g., europe-west for Switzerland)
  9. Click "Enable"
  10. Once Firestore is enabled, create a collection called "signatories"
*/ 