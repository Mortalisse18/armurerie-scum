import { useState } from "react"
import { styles } from "./styles"
import type { AdminStats, OrderStatus, StaffMember, StaffRole } from "./types"
import { EmptyState } from "./ui"

type OrderSectionKey = "active" | "delivered" | "refused"

const ORDER_SECTIONS: { key: OrderSectionKey; title: string }[] = [
  { key: "active", title: "En attente" },
  { key: "delivered", title: "Livrees" },
  { key: "refused", title: "Refusees" },
]

const DELIVERY_STATUSES: OrderStatus[] = ["pending", "assigned", "delivering"]

const STATUS_BADGES: Record<OrderStatus, { label: string; color: string; background: string; border: string }> = {
  pending: { label: "EN ATTENTE", color: "#ffae00", background: "rgba(255,174,0,.12)", border: "#ffae00" },
  assigned: { label: "ASSIGNEE", color: "#8ab4ff", background: "rgba(138,180,255,.12)", border: "#8ab4ff" },
  delivering: { label: "EN LIVRAISON", color: "#00ffcc", background: "rgba(0,255,204,.12)", border: "#00ffcc" },
  delivered: { label: "LIVREE", color: "#00ff99", background: "rgba(0,255,153,.12)", border: "#00ff99" },
  refused: { label: "REFUSEE", color: "#ff3b5c", background: "rgba(255,59,92,.14)", border: "#ff3b5c" },
}

const PLAYER_FIELD_PRIORITY = ["pseudo", "username", "displayName", "steamName"]
const LEGACY_PLAYER_FIELDS = ["playerName", "name", "nickname", "gamertag", "discord", "client"]
const PLAYER_OBJECT_KEYS = ["user", "player", "playerData", "userData", "metadata", "profile", "customer", "buyer"]
const EMPTY_PLAYER_VALUES = new Set(["", "joueur", "player", "unknown", "undefined", "null"])

function cleanPlayerValue(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return ""

  const text = String(value).trim()
  if (!text) return ""
  if (EMPTY_PLAYER_VALUES.has(text.toLowerCase())) return ""

  return text
}

function findPlayerName(source: any): string {
  if (!source || typeof source !== "object") return cleanPlayerValue(source)

  for (const field of PLAYER_FIELD_PRIORITY) {
    const direct = cleanPlayerValue(source[field])
    if (direct) return direct
  }

  for (const field of LEGACY_PLAYER_FIELDS) {
    const direct = cleanPlayerValue(source[field])
    if (direct) return direct
  }

  for (const key of PLAYER_OBJECT_KEYS) {
    const nested = findPlayerName(source[key])
    if (nested) return nested
  }

  return ""
}

export function getOrderPlayerName(order: any) {
  return findPlayerName(order) || "Inconnu"
}

function getTimestampMillis(value: any): number | null {
  if (!value) return null
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (value instanceof Date) return value.getTime()
  if (typeof value.toDate === "function") return value.toDate().getTime()
  if (typeof value.seconds === "number") return value.seconds * 1000
  return null
}

