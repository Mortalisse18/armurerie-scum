import { useMemo, useState } from "react"
import { styles } from "./styles"
import type { OrderStatus, PlayerNote, StaffRole } from "./types"
import { EmptyState, StatCard } from "./ui"

type PlayerTab = "overview" | "orders" | "buybacks" | "notes" | "activity"

type PlayerProfile = {
  uid: string
  pseudo: string
  type: string
  createdAt?: unknown
  lastActivity: number
}

const PLAYER_TABS: { key: PlayerTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "buybacks", label: "Buybacks" },
  { key: "notes", label: "Staff Notes" },
  { key: "activity", label: "Activity" },
]

const STATUS_TONES: Record<OrderStatus | "accepted", { color: string; background: string }> = {
  pending: { color: "#ffae00", background: "rgba(255,174,0,.12)" },
  assigned: { color: "#8ab4ff", background: "rgba(138,180,255,.12)" },
  delivering: { color: "#b98cff", background: "rgba(185,140,255,.12)" },
  delivered: { color: "#00ff99", background: "rgba(0,255,153,.12)" },
  refused: { color: "#ff3b5c", background: "rgba(255,59,92,.14)" },
  accepted: { color: "#00ff99", background: "rgba(0,255,153,.12)" },
}

const PLAYER_FIELDS = ["pseudo", "username", "displayName", "steamName", "playerName", "name"]
const UID_FIELDS = ["uid", "userId", "playerUid", "playerId", "authUid"]

