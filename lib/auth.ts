// /lib/auth.ts

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth"
import { app } from "./firebase"

const auth = getAuth(app)

export { auth }

/* ================= LOGIN ================= */

export async function login(email: string, password: string) {
  const user = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function register(email: string, password: string) {
  const user = await createUserWithEmailAndPassword(auth, email, password)
  return user
}

export async function logout() {
  await signOut(auth)
}

export function listenAuth(callback: any) {
  return onAuthStateChanged(auth, callback)
}