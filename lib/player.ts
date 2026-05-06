import type { User } from "firebase/auth"
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore"
import { db } from "./firebase"

type PlayerIdentity = {
  pseudo: string
  username: string
  displayName: string
  uid: string
}

const EMPTY_VALUES = new Set(["", "joueur", "player", "unknown", "undefined", "null"])

function cleanName(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return ""

  const text = String(value).trim()
  if (EMPTY_VALUES.has(text.toLowerCase())) return ""

  return text
}

function emailPseudo(user: User | null) {
  return cleanName(user?.email?.replace("@scum.local", ""))
}

function pickFirst(...values: unknown[]) {
  for (const value of values) {
    const clean = cleanName(value)
    if (clean) return clean
  }

  return ""
}

export async function getPlayerIdentity(user: User | null): Promise<PlayerIdentity> {
  let userData: Record<string, unknown> = {}

  if (user?.uid) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        userData = snap.data()
      } else {
        const byUid = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid), limit(1)))
        userData = byUid.docs[0]?.data() || {}
      }
    } catch {
      userData = {}
    }
  }

  const displayName = pickFirst(userData.displayName, user?.displayName)
  const username = pickFirst(userData.username, userData.steamName, displayName, emailPseudo(user))
  const pseudo = pickFirst(userData.pseudo, username, displayName, emailPseudo(user), localStorage.getItem("pseudo"), "Inconnu")

  return {
    pseudo,
    username: username || pseudo,
    displayName: displayName || username || pseudo,
    uid: user?.uid || "",
  }
}