export function PlayerProfiles({
  userProfiles,
  orders,
  buybacks,
  logs,
  chatMessages,
  notes,
  currentRole,
  currentUser,
  onAddNote,
  onOpenChat,
  onViewOrders,
}: {
  userProfiles: any[]
  orders: any[]
  buybacks: any[]
  logs: any[]
  chatMessages: any[]
  notes: PlayerNote[]
  currentRole: StaffRole
  currentUser: string
  onAddNote: (player: { uid: string; pseudo: string }, note: string) => void
  onOpenChat: (pseudo: string) => void
  onViewOrders: (pseudo: string) => void
}) {
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState("")
  const [tab, setTab] = useState<PlayerTab>("overview")
  const [draftNote, setDraftNote] = useState("")
  const fullAccess = currentRole === "owner" || currentRole === "admin"
  const moderatorAccess = currentRole === "moderator"
  const canUseNotes = fullAccess

  const players = useMemo(
    () => buildPlayers(userProfiles, orders, buybacks, chatMessages),
    [userProfiles, orders, buybacks, chatMessages],
  )

  const filteredPlayers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return players
    return players.filter((player) =>
      player.pseudo.toLowerCase().includes(needle) ||
      player.uid.toLowerCase().includes(needle),
    )
  }, [players, query])

  const selected = players.find((player) => player.uid === selectedKey || player.pseudo === selectedKey) || filteredPlayers[0]
  const playerOrders = selected ? filterPlayerOrders(orders, selected, currentRole, currentUser) : []
  const playerBuybacks = selected && currentRole !== "delivery" ? filterPlayerEntries(buybacks, selected) : []
  const playerMessages = selected && currentRole !== "delivery" ? filterPlayerEntries(chatMessages, selected) : []
  const playerLogs = selected && currentRole !== "delivery" ? filterPlayerEntries(logs, selected) : []
  const playerNotes = selected && currentRole !== "delivery" ? notes.filter((note) => note.uid === selected.uid || note.pseudo === selected.pseudo) : []
  const metrics = selected ? getPlayerMetrics(selected, playerOrders, playerBuybacks) : null

  function saveNote() {
    if (!selected || !draftNote.trim() || !canUseNotes) return
    onAddNote({ uid: selected.uid, pseudo: selected.pseudo }, draftNote.trim())
    setDraftNote("")
  }

  return (
    <div className="tab-panel">
      <section style={styles.hero}>
        <div style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
          Player intelligence system
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1 }}>
          Profils Joueurs
        </h1>
        <div style={{ color: "#b7d8e6" }}>
          Recherche live, historique commandes, rachats, interactions staff et notes internes.
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        <aside className="cyber-card" style={{ ...styles.card, position: "sticky", top: 16 }}>
          <input
            style={styles.input}
            placeholder="Search pseudo or uid..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div style={{ display: "grid", gap: 8, maxHeight: 620, overflowY: "auto", paddingRight: 4 }}>
            {filteredPlayers.length === 0 && <EmptyState title="Aucun joueur" detail="Aucun pseudo ou uid ne correspond." />}
            {filteredPlayers.map((player) => (
              <button
                key={player.uid || player.pseudo}
                className="cyber-sidebar-button"
                style={{
                  ...styles.sidebarButton,
                  ...(selected?.uid === player.uid && selected?.pseudo === player.pseudo ? styles.sidebarButtonActive : {}),
                  marginBottom: 0,
                }}
                onClick={() => {
                  setSelectedKey(player.uid || player.pseudo)
                  setTab("overview")
                }}
              >
                <span>
                  <b>{player.pseudo}</b>
                  <span style={{ display: "block", color: "#8ba3b8", fontSize: 12, marginTop: 3 }}>
                    {player.uid || "uid inconnu"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {!selected || !metrics ? (
          <EmptyState title="Selectionne un joueur" detail="Le profil complet apparaitra ici." />
        ) : (
          <section>
            <div className="cyber-card" style={{ ...styles.card, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#8ba3b8", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
                    Player profile
                  </div>
                  <h2 style={{ margin: "6px 0", fontSize: "clamp(26px,3vw,42px)" }}>{selected.pseudo}</h2>
                  <div style={{ color: "#c9fff4" }}>{selected.uid || "UID inconnu"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-end" }}>
                  <Badge label={selected.type} color="#8ab4ff" />
                  <Badge label={formatDate(selected.lastActivity)} color="#00ffcc" />
                </div>
              </div>

              <div style={{ ...styles.actionGroup, marginTop: 18 }}>
                <button className="cyber-button" style={styles.button} onClick={() => onOpenChat(selected.pseudo)}>
                  Open chat
                </button>
                <button className="cyber-button" style={styles.button} onClick={() => copyText(selected.uid || selected.pseudo)}>
                  Copy uid
                </button>
                <button className="cyber-button" style={styles.button} onClick={() => onViewOrders(selected.pseudo)}>
                  View orders
                </button>
                {canUseNotes && (
                  <button className="cyber-button" style={styles.button} onClick={() => setTab("notes")}>
                    Add note
                  </button>
                )}
              </div>
            </div>

            <div style={styles.grid}>
              <StatCard title="Total spent" value={`${metrics.totalSpent}$`} />
              <StatCard title="Total buybacks" value={`${metrics.totalBuybacks}$`} />
              <StatCard title="Total orders" value={playerOrders.length} />
              <StatCard title="Pending orders" value={metrics.pending} tone={metrics.pending > 0 ? "warning" : "default"} />
              <StatCard title="Delivered orders" value={metrics.delivered} tone="success" />
              <StatCard title="Refused orders" value={metrics.refused} tone={metrics.refused > 0 ? "danger" : "default"} />
            </div>

            <div style={{ ...styles.row, margin: "6px 0 16px" }}>
              {PLAYER_TABS.filter((item) => item.key !== "notes" || currentRole !== "delivery").map((item) => (
                <button
                  key={item.key}
                  className="cyber-button"
                  style={{ ...styles.button, ...(tab === item.key ? styles.sidebarButtonActive : {}) }}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <OverviewPanel player={selected} metrics={metrics} messages={playerMessages} notes={playerNotes} moderatorAccess={moderatorAccess} />
            )}

            {tab === "orders" && <OrdersHistory orders={playerOrders} />}

            {tab === "buybacks" && (
              currentRole === "delivery"
                ? <EmptyState title="Acces limite" detail="Le role livreur ne voit pas les rachats joueur." />
                : <BuybackHistory buybacks={playerBuybacks} />
            )}

            {tab === "notes" && (
              currentRole === "delivery"
                ? <EmptyState title="Acces limite" detail="Les notes internes sont reservees au staff autorise." />
                : <NotesPanel notes={playerNotes} draft={draftNote} canAdd={canUseNotes} onDraft={setDraftNote} onSave={saveNote} />
            )}

            {tab === "activity" && (
              currentRole === "delivery"
                ? <EmptyState title="Acces limite" detail="Le role livreur voit uniquement les commandes assignees." />
                : <ActivityPanel messages={playerMessages} logs={playerLogs} orders={playerOrders} />
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function OverviewPanel({
  player,
  metrics,
  messages,
  notes,
  moderatorAccess,
}: {
  player: PlayerProfile
  metrics: ReturnType<typeof getPlayerMetrics>
  messages: any[]
  notes: PlayerNote[]
  moderatorAccess: boolean
}) {
  return (
    <div className="cyber-card" style={styles.card}>
      <h3 style={{ marginTop: 0 }}>Overview</h3>
      <div style={styles.inlineGrid}>
        <Info label="Role / type" value={player.type} />
        <Info label="Last activity" value={formatDate(player.lastActivity)} />
        <Info label="Account creation" value={formatDate(getTimestampMillis(player.createdAt))} />
        <Info label="Orders active" value={String(metrics.pending + metrics.assigned + metrics.delivering)} />
        <Info label="Staff messages" value={String(messages.length)} />
        <Info label="Internal notes" value={moderatorAccess ? "Acces limite" : String(notes.length)} />
      </div>
    </div>
  )
}

function OrdersHistory({ orders }: { orders: any[] }) {
  if (orders.length === 0) return <EmptyState title="Aucune commande" detail="Aucun historique commande pour ce joueur." />

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {orders.map((order) => {
        const status = normalizeOrderStatus(order.status)
        const tone = STATUS_TONES[status]
        return (
          <div key={order.id} className="cyber-card" style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <b>Commande #{String(order.id || "").slice(0, 8)} - {order.total || 0}$</b>
              <Badge label={status} color={tone.color} background={tone.background} />
            </div>
            <div style={{ color: "#8ba3b8", fontSize: 13, marginTop: 6 }}>{formatDate(getTimestampMillis(order.createdAt))}</div>
            {order.items?.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                {order.items.map((item: any, index: number) => (
                  <div key={index} style={{ padding: "7px 10px", borderRadius: 10, background: "rgba(255,255,255,.035)" }}>
                    {item.name} x{item.quantity}
                  </div>
                ))}
              </div>
            )}
            <div style={{ ...styles.row, marginTop: 12, alignItems: "stretch" }}>
              <TimelineItem label="Created" value={formatDate(getTimestampMillis(order.createdAt))} color="#ffae00" />
              {order.assignedTo && <TimelineItem label="Assigned" value={`${order.assignedTo} - ${formatDate(getTimestampMillis(order.assignedAt))}`} color="#8ab4ff" />}
              {order.startedAt && <TimelineItem label="Started" value={formatDate(getTimestampMillis(order.startedAt))} color="#b98cff" />}
              {order.deliveredBy && <TimelineItem label="Delivered" value={`${order.deliveredBy} - ${formatDate(getTimestampMillis(order.deliveredAt))}`} color="#00ff99" />}
              {order.refusedReason && <TimelineItem label="Refused" value={order.refusedReason} color="#ff3b5c" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BuybackHistory({ buybacks }: { buybacks: any[] }) {
  if (buybacks.length === 0) return <EmptyState title="Aucun rachat" detail="Aucun item revendu par ce joueur." />

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {buybacks.map((buyback) => {
        const status = buyback.status === "accepted" ? "accepted" : buyback.status === "refused" ? "refused" : "pending"
        const tone = STATUS_TONES[status as OrderStatus | "accepted"] || STATUS_TONES.pending
        return (
          <div key={buyback.id} className="cyber-card" style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <b>{buyback.item || "Item inconnu"} x{buyback.quantity || 1}</b>
              <Badge label={status} color={tone.color} background={tone.background} />
            </div>
            <div style={{ color: "#c9fff4", marginTop: 8 }}>
              Prix estime: {Number(buyback.price || buyback.total || 0)}$
            </div>
            <div style={{ color: "#8ba3b8", fontSize: 13, marginTop: 6 }}>{formatDate(getTimestampMillis(buyback.createdAt))}</div>
          </div>
        )
      })}
    </div>
  )
}

function NotesPanel({
  notes,
  draft,
  canAdd,
  onDraft,
  onSave,
}: {
  notes: PlayerNote[]
  draft: string
  canAdd: boolean
  onDraft: (value: string) => void
  onSave: () => void
}) {
  return (
    <div className="cyber-card" style={styles.card}>
      {canAdd && (
        <div style={{ marginBottom: 14 }}>
          <textarea
            style={{ ...styles.input, minHeight: 92, resize: "vertical" }}
            placeholder="Note interne staff..."
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
          />
          <button className="cyber-button" style={styles.button} onClick={onSave}>
            Save note
          </button>
        </div>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {notes.length === 0 && <EmptyState title="Aucune note" detail="Les notes internes staff apparaitront ici." />}
        {notes.map((note) => (
          <div key={note.id} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,204,.18)", background: "rgba(0,255,204,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <b>{note.author || "Staff"}</b>
              <span style={{ color: "#8ba3b8", fontSize: 12 }}>{formatDate(getTimestampMillis(note.createdAt))}</span>
            </div>
            <div style={{ color: "#eafffb", whiteSpace: "pre-wrap" }}>{note.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityPanel({ messages, logs, orders }: { messages: any[]; logs: any[]; orders: any[] }) {
  const events = [
    ...messages.map((message) => ({
      id: `message-${message.id}`,
      title: "Message",
      detail: `${message.user || "Chat"} - ${message.text || ""}`,
      timestamp: getTimestampMillis(message.createdAt),
      color: "#00ffcc",
    })),
    ...logs.map((log) => ({
      id: `log-${log.id}`,
      title: log.action || log.message || "Interaction staff",
      detail: `${log.admin || "SYSTEM"} ${log.target ? `- ${log.target}` : ""}`,
      timestamp: getTimestampMillis(log.createdAt || log.timestamp),
      color: log.severity === "danger" ? "#ff3b5c" : "#8ab4ff",
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      title: "Commande",
      detail: `${normalizeOrderStatus(order.status)} - ${order.total || 0}$`,
      timestamp: getTimestampMillis(order.createdAt),
      color: "#ffae00",
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  if (events.length === 0) return <EmptyState title="Aucune activite" detail="Aucune interaction staff ou joueur trouvee." />

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {events.slice(0, 40).map((event) => (
        <div key={event.id} className="cyber-card" style={{ ...styles.card, borderColor: `${event.color}55` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <b>{event.title}</b>
            <span style={{ color: event.color, fontSize: 13 }}>{formatDate(event.timestamp)}</span>
          </div>
          <div style={{ color: "#c9fff4", marginTop: 6 }}>{event.detail}</div>
        </div>
      ))}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,204,.14)", background: "rgba(255,255,255,.035)" }}>
      <div style={styles.statTitle}>{label}</div>
      <div style={{ color: "#eafffb", fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function TimelineItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: "1 1 180px", padding: 10, borderRadius: 12, border: `1px solid ${color}55`, background: `${color}14` }}>
      <div style={{ color, fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: "#eafffb", fontSize: 13, marginTop: 4 }}>{value}</div>
    </div>
  )
}

function Badge({ label, color, background }: { label: string; color: string; background?: string }) {
  return (
    <span style={{ ...styles.badge, color, border: `1px solid ${color}`, background: background || `${color}1f` }}>
      {label}
    </span>
  )
}

function buildPlayers(userProfiles: any[], orders: any[], buybacks: any[], chatMessages: any[]) {
  const map = new Map<string, PlayerProfile>()

  const upsert = (source: any, fallbackType: string, activityValue?: unknown) => {
    const pseudo = getPlayerPseudo(source)
    const uid = getPlayerUid(source)
    if (!pseudo && !uid) return
    const key = uid || pseudo
    const existing = map.get(key)
    const activity = getTimestampMillis(activityValue || source.lastLogin || source.updatedAt || source.createdAt)
    map.set(key, {
      uid: uid || existing?.uid || "",
      pseudo: pseudo || existing?.pseudo || uid || "Inconnu",
      type: String(source.role || source.type || fallbackType || existing?.type || "player"),
      createdAt: source.createdAt || source.metadata?.creationTime || existing?.createdAt,
      lastActivity: Math.max(existing?.lastActivity || 0, activity),
    })
  }

  userProfiles.forEach((profile) => upsert(profile, "player"))
  orders.forEach((order) => upsert(order, "customer", order.createdAt))
  buybacks.forEach((buyback) => upsert(buyback, "supplier", buyback.createdAt))
  chatMessages.forEach((message) => upsert({ ...message, pseudo: message.user }, message.role || "chat", message.createdAt))

  return [...map.values()].sort((a, b) => b.lastActivity - a.lastActivity || a.pseudo.localeCompare(b.pseudo))
}

function getPlayerMetrics(player: PlayerProfile, orders: any[], buybacks: any[]) {
  return {
    totalSpent: orders
      .filter((order) => normalizeOrderStatus(order.status) === "delivered")
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
    totalBuybacks: buybacks
      .filter((buyback) => buyback.status === "accepted")
      .reduce((sum, buyback) => sum + Number(buyback.price || buyback.total || 0), 0),
    totalOrders: orders.length,
    pending: orders.filter((order) => normalizeOrderStatus(order.status) === "pending").length,
    assigned: orders.filter((order) => normalizeOrderStatus(order.status) === "assigned").length,
    delivering: orders.filter((order) => normalizeOrderStatus(order.status) === "delivering").length,
    delivered: orders.filter((order) => normalizeOrderStatus(order.status) === "delivered").length,
    refused: orders.filter((order) => normalizeOrderStatus(order.status) === "refused").length,
    player,
  }
}

function filterPlayerOrders(orders: any[], player: PlayerProfile, role: StaffRole, currentUser: string) {
  return orders
    .filter((entry) => matchesPlayer(entry, player))
    .filter((entry) => {
      if (role !== "delivery") return true
      return entry.assignedTo === currentUser || entry.deliveredBy === currentUser
    })
    .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt))
}

function filterPlayerEntries(entries: any[], player: PlayerProfile) {
  return entries
    .filter((entry) => matchesPlayer(entry, player) || String(entry.target || "").toLowerCase() === player.pseudo.toLowerCase())
    .sort((a, b) => getTimestampMillis(b.createdAt || b.timestamp) - getTimestampMillis(a.createdAt || a.timestamp))
}

function matchesPlayer(entry: any, player: PlayerProfile) {
  const uid = getPlayerUid(entry)
  const pseudo = getPlayerPseudo(entry)
  if (player.uid && uid && player.uid === uid) return true
  return Boolean(player.pseudo && pseudo && player.pseudo.toLowerCase() === pseudo.toLowerCase())
}

function getPlayerPseudo(source: any) {
  for (const field of PLAYER_FIELDS) {
    if (typeof source?.[field] === "string" && source[field].trim()) return source[field].trim()
  }
  if (typeof source?.user?.pseudo === "string") return source.user.pseudo
  if (typeof source?.player?.pseudo === "string") return source.player.pseudo
  return ""
}

function getPlayerUid(source: any) {
  for (const field of UID_FIELDS) {
    if (typeof source?.[field] === "string" && source[field].trim()) return source[field].trim()
  }
  if (typeof source?.user?.uid === "string") return source.user.uid
  if (typeof source?.player?.uid === "string") return source.player.uid
  return ""
}

function normalizeOrderStatus(status: unknown): OrderStatus {
  if (status === "delivered" || status === "done") return "delivered"
  if (status === "assigned") return "assigned"
  if (status === "delivering") return "delivering"
  if (status === "refused") return "refused"
  return "pending"
}

function getTimestampMillis(value: any): number {
  if (!value) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (value instanceof Date) return value.getTime()
  if (typeof value.toDate === "function") return value.toDate().getTime()
  if (typeof value.seconds === "number") return value.seconds * 1000
  return 0
}

function formatDate(timestamp: number) {
  if (!timestamp) return "Date inconnue"
  return new Date(timestamp).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function copyText(value: string) {
  if (!value || typeof navigator === "undefined") return
  navigator.clipboard?.writeText(value).catch(() => undefined)
}
