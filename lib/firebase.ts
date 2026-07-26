import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD_JP1hgjLTVPHpkfb3dYJ69fbmXfuZUBY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "autowashpro-12173.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "autowashpro-12173",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "autowashpro-12173.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "651490299814",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:651490299814:web:f1030459d5a0b693e54967",
}

// Singleton pattern to prevent re-initializing Firebase App during Next.js Hot Reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Configure prompt for account selection
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export { app, auth, googleProvider }
