import { addDoc, collection } from "firebase/firestore"
import { db } from "./firebase"

export async function addLog(data: {
  type: string
  message: string
  admin?: string
}) {
  await addDoc(collection(db, "logs"), {
    ...data,
    createdAt: Date.now()
  })
}