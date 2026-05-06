import { styles } from "./styles"
import { ROLE_COLORS, ROLE_LABELS } from "./permissions"
import type { StaffRole, ToastMessage } from "./types"

export function CyberpunkStyles() {
  return (
    <style jsx global>{`
      @keyframes cyberPulse {
        0%, 100% { opacity: .72; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-1px); }
      }

      @keyframes commandGrid {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 34px 34px, 34px 34px; }
      }

      @keyframes scanline {
        0% { transform: translateY(-100%); opacity: 0; }
        12% { opacity: .5; }
        100% { transform: translateY(100vh); opacity: 0; }
      }

      @keyframes toastSlide {
        from { opacity: 0; transform: translateY(-10px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes pulseRing {
        0%, 100% { box-shadow: 0 0 22px rgba(255,174,0,.12); }
        50% { box-shadow: 0 0 34px rgba(255,174,0,.3); }
      }

      .command-center-shell {
        position: relative;
      }

      .command-center-shell::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 22% 24%, rgba(0,255,204,.08), transparent 8%),
          radial-gradient(circle at 78% 16%, rgba(138,180,255,.06), transparent 9%),
          radial-gradient(circle at 66% 78%, rgba(255,59,141,.06), transparent 10%);
        opacity: .9;
        z-index: 0;
      }

      .command-center-shell::after {
        content: "";
        position: fixed;
        left: 280px;
        right: 0;
        top: 0;
        height: 180px;
        pointer-events: none;
        background: linear-gradient(to bottom, transparent, rgba(0,255,204,.08), transparent);
        animation: scanline 8s linear infinite;
        z-index: 0;
      }

      .command-content {
        position: relative;
        z-index: 1;
        animation: commandGrid 18s linear infinite;
      }

      .cyber-card,
      .cyber-button,
      .cyber-sidebar-button {
        will-change: transform, box-shadow;
      }

      .cyber-card:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 255, 204, .36) !important;
        box-shadow: 0 24px 64px rgba(0,0,0,.34), 0 0 34px rgba(0,255,204,.14) !important;
      }

      .cyber-button:hover,
      .cyber-sidebar-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 28px rgba(0,255,204,.2), inset 0 1px 0 rgba(255,255,255,.08) !important;
      }

      .cyber-online-dot {
        animation: cyberPulse 1.8s ease-in-out infinite;
      }

      .pulse-new {
        animation: pulseRing 1.8s ease-in-out infinite;
      }

      .tab-panel {
        animation: toastSlide .22s ease-out both;
      }

      .cyber-toast {
        animation: toastSlide .2s ease-out both;
      }

      @media (max-width: 860px) {
        main {
          flex-direction: column;
        }

        aside {
          width: auto !important;
          height: auto !important;
          position: relative !important;
        }
      }
    `}</style>
  )
}

export function StatCard({
  title,
  value,
  tone = "default",
  pulse = false,
}: {
  title: string
  value: string | number
  tone?: "default" | "danger" | "success" | "warning"
  pulse?: boolean
}) {
  const toneStyles = {
    default: {},
    danger: { borderColor: "#ff3b5c", boxShadow: "0 0 28px rgba(255,59,92,.16)" },
    success: { borderColor: "#00ff99", boxShadow: "0 0 28px rgba(0,255,153,.14)" },
    warning: { borderColor: "#ffae00", boxShadow: "0 0 28px rgba(255,174,0,.14)" },
  }[tone]

  return (
    <div className={`cyber-card${pulse ? " pulse-new" : ""}`} style={{ ...styles.card, ...toneStyles, minHeight: 108, transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease" }}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  )
}

export function PanelCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="cyber-card" style={{ ...styles.panelCard, transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease" }}>
      <div style={styles.panelHeader}>{title}</div>
      <div>{children}</div>
    </div>
  )
}

export function RoleBadge({ role }: { role: StaffRole }) {
  const tone = ROLE_COLORS[role]

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
      {ROLE_LABELS[role]}
    </span>
  )
}

export function EmptyState({
  title,
  detail,
}: {
  title: string
  detail?: string
}) {
  return (
    <div style={styles.emptyState}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: detail ? 6 : 0 }}>{title}</div>
      {detail && <div style={{ opacity: 0.72 }}>{detail}</div>}
    </div>
  )
}

