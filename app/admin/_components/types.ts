export type AdminTab =
  | "dashboard"
  | "orders"
  | "items"
  | "promo"
  | "banner"
  | "auction"
  | "rewards"
  | "buybacks"
  | "users"
  | "chat"
  | "logs"

export type OrderStatus = "pending" | "delivered" | "refused" | "done"

export type AdminMenuItem = {
  key: AdminTab
  icon: string
  label: string
}

export type AdminStats = {
  totalMoney: number
  pending: number
}

export type BuybackMetrics = {
  totalPaid: number
  topItem: string
  topSupplier: string
}
