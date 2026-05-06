/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"
import type { BuybackMetrics } from "./types"

export function Buybacks({
  buybacks,
  items,
  filter,
  metrics,
  onFilterChange,
  onAccept,
  onRefuse,
  onDelete,
  onClearFinished,
}: {
  buybacks: any[]
  items: any[]
  filter: string
  metrics: BuybackMetrics
  onFilterChange: (value: string) => void
  onAccept: (id: string) => void
  onRefuse: (id: string) => void
  onDelete: (id: string) => void
  onClearFinished: () => void
}) {
  return (
    <div>
      <h1>♻️ Gestion des Rachats</h1>

      <div style={styles.row}>
        <div style={styles.card}>💰 Total payé: {metrics.totalPaid}$</div>
        <div style={styles.card}>📦 Top item: {metrics.topItem}</div>
        <div style={styles.card}>👑 Top vendeur: {metrics.topSupplier}</div>
      </div>

      <select style={styles.input} value={filter} onChange={(event) => onFilterChange(event.target.value)}>
        <option value="all">Tous</option>
        <option value="pending">En attente</option>
        <option value="accepted">Acceptés</option>
        <option value="refused">Refusés</option>
      </select>

      {buybacks
        .filter((buyback: any) => (filter === "all" ? true : buyback.status === filter))
        .map((buyback: any) => {
          const item: any = items.find((entry: any) => entry.name?.toLowerCase() === String(buyback.item || "").toLowerCase()) || {}
          const total = Math.round(Number(item.price || 0) * 0.5 * Number(buyback.quantity || 0))

          return (
            <div key={buyback.id} style={styles.card}>
              <h3>{buyback.item}</h3>
              <div>👤 Joueur: {buyback.pseudo || buyback.playerName || "Inconnu"}</div>
              <div>📦 Quantité: {buyback.quantity}</div>
              <div>💵 Paiement: {total}$</div>
              <div>📌 Status: {buyback.status || "pending"}</div>

              <div style={{ marginTop: 12 }}>
                <button style={styles.button} onClick={() => onAccept(buyback.id)}>
                  ✔ Accepter
                </button>
                <button style={styles.button} onClick={() => onRefuse(buyback.id)}>
                  ❌ Refuser
                </button>
                <button style={styles.button} onClick={() => onDelete(buyback.id)}>
                  🗑 Supprimer
                </button>
              </div>
            </div>
          )
        })}

      <button style={styles.button} onClick={onClearFinished}>
        🧹 Nettoyer rachats terminés
      </button>
    </div>
  )
}
