import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBaq7bYsg0AXAk_VsTPIgANfbmepsi0I2k",
  authDomain: "armurerie-scum.firebaseapp.com",
  projectId: "armurerie-scum",
  storageBucket: "armurerie-scum.firebasestorage.app",
  messagingSenderId: "473149504444",
  appId: "1:473149504444:web:a2dd92e1d1087fa9f009b9",
  measurementId: "G-QDGRRJ1C97"
}

// évite double initialisation en dev
export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)

// services utiles
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app