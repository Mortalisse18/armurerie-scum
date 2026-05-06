import { styles } from "./styles"
import type { AdminStats, BuybackMetrics, LiveActivity, StaffMember } from "./types"
import { StatCard } from "./ui"

const ACTIVITY_TONES: Record<LiveActivity["kind"], { color: string; background: string; label: string }> = {
  order: { color: "#ffae00", background: "rgba(255,174,0,.12)", label: "ORDER" },
  assigned: { color: "#8ab4ff", background: "rgba(138,180,255,.12)", label: "ASSIGN" },
  delivered: { color: "#00ff99", background: "rgba(0,255,153,.12)", label: "DONE" },
  message: { color: "#00ffcc", background: "rgba(0,255,204,.12)", label: "CHAT" },
  stock: { color: "#ff3b5c", background: "rgba(255,59,92,.14)", label: "STOCK" },
  login: { color: "#b98cff", background: "rgba(185,140,255,.12)", label: "LOGIN" },
}

export function Dashboard({
  stats,
  orderCount,
  todayOrders,
  todayRevenue,
  topClient,
  criticalStock,
  buybacks,
  activeStaff,
  activities,
  liveClock,
}: {
  stats: AdminStats
  orderCount: number
  todayOrders: number
  todayRevenue: number
  topClient: string
  criticalStock: number
  buybacks: BuybackMetrics
  activeStaff: StaffMember[]
  activities: LiveActivity[]
  liveClock: string
}) {
  const activeOrders = stats.pending + stats.assigned + stats.delivering

  return (
    <div className="tab-panel">
      <section style={styles.hero}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
                Live command center
              </div>
              <span style={{ ...styles.badge, color: "#00ff99", border: "1px solid rgba(0,255,153,.36)", background: "rgba(0,255,153,.12)" }}>
                <span className="cyber-online-dot" style={{ width: 7, height: 7, borderRadius: 999, background: "#00ff99", boxShadow: "0 0 12px #00ff99" }} />
                SYSTEM ONLINE
              </span>
            </div>
            <h1 style={{ margin: "8px 0", fontSize: "clamp(30px, 4vw, 54px)", lineHeight: 1 }}>
              Bunker Control Center
            </h1>
            <div style={{ color: "#b7d8e6", maxWidth: 760 }}>
              Flux operationnel realtime pour commandes, livraisons, stocks critiques, chat staff et securite.
            </div>
          </div>

          <div
            style={{
              minWidth: 220,
              padding: 18,
              borderRadius: 18,
              border: "1px solid rgba(0,255,204,.28)",
              background: "rgba(0,255,204,.08)",
              boxShadow: "0 0 40px rgba(0,255,204,.16)",
              textAlign: "right",
            }}
          >
            <div style={{ color: "#8ba3b8", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
              Live clock
            </div>
            <div style={{ color: "#00ffcc", fontSize: 28, fontWeight: 900, marginTop: 4 }}>
              {liveClock || "--"}
            </div>
          </div>
        </div>

        <div style={{ ...styles.row, marginTop: 20 }}>
          <StatusPill label="Pending" value={stats.pending} color="#ffae00" />
          <StatusPill label="Assigned" value={stats.assigned} color="#8ab4ff" />
          <StatusPill label="Delivering" value={stats.delivering} color="#b98cff" />
          <StatusPill label="Delivered" value={stats.delivered} color="#00ff99" />
          <StatusPill label="Refused" value={stats.refused} color="#ff3b5c" />
        </div>
      </section>

      <div style={styles.grid}>
        <StatCard title="Active staff online" value={activeStaff.length} pulse={activeStaff.length > 0} />
        <StatCard title="Orders today" value={todayOrders} pulse={todayOrders > 0} />
        <StatCard title="Revenue today" value={`${todayRevenue}$`} />
        <StatCard title="Deliveries in progress" value={stats.delivering} pulse={stats.delivering > 0} />
        <StatCard title="Critical stock count" value={criticalStock} tone={criticalStock > 0 ? "danger" : "default"} pulse={criticalStock > 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, .75fr)", gap: 16, alignItems: "start" }}>
        <div style={styles.grid}>
          <StatCard title="Alertes" value={stats.pending > 0 ? `${stats.pending} commande(s)` : "RAS"} pulse={stats.pending > 0} />
          <StatCard title="Revenus moyen" value={`${stats.delivered ? Math.round(stats.totalMoney / stats.delivered) : 0}$`} />
          <StatCard title="Revenus livres" value={`${stats.totalMoney} $`} />
          <StatCard title="Total commandes" value={orderCount} />
          <StatCard title="Missions actives" value={activeOrders} pulse={activeOrders > 0} />
          <StatCard title="Top client" value={topClient} />
          <StatCard title="Rachats payes" value={`${buybacks.totalPaid}$`} />
          <StatCard title="Item le + revendu" value={buybacks.topItem} />
          <StatCard title="Top fournisseur" value={buybacks.topSupplier} />
        </div>

        <LiveActivityPanel activities={activities} activeStaff={activeStaff} />
      </div>
    </div>
  )
}

function StatusPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span style={{ ...styles.badge, color, border: `1px solid ${color}`, background: `${color}1f`, boxShadow: `0 0 18px ${color}26` }}>
      {label}: {value}
    </span>
  )
}

function LiveActivityPanel({
  activities,
  activeStaff,
}: {
  activities: LiveActivity[]
  activeStaff: StaffMember[]
}) {
  return (
    <div className="cyber-card" style={{ ...styles.card, position: "sticky", top: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14, alignItems: "center" }}>
        <div>
          <div style={styles.statTitle}>Live activity feed</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Operations stream</div>
        </div>
        <span style={{ ...styles.badge, color: "#00ff99", border: "1px solid rgba(0,255,153,.32)", background: "rgba(0,255,153,.1)" }}>
          LIVE
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={styles.statTitle}>Active staff</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {activeStaff.length === 0 && <span style={{ color: "#8ba3b8" }}>Aucun signal staff recent</span>}
          {activeStaff.slice(0, 6).map((member) => (
            <span key={member.id} style={{ ...styles.badge, color: "#00ff99", border: "1px solid rgba(0,255,153,.28)", background: "rgba(0,255,153,.08)" }}>
              <span className="cyber-online-dot" style={{ width: 6, height: 6, borderRadius: 999, background: "#00ff99" }} />
              {member.pseudo}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
        {activities.map((activity) => {
          const tone = ACTIVITY_TONES[activity.kind]
          return (
            <div
              key={activity.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${tone.color}45`,
                background: tone.background,
                boxShadow: `0 0 18px ${tone.color}14`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                <b>{activity.title}</b>
                <span style={{ ...styles.badge, color: tone.color, border: `1px solid ${tone.color}55`, background: "rgba(0,0,0,.18)" }}>
                  {tone.label}
                </span>
              </div>
              <div style={{ color: "#c9fff4", opacity: 0.84, fontSize: 13 }}>{activity.detail}</div>
              <div style={{ color: "#8ba3b8", fontSize: 12, marginTop: 6 }}>{formatActivityTime(activity.timestamp)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatActivityTime(timestamp: number) {
  if (!timestamp) return "Date inconnue"
  return new Date(timestamp).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}
