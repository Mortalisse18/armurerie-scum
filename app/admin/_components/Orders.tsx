/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"
import type { AdminStats, OrderStatus } from "./types"

const ORDER_SECTIONS: { key: OrderStatus; title: string }[] = [
  { key: "pending", title: "📦 Commandes en attente" },
  { key: "delivered", title: "✅ Commandes validées" },
  { key: "refused", title: "❌ Commandes refusées" },
]

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

export function Orders({
  orders,
  search,
  stats,
  topClient,
  onSearch,
  onUpdateStatus,
  onDelete,
}: {
  orders: any[]
  search: string
  stats: AdminStats
  topClient: string
  onSearch: (value: string) => void
  onUpdateStatus: (id: string, status: OrderStatus) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <h1>Commandes PRO</h1>

      <div style={styles.row}>
        <div style={styles.card}>🏆 Top client: {topClient}</div>
        <div style={styles.card}>💰 Total: {stats.totalMoney}$</div>
        <div style={styles.card}>📦 Commandes: {orders.length}</div>
      </div>

      <input
        style={styles.input}
        placeholder="🔎 Rechercher joueur..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      {ORDER_SECTIONS.map((section) => {
        const list = orders
          .filter((order: any) => (order.status || "pending") === section.key)
          .filter((order: any) => getOrderPlayerName(order).toLowerCase().includes(search.toLowerCase()))

        return (
          <div key={section.key} style={{ marginTop: 20 }}>
            <h2>
              {section.title} ({list.length})
            </h2>

            {list.length === 0 && <div style={styles.card}>Aucune commande</div>}

            {list.map((order: any) => (
              <div key={order.id} style={styles.card}>
                <b>{getOrderPlayerName(order)}</b> — {order.total}$
                <div style={{ marginTop: 6, opacity: 0.72, fontSize: 13 }}>
                  {formatOrderDate(order)}
                </div>

                <div style={{ marginTop: 8 }}>
                  {order.items?.map((item: any, index: number) => (
                    <div key={index}>
                      • {item.name} x{item.quantity}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10 }}>
                  {section.key === "pending" && (
                    <>
                      <button style={styles.button} onClick={() => onUpdateStatus(order.id, "delivered")}>
                        ✔ Livrer
                      </button>
                      <button style={styles.button} onClick={() => onUpdateStatus(order.id, "refused")}>
                        ❌ Refuser
                      </button>
                    </>
                  )}

                  {section.key !== "pending" && (
                    <button style={styles.button} onClick={() => onUpdateStatus(order.id, "pending")}>
                      ↩ Remettre attente
                    </button>
                  )}

                  <button style={styles.button} onClick={() => onDelete(order.id)}>
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
