import { styles } from "./styles"
import type { AdminStats, BuybackMetrics } from "./types"
import { StatCard } from "./ui"

export function Dashboard({
  stats,
  orderCount,
  todayOrders,
  topClient,
  criticalStock,
  buybacks,
}: {
  stats: AdminStats
  orderCount: number
  todayOrders: number
  topClient: string
  criticalStock: number
  buybacks: BuybackMetrics
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <h1 style={{ margin: 0 }}>🩸 Armurerie Sauce Sanguine</h1>
        <img
          src="/logo.png"
          alt="Logo serveur"
          style={{
            width: 72,
            height: 72,
            objectFit: "contain",
            filter: "drop-shadow(0 0 10px rgba(0,255,204,.45))",
          }}
        />
      </div>

      <div style={styles.grid}>
        <StatCard title="🚨 Alertes" value={stats.pending > 0 ? `${stats.pending} commande(s)` : "RAS"} />
        <StatCard title="📈 Revenus moyen" value={`${orderCount ? Math.round(stats.totalMoney / orderCount) : 0}$`} />
        <StatCard title="💰 Chiffre total" value={`${stats.totalMoney} $`} />
        <StatCard title="📦 Total commandes" value={orderCount} />
        <StatCard title="⏳ En attente" value={stats.pending} />
        <StatCard title="📅 Aujourd'hui" value={todayOrders} />
        <StatCard title="🏆 Top client" value={topClient} />
        <StatCard title="⚠ Stock critique" value={criticalStock} />
        <StatCard title="💸 Total rachats payés" value={`${buybacks.totalPaid}$`} />
        <StatCard title="📦 Item le + revendu" value={buybacks.topItem} />
        <StatCard title="👑 Top fournisseur" value={buybacks.topSupplier} />
      </div>
    </div>
  )
}
