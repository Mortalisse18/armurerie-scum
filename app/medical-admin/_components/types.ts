export type MedicalTab =
  | "dashboard"
  | "orders"
  | "items"
  | "buyback"
  | "logs"
  | "chat"
  | "users"

export type MedicalAlert = {
  id: string
  type?: string
  status?: string
  severity?: string
  zone?: string
  createdAt?: number
  mapX?: number
  mapY?: number
  [key: string]: unknown
}

export type MedicalChatMessage = {
  user?: string
  text?: string
  createdAt?: number
}

export type MedicalStats = {
  pendingCount: number
  acceptedCount: number
  completedCount: number
  todayCount: number
  topZone: string
  online: number
}