export function AdminHeader({
  title,
  role,
  clock,
  staffOnline,
  notifications,
  soundEnabled,
  onToggleSound,
  onFullscreen,
}: {
  title: string
  role: StaffRole
  clock: string
  staffOnline: boolean
  notifications: number
  soundEnabled: boolean
  onToggleSound: () => void
  onFullscreen: () => void
}) {
  return (
    <div style={styles.topHeader}>
      <div>
        <div style={{ color: "#8ba3b8", fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase" }}>
          Bunker SaaS Control
        </div>
        <h1 style={{ margin: "4px 0 0", fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.05 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <RoleBadge role={role} />
        <span style={{ ...styles.badge, color: staffOnline ? "#00ff99" : "#ffae00", border: `1px solid ${staffOnline ? "#00ff99" : "#ffae00"}`, background: staffOnline ? "rgba(0,255,153,.12)" : "rgba(255,174,0,.12)" }}>
          <span className="cyber-online-dot" style={{ width: 7, height: 7, borderRadius: 999, background: staffOnline ? "#00ff99" : "#ffae00", boxShadow: `0 0 12px ${staffOnline ? "#00ff99" : "#ffae00"}` }} />
          {staffOnline ? "ONLINE" : "STANDBY"}
        </span>
        <span style={{ ...styles.badge, color: "#d9fff8", border: "1px solid rgba(0,255,204,.22)", background: "rgba(0,255,204,.08)" }}>
          {clock || "--:--:--"}
        </span>
        <span style={{ ...styles.badge, color: notifications > 0 ? "#ffae00" : "#8ba3b8", border: "1px solid rgba(255,174,0,.22)", background: "rgba(255,174,0,.08)" }}>
          {notifications} notif
        </span>
        <button className="cyber-button" style={{ ...styles.button, margin: 0, padding: "8px 11px" }} onClick={onToggleSound}>
          Son {soundEnabled ? "ON" : "OFF"}
        </button>
        <button className="cyber-button" style={{ ...styles.button, margin: 0, padding: "8px 11px" }} onClick={onFullscreen}>
          Bunker plein ecran
        </button>
      </div>
    </div>
  )
}

const TOAST_TONES: Record<ToastMessage["tone"], { border: string; color: string; background: string }> = {
  info: { border: "#00ffcc", color: "#00ffcc", background: "rgba(0,255,204,.14)" },
  success: { border: "#00ff99", color: "#00ff99", background: "rgba(0,255,153,.14)" },
  warning: { border: "#ffae00", color: "#ffae00", background: "rgba(255,174,0,.14)" },
  danger: { border: "#ff3b5c", color: "#ff3b5c", background: "rgba(255,59,92,.16)" },
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage | null
  onClose: () => void
}) {
  if (!toast) return null

  const tone = TOAST_TONES[toast.tone]

  return (
    <div
      className="cyber-toast"
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 50,
        width: "min(360px, calc(100vw - 36px))",
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${tone.border}`,
        color: "#fff",
        background: "linear-gradient(135deg, rgba(8,16,24,.96), rgba(5,9,16,.94))",
        boxShadow: `0 20px 50px rgba(0,0,0,.35), 0 0 28px ${tone.background}`,
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ color: tone.color, fontWeight: "bold", marginBottom: 6 }}>
            {toast.title}
          </div>
          <div style={{ opacity: 0.86 }}>{toast.message}</div>
        </div>
        <button
          aria-label="Fermer notification"
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: tone.color,
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
            height: 24,
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
