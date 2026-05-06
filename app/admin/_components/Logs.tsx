import { useMemo, useState } from "react"
import { styles } from "./styles"
import { EmptyState } from "./ui"

const SEVERITY_OPTIONS = [
  { value: "all", label: "Toutes gravites" },
  { value: "success", label: "Succes" },
  { value: "warning", label: "Attention" },
  { value: "danger", label: "Critique" },
  { value: "info", label: "Info" },
] as const

const SEVERITY_STYLES: Record<string, { border: string; color: string; background: string }> = {
  success: { border: "#00ff99", color: "#00ff99", background: "rgba(0,255,153,.1)" },
  warning: { border: "#ffae00", color: "#ffae00", background: "rgba(255,174,0,.1)" },
  danger: { border: "#ff3b5c", color: "#ff3b5c", background: "rgba(255,59,92,.12)" },
  info: { border: "#00ffcc", color: "#00ffcc", background: "rgba(0,255,204,.1)" },
}

function getLogTimestamp(log: any) {
  const value = log.timestamp || log.createdAt
  if (value?.seconds) return value.seconds * 1000
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (typeof value?.toDate === "function") return value.toDate().getTime()
  return 0
}

function formatLogDate(log: any) {
  const timestamp = getLogTimestamp(log)
  if (!timestamp) return "Date inconnue"

  return new Date(timestamp).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  })
}

function getSeverity(log: any) {
  return log.severity || (String(log.action || log.message || "").toLowerCase().includes("supprim") ? "danger" : "info")
}

export function Logs({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState<(typeof SEVERITY_OPTIONS)[number]["value"]>("all")

  const filteredLogs = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return [...logs]
      .sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
      .filter((log) => (severity === "all" ? true : getSeverity(log) === severity))
      .filter((log) => {
        if (!needle) return true
        const haystack = [
          log.action,
          log.message,
          log.text,
          log.admin,
          log.target,
          JSON.stringify(log.details || {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(needle)
      })
  }, [logs, search, severity])

  return (
    <div>
      <section style={styles.hero}>
        <div style={{ color: "#00ffcc", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", fontSize: 12 }}>
          Security timeline
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1 }}>
          Logs PRO
        </h1>
        <div style={{ color: "#b7d8e6" }}>
          Recherche, filtres et audit chronologique des actions admin.
        </div>
      </section>

      <div className="cyber-card" style={styles.card}>
        <div style={styles.inlineGrid}>
          <input
            style={styles.input}
            placeholder="Recherche action, admin, cible..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select style={styles.input} value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}>
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 && <EmptyState title="Aucun log trouve" detail="Ajuste la recherche ou le filtre de gravite." />}

      <div style={{ position: "relative", paddingLeft: 18 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 6,
            top: 0,
            bottom: 0,
            width: 1,
            background: "linear-gradient(#00ffcc, rgba(0,255,204,.08))",
            boxShadow: "0 0 12px rgba(0,255,204,.45)",
          }}
        />

        {filteredLogs.map((log: any, index: number) => {
          const action = log.action || log.message || log.text || "Log inconnu"
          const logSeverity = getSeverity(log)
          const tone = SEVERITY_STYLES[logSeverity] || SEVERITY_STYLES.info

          return (
            <div key={log.id || index} style={{ position: "relative" }}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -17,
                  top: 23,
                  width: 11,
                  height: 11,
                  borderRadius: 999,
                  background: tone.color,
                  boxShadow: `0 0 16px ${tone.color}`,
                }}
              />
              <div className="cyber-card" style={{ ...styles.card, border: `1px solid ${tone.border}`, transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontWeight: 900, color: "#fff" }}>{action}</div>
                  <span style={{ ...styles.badge, border: `1px solid ${tone.border}`, background: tone.background, color: tone.color }}>
                    {logSeverity}
                  </span>
                </div>

                <div style={{ opacity: 0.82, fontSize: 13 }}>
                  {formatLogDate(log)} - Admin: {log.admin || "SYSTEM"} {log.target ? `- Cible: ${log.target}` : ""}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <pre
                    style={{
                      marginTop: 10,
                      whiteSpace: "pre-wrap",
                      color: "#c9fff4",
                      background: "rgba(0,0,0,.24)",
                      border: "1px solid rgba(0,255,204,.12)",
                      borderRadius: 10,
                      padding: 10,
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
