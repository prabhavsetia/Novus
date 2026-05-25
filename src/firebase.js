import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(config)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Auto sign-in anonymously so Firestore rules `request.auth != null` work.
// Resolves once signed in. App.jsx awaits this before mounting routes.
export const firebaseReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      resolve(user)
    } else {
      signInAnonymously(auth).catch((e) => {
        console.error('Anonymous sign-in failed:', e)
        resolve(null)
      })
    }
  })
})
