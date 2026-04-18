// /lib/firestore.ts

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"

export type OrderStatus = "pending" | "done"

export async function createOrder(data: any) {
  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp()
  })

  await addLog(`Nouvelle commande de ${data.pseudo}`)
  return ref.id
}

export async function getOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }))
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  await updateDoc(doc(db, "orders", id), { status })
  await addLog(`Commande ${id} => ${status}`)
}

export async function deleteOrder(id: string) {
  await deleteDoc(doc(db, "orders", id))
  await addLog(`Commande supprimée ${id}`)
}

/* ================= LOGS ================= */

export async function addLog(message: string) {
  await addDoc(collection(db, "logs"), {
    message,
    createdAt: serverTimestamp()
  })
}

export async function getLogs() {
  const q = query(collection(db, "logs"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }))
}