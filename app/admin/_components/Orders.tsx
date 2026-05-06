/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"
import type { AdminStats, OrderStatus } from "./types"

const ORDER_SECTIONS: { key: OrderStatus; title: string }[] = [
  { key: "pending", title: "📦 Commandes en attente" },
  { key: "delivered", title: "✅ Commandes validées" },
  { key: "refused", title: "❌ Commandes refusées" },
]

function getOrderName(order: any) {
  return (
    order.playerName ||
    order.pseudo ||
    order.user ||
    order.username ||
    order.buyer ||
    order.discord ||
    order.displayName ||
    order.client ||
    order.nickname ||
    order.gamertag ||
    order.name ||
    "Joueur inconnu"
  )
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
          .filter((order: any) => getOrderName(order).toLowerCase().includes(search.toLowerCase()))

        return (
          <div key={section.key} style={{ marginTop: 20 }}>
            <h2>
              {section.title} ({list.length})
            </h2>

            {list.length === 0 && <div style={styles.card}>Aucune commande</div>}

            {list.map((order: any) => (
              <div key={order.id} style={styles.card}>
                <b>{getOrderName(order)}</b> — {order.total}$

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
