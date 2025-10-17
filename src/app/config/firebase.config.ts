// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get these from: https://console.firebase.google.com/

export const firebaseConfig = {
  apiKey: "AIzaSyDOqVr7v7tNimLPGWsZ0X-zAbHeZ0H1pCA",
  authDomain: "referral-rewards-hub-982ca.firebaseapp.com",
  projectId: "referral-rewards-hub-982ca",
  storageBucket: "referral-rewards-hub-982ca.firebasestorage.app",
  messagingSenderId: "249490634003",
  appId: "1:249490634003:web:8d74b7fe013741637496e6",
  measurementId: "G-4TDLVSQG4V"
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

export const FIREBASE_ENABLED = true; // Firebase is now configured and active!

// 💡 ALTERNATIVE: Use environment variables for security
// In production, consider using environment variables:
// apiKey: environment.firebase.apiKey,
// authDomain: environment.firebase.authDomain,
// etc.