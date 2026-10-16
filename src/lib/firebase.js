import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDVk8CYr77eet7CElA-ljLPguFR_lE2B44",
  authDomain: "projectcontrol-0.firebaseapp.com",
  projectId: "projectcontrol-0",
  storageBucket: "projectcontrol-0.firebasestorage.app",
  messagingSenderId: "955822790479",
  appId: "1:955822790479:web:fc91b039013e9b73e3173a",
  measurementId: "G-LH6CBZ25G8"
}

// Allowed Admin Email
export const ADMIN_EMAIL = 'maulik.darji2005@gmail.com'

// Initialize Firebase app (singleton pattern)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Authentication
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Analytics safely
export let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {
    // Analytics not supported or blocked (e.g. adblocker)
  })
}

// Google Sign-In helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google Sign-in Error:', error)
    throw error
  }
}

// Sign-Out helper
export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign-out Error:', error)
    throw error
  }
}

// Check if user has admin privileges
export const isUserAdmin = (user) => {
  if (!user || !user.email) return false
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export { onAuthStateChanged }

