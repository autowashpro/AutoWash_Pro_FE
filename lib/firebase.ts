import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_placeholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "autowashpro-47e03.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "autowashpro-47e03",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "autowashpro-47e03.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1057837095099",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1057837095099:web:placeholder",
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
