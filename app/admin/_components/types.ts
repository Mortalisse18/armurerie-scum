export type AdminTab =
  | "dashboard"
  | "orders"
  | "players"
  | "items"
  | "promo"
  | "banner"
  | "auction"
  | "rewards"
  | "buybacks"
  | "users"
  | "chat"
  | "logs"

export type OrderStatus = "pending" | "assigned" | "delivering" | "delivered" | "refused"

export type AdminMenuItem = {
  key: AdminTab
  icon: string
  label: string
}

export type AdminStats = {
  totalMoney: number
  pending: number
  assigned: number
  delivering: number
  delivered: number
  refused: number
}

export type BuybackMetrics = {
  totalPaid: number
  topItem: string
  topSupplier: string
}

export type ToastTone = "info" | "success" | "warning" | "danger"

export type ToastMessage = {
  id: number
  title: string
  message: string
  tone: ToastTone
}

export type StaffRole = "owner" | "admin" | "moderator" | "delivery"

export type AdminPermissionKey =
  | "dashboard"
  | "orders"
  | "shop"
  | "promotions"
  | "banner"
  | "auction"
  | "rewards"
  | "buybacks"
  | "access"
  | "staffChat"
  | "logs"

export type StaffPermissions = Record<AdminPermissionKey, boolean>

export type StaffMember = {
  id: string
  pseudo: string
  code?: string
  role: StaffRole
  permissions: StaffPermissions
}

export type LiveActivityKind =
  | "order"
  | "assigned"
  | "delivered"
  | "message"
  | "stock"
  | "login"

export type LiveActivity = {
  id: string
  kind: LiveActivityKind
  title: string
  detail: string
  timestamp: number
}

export type PlayerNote = {
  id: string
  uid: string
  pseudo: string
  note: string
  author: string
  createdAt?: unknown
}
