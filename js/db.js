// Import Firebase
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

// Import Firebase configuration
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

/**
 * Saves a new signatory to Firestore
 * @param {string} name - The name of the signatory
 * @param {string} location - The location of the signatory
 * @returns {Promise} - A promise that resolves with the document reference
 */
export async function saveSignatoryToDb(name, location) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    // Create a new signatory document in the "signatories" collection
    const docRef = await addDoc(collection(db, "signatories"), {
      name: name,
      location: location,
      timestamp: serverTimestamp(),
      date: new Date().toISOString() // For backwards compatibility
    });
    
    console.log("Signatory saved with ID: ", docRef.id);
    return { id: docRef.id, name, location, date: new Date().toISOString() };
  } catch (error) {
    console.error("Error adding signatory: ", error);
    throw error;
  }
}

/**
 * Loads all signatories from Firestore
 * @returns {Promise<Array>} - A promise that resolves with an array of signatories
 */
export async function loadSignatoriesFromDb() {
  try {
    console.log("Starting to load signatories from Firestore...");
    
    // Check if db is initialized
    if (!db) {
      console.error("Firestore database not initialized");
      return [];
    }
    
    // Try to get the signatories collection
    try {
      const signatoryCollection = collection(db, "signatories");
      
      // Try to get the documents
      let querySnapshot;
      try {
        querySnapshot = await getDocs(signatoryCollection);
      } catch (snapshotError) {
        console.error("Error getting documents from collection:", snapshotError);
        return [];
      }
      
      const signatories = [];
      
      // Process each document
      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();
          if (!data) {
            console.warn("Document has no data:", doc.id);
            return; // Skip this iteration
          }
          
          signatories.push({
            id: doc.id,
            name: data.name || "Unbekannt",
            location: data.location || "Unbekannt",
            date: data.date || (data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()),
            timestamp: data.timestamp || data.date
          });
        } catch (docError) {
          console.error("Error processing document:", docError);
          // Continue with next document
        }
      });
      
      console.log("Loaded signatories from Firestore: ", signatories.length);
      return signatories;
    } catch (collectionError) {
      console.error("Error accessing collection:", collectionError);
      return [];
    }
  } catch (error) {
    console.error("Error loading signatories from Firestore: ", error);
    
    // Check for specific Firebase errors
    if (error.code) {
      if (error.code === 'permission-denied') {
        console.error("Firebase permission denied. Check your security rules in the Firebase console.");
      } else if (error.code === 'unavailable') {
        console.error("Firebase service is currently unavailable. Check your internet connection.");
      } else if (error.code === 'unauthenticated') {
        console.error("Authentication required for this Firebase operation.");
      }
    }
    
    // Return empty array to trigger fallback
    return [];
  }
}

/**
 * Checks if a signatory already exists in the database
 * @param {string} name - The name to check
 * @param {string} location - The location to check
 * @returns {Promise<boolean>} - A promise that resolves with true if the signatory exists
 */
export async function checkSignatoryExists(name, location) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const signatoryCollection = collection(db, "signatories");
    const q = query(
      signatoryCollection, 
      where("name", "==", name),
      where("location", "==", location)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if signatory exists: ", error);
    return false;
  }
} 