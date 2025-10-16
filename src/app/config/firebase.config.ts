// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get these from: https://console.firebase.google.com/

export const firebaseConfig = {
  // 🔥 FIREBASE SETUP REQUIRED
  // 1. Go to https://console.firebase.google.com/
  // 2. Create a new project or select existing one
  // 3. Go to Project Settings > General > Your apps
  // 4. Click "Add app" and select Web (</>) 
  // 5. Copy the config values below

  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// 🚀 QUICK SETUP GUIDE:
// 1. Replace the values above with your Firebase config
// 2. Enable Firestore Database in Firebase Console
// 3. Set Firestore rules to allow read/write (for development):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
*/

// 🔒 PRODUCTION SECURITY:
// For production, implement proper security rules:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to categories and offers
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    match /offers/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
*/

export const FIREBASE_ENABLED = false; // Set to true after configuring Firebase

// 💡 ALTERNATIVE: Use environment variables for security
// In production, consider using environment variables:
// apiKey: environment.firebase.apiKey,
// authDomain: environment.firebase.authDomain,
// etc.