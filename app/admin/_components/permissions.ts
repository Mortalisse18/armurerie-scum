import type { AdminPermissionKey, AdminTab, StaffPermissions, StaffRole } from "./types"

export const PERMISSION_KEYS: AdminPermissionKey[] = [
  "dashboard",
  "orders",
  "shop",
  "promotions",
  "banner",
  "auction",
  "rewards",
  "buybacks",
  "access",
  "staffChat",
  "logs",
]

export const TAB_PERMISSION_MAP: Record<AdminTab, AdminPermissionKey> = {
  dashboard: "dashboard",
  orders: "orders",
  players: "orders",
  items: "shop",
  promo: "promotions",
  banner: "banner",
  auction: "auction",
  rewards: "rewards",
  buybacks: "buybacks",
  users: "access",
  chat: "staffChat",
  logs: "logs",
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "OWNER",
  admin: "ADMIN",
  moderator: "MOD",
  delivery: "LIVREUR",
}

export const ROLE_COLORS: Record<StaffRole, { color: string; background: string; border: string }> = {
  owner: { color: "#fff", background: "linear-gradient(90deg,#ff3b5c,#00ffcc)", border: "#fff" },
  admin: { color: "#00ffcc", background: "rgba(0,255,204,.12)", border: "#00ffcc" },
  moderator: { color: "#ffae00", background: "rgba(255,174,0,.12)", border: "#ffae00" },
  delivery: { color: "#8ab4ff", background: "rgba(138,180,255,.12)", border: "#8ab4ff" },
}

export const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Modérateur" },
  { value: "delivery", label: "Livreur" },
]

export const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
  owner: allPermissions(true),
  admin: allPermissions(true),
  moderator: {
    dashboard: true,
    orders: true,
    shop: true,
    promotions: false,
    banner: false,
    auction: false,
    rewards: false,
    buybacks: true,
    access: false,
    staffChat: true,
    logs: true,
  },
  delivery: {
    dashboard: true,
    orders: true,
    shop: false,
    promotions: false,
    banner: false,
    auction: false,
    rewards: false,
    buybacks: false,
    access: false,
    staffChat: true,
    logs: false,
  },
}

function allPermissions(value: boolean): StaffPermissions {
  return PERMISSION_KEYS.reduce((permissions, key) => {
    permissions[key] = value
    return permissions
  }, {} as StaffPermissions)
}

export function normalizeRole(role: unknown): StaffRole {
  if (role === "owner" || role === "superadmin") return "owner"
  if (role === "admin") return "admin"
  if (role === "moderator") return "moderator"
  if (role === "delivery" || role === "livreur") return "delivery"
  return "delivery"
}

export function permissionsForRole(role: StaffRole) {
  return { ...DEFAULT_ROLE_PERMISSIONS[role] }
}

export function normalizePermissions(raw: unknown, role: StaffRole): StaffPermissions {
  const base = permissionsForRole(role)
  if (!raw || typeof raw !== "object") return base

  const incoming = raw as Partial<Record<AdminPermissionKey, unknown>>
  for (const key of PERMISSION_KEYS) {
    if (typeof incoming[key] === "boolean") base[key] = incoming[key]
  }

  if (role === "delivery") {
    return {
      ...base,
      shop: false,
      promotions: false,
      banner: false,
      auction: false,
      rewards: false,
      buybacks: false,
      access: false,
      logs: false,
    }
  }

  return base
}

export function canAccessTab(permissions: StaffPermissions, tab: AdminTab) {
  return permissions[TAB_PERMISSION_MAP[tab]]
}

export function getFirstAllowedTab(permissions: StaffPermissions): AdminTab {
  const tab = (Object.entries(TAB_PERMISSION_MAP).find(([, permission]) => permissions[permission])?.[0] || "dashboard") as AdminTab
  return tab
}
