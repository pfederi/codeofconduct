// Import Firebase
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Import Firebase configuration
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
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

/**
 * Updates an existing signatory in Firestore
 */
export async function updateSignatoryInDb(id, data) {
  try {
    if (!db) throw new Error("Firestore database not initialized");
    const sigRef = doc(db, "signatories", id);
    await updateDoc(sigRef, data);
    return { id, ...data };
  } catch (error) {
    console.error("Error updating signatory:", error);
    throw error;
  }
}

/**
 * Deletes a signatory from Firestore
 */
export async function deleteSignatoryFromDb(id) {
  try {
    if (!db) throw new Error("Firestore database not initialized");
    await deleteDoc(doc(db, "signatories", id));
  } catch (error) {
    console.error("Error deleting signatory:", error);
    throw error;
  }
}

/**
 * Supporters Management Functions
 */

/**
 * Saves a new supporter to Firestore
 * @param {string} name - The name of the supporter organization
 * @param {string} link - The website link
 * @param {string} logoPath - The path to the logo image
 * @returns {Promise} - A promise that resolves with the document reference
 */
export async function saveSupporterToDb(name, link, logoPath) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const docRef = await addDoc(collection(db, "supporters"), {
      name: name,
      link: link,
      logoPath: logoPath,
      createdAt: serverTimestamp(),
      order: Date.now() // For sorting
    });
    
    console.log("Supporter saved with ID: ", docRef.id);
    return { id: docRef.id, name, link, logoPath };
  } catch (error) {
    console.error("Error adding supporter: ", error);
    throw error;
  }
}

/**
 * Resolves a logo path to a full URL.
 * If logoPath is a Firebase Storage path (e.g. "supporters/logo.png"), fetches the download URL.
 * If it's already a full URL, returns it as-is. Local paths (./src/...) are returned as-is.
 * @param {string} logoPath - Storage path, full URL, or local path
 * @returns {Promise<string>} - Full URL for the logo
 */
export async function resolveLogoUrl(logoPath) {
  if (!logoPath || !logoPath.trim()) return "";
  
  const path = logoPath.trim();
  
  // Already a full URL (Firebase Storage download URL or other)
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }
  
  // Local path (./src/..., src/...) - return as-is
  if (path.startsWith("./") || path.startsWith("src/")) {
    return path;
  }
  
  // Firebase Storage path: "supporters/logo.png" or just "logo.png" (in supporters folder)
  if (storage) {
    try {
      const storagePath = path.startsWith("supporters/") ? path : `supporters/${path}`;
      const storageRef = ref(storage, storagePath);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      console.warn("Could not resolve logo URL for path:", path, err);
      return path; // Return original as fallback
    }
  }
  
  return path;
}

/**
 * Loads all supporters from Firestore
 * Resolves logo paths (supporters/xxx.png) to full Firebase Storage URLs
 * @returns {Promise<Array>} - A promise that resolves with an array of supporters
 */
export async function loadSupportersFromDb() {
  try {
    if (!db) {
      console.error("Firestore database not initialized");
      return [];
    }
    
    const supportersCollection = collection(db, "supporters");
    const querySnapshot = await getDocs(supportersCollection);
    
    const supportersRaw = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      // Skip pending and rejected supporters (only show active/legacy ones)
      if (data.status === 'pending' || data.status === 'rejected') return;
      supportersRaw.push({
        id: doc.id,
        name: data.name || "",
        link: data.link || "",
        logoPath: data.logoPath || "",
        order: data.order || 0
      });
    });
    
    // Resolve logo paths to full URLs (supporters/xxx.png → full Firebase URL)
    const supporters = await Promise.all(
      supportersRaw.map(async (s) => ({
        ...s,
        logoPath: await resolveLogoUrl(s.logoPath)
      }))
    );
    
    // Sort by order (newest first)
    supporters.sort((a, b) => (b.order || 0) - (a.order || 0));
    
    console.log("Loaded supporters from Firestore: ", supporters.length);
    return supporters;
  } catch (error) {
    console.error("Error loading supporters from Firestore: ", error);
    return [];
  }
}

/**
 * Updates a supporter in Firestore
 * @param {string} id - The document ID
 * @param {object} data - The data to update
 * @returns {Promise} - A promise that resolves when the update is complete
 */
export async function updateSupporterInDb(id, data) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const supporterRef = doc(db, "supporters", id);
    await updateDoc(supporterRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log("Supporter updated with ID: ", id);
    return { id, ...data };
  } catch (error) {
    console.error("Error updating supporter: ", error);
    throw error;
  }
}

/**
 * Deletes a supporter from Firestore
 * @param {string} id - The document ID
 * @returns {Promise} - A promise that resolves when the deletion is complete
 */
export async function deleteSupporterFromDb(id) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const supporterRef = doc(db, "supporters", id);
    await deleteDoc(supporterRef);
    
    console.log("Supporter deleted with ID: ", id);
    return true;
  } catch (error) {
    console.error("Error deleting supporter: ", error);
    throw error;
  }
}

/**
 * Gets a single supporter by ID
 * @param {string} id - The document ID
 * @returns {Promise} - A promise that resolves with the supporter data
 */
