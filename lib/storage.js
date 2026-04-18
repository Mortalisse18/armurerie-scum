import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

export const uploadImage = async (file) => {
  const fileName = `weapons/${Date.now()}-${file.name}`
  const storageRef = ref(storage, fileName)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  return url
}