export function formatOrderDate(order: any) {
  const timestamp =
    getTimestampMillis(order.createdAt) ||
    getTimestampMillis(order.updatedAt) ||
    getTimestampMillis(order.date)

  if (!timestamp) return "Date inconnue"

  return new Date(timestamp).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function getOrderStatus(order: any): OrderStatus {
  if (order.status === "delivered" || order.status === "done") return "delivered"
  if (order.status === "refused") return "refused"
  if (order.status === "assigned") return "assigned"
  if (order.status === "delivering") return "delivering"
  return "pending"
}

function formatActionDate(value: any) {
  const timestamp = getTimestampMillis(value)
  if (!timestamp) return ""

  return new Date(timestamp).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function isInSection(order: any, section: OrderSectionKey) {
  const status = getOrderStatus(order)
  if (section === "active") return DELIVERY_STATUSES.includes(status)
  return status === section
}

function canManageAll(role: StaffRole) {
  return role === "owner" || role === "admin"
}

function canStartOrder(order: any, currentUser: string, role: StaffRole) {
  const status = getOrderStatus(order)
  if (status !== "assigned") return false
  if (canManageAll(role)) return true
  return role === "delivery" && order.assignedTo === currentUser
}

function canCompleteOrder(order: any, currentUser: string, role: StaffRole) {
  const status = getOrderStatus(order)
  if (status !== "delivering") return false
  if (canManageAll(role)) return true
  return role === "delivery" && order.assignedTo === currentUser
}

export function Orders({
  orders,
  search,
  stats,
  topClient,
  staffMembers,
  currentUser,
  currentRole,
  onSearch,
  onAssign,
  onStartDelivery,
  onCompleteDelivery,
  onRefuse,
  onDelete,
}: {
  orders: any[]
  search: string
  stats: AdminStats
  topClient: string
  staffMembers: StaffMember[]
  currentUser: string
  currentRole: StaffRole
  onSearch: (value: string) => void
  onAssign: (id: string, assignedTo: string) => void
  onStartDelivery: (id: string) => void
  onCompleteDelivery: (id: string) => void
  onRefuse: (id: string, reason?: string) => void
  onDelete: (id: string) => void
}) {
  const [activeSectionKey, setActiveSectionKey] = useState<OrderSectionKey>("active")
  const [assignTargets, setAssignTargets] = useState<Record<string, string>>({})
  const activeSection = ORDER_SECTIONS.find((section) => section.key === activeSectionKey) || ORDER_SECTIONS[0]
  const deliveryStaff = staffMembers.filter((member) => member.role === "delivery" || member.role === "admin" || member.role === "owner")
  const activeOrders = orders
    .filter((order: any) => isInSection(order, activeSectionKey))
    .filter((order: any) => getOrderPlayerName(order).toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <section style={styles.hero}>
        <div style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
          Delivery workflow
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1 }}>
          Commandes PRO
        </h1>
        <div style={{ color: "#b7d8e6" }}>
          Suivi temps reel des commandes, assignations livreur, livraisons et refus.
        </div>
      </section>

      <div style={styles.grid}>
        <div className="cyber-card" style={styles.card}>Top client: <b style={{ color: "#00ffcc" }}>{topClient}</b></div>
        <div className="cyber-card" style={styles.card}>Revenus: <b style={{ color: "#00ff99" }}>{stats.totalMoney}$</b></div>
        <div className="cyber-card" style={styles.card}>En attente: <b style={{ color: "#ffae00" }}>{stats.pending}</b></div>
        <div className="cyber-card" style={styles.card}>Assignees: <b style={{ color: "#8ab4ff" }}>{stats.assigned}</b></div>
        <div className="cyber-card" style={styles.card}>En livraison: <b style={{ color: "#00ffcc" }}>{stats.delivering}</b></div>
        <div className="cyber-card" style={styles.card}>Livrees: <b style={{ color: "#00ff99" }}>{stats.delivered}</b></div>
        <div className="cyber-card" style={styles.card}>Refusees: <b style={{ color: "#ff3b5c" }}>{stats.refused}</b></div>
      </div>

      <input
        style={styles.input}
        placeholder="Rechercher joueur..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div style={{ ...styles.row, marginTop: 8 }}>
        {ORDER_SECTIONS.map((section) => {
          const count = orders.filter((order: any) => isInSection(order, section.key)).length
          return (
            <button
              key={section.key}
              className="cyber-button"
              style={{
                ...styles.button,
                ...(activeSectionKey === section.key ? styles.sidebarButtonActive : {}),
              }}
              onClick={() => setActiveSectionKey(section.key)}
            >
              {section.title} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={styles.sectionTitle}>
          {activeSection.title} ({activeOrders.length})
        </h2>

        {activeOrders.length === 0 && (
          <EmptyState title="Aucune commande dans cette section" detail="Les nouvelles commandes apparaitront ici automatiquement." />
        )}

        {activeOrders.map((order: any) => (
          <div key={order.id} className="cyber-card" style={{ ...styles.card, padding: 18, transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#8ba3b8", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
                  Commande #{String(order.id || "").slice(0, 8)}
                </div>
                <b style={{ fontSize: 20 }}>{getOrderPlayerName(order)} <span style={{ color: "#00ff99" }}>{order.total}$</span></b>
              </div>
              <StatusBadge status={getOrderStatus(order)} />
            </div>
            <div style={{ marginTop: 6, opacity: 0.72, fontSize: 13 }}>
              {formatOrderDate(order)}
            </div>

            {order.assignedTo && (
              <div style={{ ...styles.badge, marginTop: 10, color: "#8ab4ff", border: "1px solid rgba(138,180,255,.35)", background: "rgba(138,180,255,.1)" }}>
                Assignee a {order.assignedTo}
                {formatActionDate(order.assignedAt) ? ` - ${formatActionDate(order.assignedAt)}` : ""}
              </div>
            )}

            {order.startedAt && (
              <div style={{ marginTop: 8, color: "#00ffcc", fontSize: 13 }}>
                Prise en charge {formatActionDate(order.startedAt)}
              </div>
            )}

            {order.deliveredBy && (
              <div style={{ marginTop: 8, color: "#00ff99", fontSize: 13 }}>
                Livree par {order.deliveredBy}
                {formatActionDate(order.deliveredAt) ? ` - ${formatActionDate(order.deliveredAt)}` : ""}
              </div>
            )}

            {order.refusedBy && (
              <div style={{ marginTop: 8, color: "#ffae00", fontSize: 13 }}>
                Refusee par {order.refusedBy}
                {order.refusedReason ? ` - ${order.refusedReason}` : ""}
              </div>
            )}

            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {order.items?.map((item: any, index: number) => (
                <div key={index} style={{ padding: "7px 10px", borderRadius: 10, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)" }}>
                  {item.name} x{item.quantity}
                </div>
              ))}
            </div>

            <div style={styles.actionGroup}>
              {getOrderStatus(order) === "pending" && canManageAll(currentRole) && (
                <>
                  <select
                    style={{ ...styles.input, width: "min(260px,100%)", marginRight: 8, marginBottom: 8 }}
                    value={assignTargets[order.id] || order.assignedTo || ""}
                    onChange={(event) => setAssignTargets((current) => ({ ...current, [order.id]: event.target.value }))}
                  >
                    <option value="">Choisir livreur</option>
                    {deliveryStaff.map((staff) => (
                      <option key={staff.id} value={staff.pseudo}>
                        {staff.pseudo} ({staff.role})
                      </option>
                    ))}
                  </select>
                  <button
                    className="cyber-button"
                    style={styles.button}
                    onClick={() => {
                      const assignedTo = assignTargets[order.id] || order.assignedTo || ""
                      if (!assignedTo) return
                      onAssign(order.id, assignedTo)
                    }}
                  >
                    Assigner livreur
                  </button>
                  <button
                    className="cyber-button"
                    style={{ ...styles.button, borderColor: "#ffae00", background: "rgba(255,174,0,.12)" }}
                    onClick={() => {
                      const reason = window.prompt("Raison du refus (optionnel)") || ""
                      onRefuse(order.id, reason.trim() || undefined)
                    }}
                  >
                    Refuser commande
                  </button>
                </>
              )}

              {canStartOrder(order, currentUser, currentRole) && (
                <button className="cyber-button" style={styles.button} onClick={() => onStartDelivery(order.id)}>
                  Prendre en charge
                </button>
              )}

              {canCompleteOrder(order, currentUser, currentRole) && (
                <button className="cyber-button" style={styles.button} onClick={() => onCompleteDelivery(order.id)}>
                  Livraison terminee
                </button>
              )}

              {canManageAll(currentRole) && (
                <button className="cyber-button" style={{ ...styles.button, borderColor: "#ff3b5c", background: "rgba(255,59,92,.12)" }} onClick={() => onDelete(order.id)}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = STATUS_BADGES[status]

  return (
    <span
      style={{
        ...styles.badge,
        color: tone.color,
        background: tone.background,
        border: `1px solid ${tone.border}`,
        boxShadow: `0 0 18px ${tone.background}`,
      }}
    >
      {tone.label}
    </span>
  )
}
