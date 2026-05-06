import type { CSSProperties, ReactNode } from "react"

export const medicalStyles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "radial-gradient(circle at top,#3b0a0a,#190505,#111)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: 270,
    padding: 18,
    background: "rgba(17, 7, 10, .94)",
    borderRight: "1px solid rgba(239,68,68,.5)",
    boxShadow: "12px 0 35px rgba(0,0,0,.25)",
  },
  brand: {
    color: "#fecaca",
    fontWeight: 900,
    fontSize: 24,
    marginBottom: 8,
    textShadow: "0 0 16px rgba(239,68,68,.45)",
  },
  sidebarMeta: {
    color: "#fca5a5",
    fontSize: 13,
    marginBottom: 18,
  },
  navButton: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    marginBottom: 8,
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,.35)",
    background: "rgba(255,255,255,.05)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  navButtonActive: {
    background: "linear-gradient(90deg,rgba(220,38,38,.45),rgba(239,68,68,.12))",
    border: "1px solid #ef4444",
  },
  badge: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "#dc2626",
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
    backgroundImage:
      "linear-gradient(rgba(239,68,68,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,.035) 1px, transparent 1px)",
    backgroundSize: "26px 26px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    background: "rgba(255,255,255,.08)",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #ef4444",
    marginBottom: 16,
  },
  statusBadge: {
    padding: "10px 14px",
    background: "#220",
    borderRadius: 12,
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,.35)",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
    gap: 20,
    marginTop: 20,
    alignItems: "start",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 10,
    marginTop: 16,
  },
  stat: {
    padding: 12,
    background: "rgba(255,255,255,.06)",
    border: "1px solid #ef4444",
    borderRadius: 12,
    fontWeight: 800,
    boxShadow: "0 0 16px rgba(239,68,68,.12)",
  },
  toolbar: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  card: {
    background: "rgba(255,255,255,.07)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #ef4444",
    boxShadow: "0 10px 30px rgba(0,0,0,.28), 0 0 18px rgba(239,68,68,.09)",
    backdropFilter: "blur(8px)",
  },
  item: {
    padding: 12,
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 12,
    marginBottom: 10,
    background: "rgba(0,0,0,.18)",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ef4444",
    marginBottom: 10,
    background: "#111",
    color: "#fff",
  },
  button: {
    padding: "10px 12px",
    marginRight: 8,
    marginBottom: 8,
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  buttonSecondary: {
    padding: "10px 12px",
    marginRight: 8,
    marginBottom: 8,
    background: "#374151",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  chat: {
    minHeight: 300,
    maxHeight: 300,
    overflowY: "auto",
    background: "#111",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    border: "1px solid rgba(255,255,255,.08)",
  },
  map: {
    position: "relative",
    minHeight: 420,
    background: "url('/scum-map.png') center/cover no-repeat",
    border: "1px solid #ef4444",
    borderRadius: 16,
    overflow: "hidden",
  },
}

export function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section style={medicalStyles.card}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function ActionButton({
  children,
  onClick,
  secondary,
}: {
  children: ReactNode
  onClick: () => void
  secondary?: boolean
}) {
  return (
    <button style={secondary ? medicalStyles.buttonSecondary : medicalStyles.button} onClick={onClick}>
      {children}
    </button>
  )
}