export async function getSupporterById(id) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const supporterRef = doc(db, "supporters", id);
    const docSnap = await getDoc(supporterRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const logoPath = await resolveLogoUrl(data.logoPath || "");
      return {
        id: docSnap.id,
        name: data.name || "",
        link: data.link || "",
        logoPath,
        email: data.email || "",
        message: data.message || "",
        status: data.status || "active",
        order: data.order || 0
      };
    } else {
      throw new Error("Supporter not found");
    }
  } catch (error) {
    console.error("Error getting supporter: ", error);
    throw error;
  }
}

/**
 * Firebase Storage Functions for Logo Upload
 */

/**
 * Uploads a logo file to Firebase Storage
 * @param {File} file - The logo file to upload
 * @param {string} supporterId - Optional supporter ID for naming the file
 * @returns {Promise<string>} - A promise that resolves with the download URL
 */
export async function uploadLogoToStorage(file, supporterId = null) {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG, JPG, and SVG are allowed.');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = supporterId 
      ? `supporters/${supporterId}-${timestamp}.${extension}`
      : `supporters/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Upload file
    console.log('Uploading logo to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Logo uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading logo to Storage:", error);
    throw error;
  }
}

/**
 * Deletes a logo from Firebase Storage
 * @param {string} logoUrl - The URL of the logo to delete
 * @returns {Promise} - A promise that resolves when the deletion is complete
 */
export async function deleteLogoFromStorage(logoUrl) {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }
    
    // Extract the path from the URL
    // Firebase Storage URLs have the format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlParts = logoUrl.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid logo URL format');
    }
    
    const pathWithQuery = urlParts[1].split('?')[0];
    const decodedPath = decodeURIComponent(pathWithQuery);
    
    // Create storage reference
    const storageRef = ref(storage, decodedPath);
    
    // Delete file
    await deleteObject(storageRef);
    console.log('Logo deleted from Storage:', decodedPath);
    
    return true;
  } catch (error) {
    console.error("Error deleting logo from Storage:", error);
    // Don't throw error if file doesn't exist (might have been deleted already)
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
    return true;
  }
}

/**
 * Admin Credentials Management Functions
 */

/**
 * Gets the admin credentials from Firestore
 * @returns {Promise<object>} - A promise that resolves with {username, password} or null
 */
export async function getAdminCredentials() {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    const adminRef = doc(db, "admin", "credentials");
    const docSnap = await getDoc(adminRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        username: data.username || null,
        password: data.password || null
      };
    } else {
      // No credentials set yet
      return null;
    }
  } catch (error) {
    console.error("Error getting admin credentials:", error);
    throw error;
  }
}

/**
 * Sets/updates the admin credentials in Firestore
 * @param {string} username - The admin username
 * @param {string} password - The admin password
 * @returns {Promise} - A promise that resolves when the credentials are saved
 */
export async function setAdminCredentials(username, password) {
  try {
    if (!db) {
      throw new Error("Firestore database not initialized");
    }
    
    // Try to get existing document first
    const adminRef = doc(db, "admin", "credentials");
    const docSnap = await getDoc(adminRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(adminRef, {
        username: username,
        password: password,
        updatedAt: serverTimestamp()
      });
      console.log("Admin credentials updated");
    } else {
      // Create new document
      await setDoc(adminRef, {
        username: username,
        password: password,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("Admin credentials created");
    }
    
    return true;
  } catch (error) {
    console.error("Error setting admin credentials:", error);
    throw error;
  }
}

/**
 * Pending Supporters - uses the same "supporters" collection with status field
 */

export async function savePendingSupporterToDb(name, link, email, message, logoFile) {
  try {
    if (!db) throw new Error("Firestore database not initialized");

    let logoPath = '';
    if (logoFile && logoFile.size > 0) {
      const timestamp = Date.now();
      const ext = logoFile.name.split('.').pop().toLowerCase();
      const fileName = `pending_${timestamp}.${ext}`;
      const storageRef = ref(storage, `supporters/${fileName}`);
      const contentTypeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };
      await uploadBytes(storageRef, logoFile, { contentType: contentTypeMap[ext] || 'application/octet-stream' });
      logoPath = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "supporters"), {
      name,
      link,
      email,
      message: message || '',
      logoPath,
      status: 'pending',
      order: 0,
      createdAt: serverTimestamp()
    });

    console.log("Pending supporter saved with ID:", docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving pending supporter:", error);
    throw error;
  }
}

export async function loadPendingSupportersFromDb() {
  try {
    if (!db) return [];
    const q = query(collection(db, "supporters"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    const pending = [];
    snapshot.forEach(d => {
      pending.push({ id: d.id, ...d.data() });
    });
    pending.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    return pending;
  } catch (error) {
    console.error("Error loading pending supporters:", error);
    return [];
  }
}

export async function approvePendingSupporter(pendingId) {
  try {
    if (!db) throw new Error("Firestore database not initialized");

    const supporters = await getDocs(collection(db, "supporters"));
    const activeCount = supporters.docs.filter(d => d.data().status !== 'pending' && d.data().status !== 'rejected').length;

    await updateDoc(doc(db, "supporters", pendingId), {
      status: 'active',
      order: activeCount + 1,
      approvedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error approving pending supporter:", error);
    throw error;
  }
}

export async function rejectPendingSupporter(pendingId) {
  try {
    if (!db) throw new Error("Firestore database not initialized");
    await updateDoc(doc(db, "supporters", pendingId), {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error rejecting pending supporter:", error);
    throw error;
  }
}