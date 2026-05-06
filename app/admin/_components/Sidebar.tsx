import { ADMIN_MENU, styles } from "./styles"
import { canAccessTab, ROLE_COLORS, ROLE_LABELS } from "./permissions"
import type { AdminTab, StaffPermissions, StaffRole } from "./types"

function SidebarButton({
  icon,
  label,
  active,
  onClick,
  notification,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  notification?: number
}) {
  return (
    <button
      className="cyber-sidebar-button"
      style={{
        ...styles.sidebarButton,
        ...(active ? styles.sidebarButtonActive : {}),
      }}
      onClick={onClick}
    >
      {active && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -1,
            top: 10,
            bottom: 10,
            width: 3,
            borderRadius: 999,
            background: "#00ffcc",
            boxShadow: "0 0 16px rgba(0,255,204,.85)",
          }}
        />
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ width: 24, textAlign: "center", filter: active ? "drop-shadow(0 0 8px rgba(0,255,204,.7))" : undefined }}>
          {icon}
        </span>
        <span>{label}</span>
      </span>
      {!!notification && <span style={styles.sidebarBadge}>{notification}</span>}
    </button>
  )
}

export function Sidebar({
  tab,
  clock,
  ordersUnread,
  chatUnread,
  buybackUnread,
  role,
  permissions,
  onSelectTab,
  onLogout,
}: {
  tab: AdminTab
  clock: string
  ordersUnread: number
  chatUnread: number
  buybackUnread: number
  role: StaffRole
  permissions: StaffPermissions
  onSelectTab: (tab: AdminTab) => void
  onLogout: () => void
}) {
  const roleTheme = ROLE_COLORS[role]

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>BUNKER ADMIN</div>
      <div style={{ color: "#8ba3b8", fontSize: 12, fontWeight: 800, marginTop: -8, marginBottom: 14, letterSpacing: 1 }}>
        CYBER SAAS CONTROL
      </div>
      <div
        style={{
          display: "inline-flex",
          padding: "5px 10px",
          borderRadius: 999,
          marginBottom: 12,
          color: roleTheme.color,
          background: roleTheme.background,
          border: `1px solid ${roleTheme.border}`,
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 1,
          boxShadow: "0 0 20px rgba(0,255,204,.08)",
        }}
      >
        {ROLE_LABELS[role]}
      </div>
      <div style={styles.clock}>Live {clock || "--:--:--"}</div>

      <nav style={{ display: "grid", gap: 2 }}>
        {ADMIN_MENU.filter((menu) => canAccessTab(permissions, menu.key)).map((menu) => (
          <SidebarButton
            key={menu.key}
            icon={menu.icon}
            label={menu.label}
            active={tab === menu.key}
            notification={
              menu.key === "orders"
                ? ordersUnread
                : menu.key === "chat"
                  ? chatUnread
                  : menu.key === "buybacks"
                    ? buybackUnread
                    : 0
            }
            onClick={() => onSelectTab(menu.key)}
          />
        ))}
      </nav>

      <button className="cyber-button" style={styles.sidebarLogout} onClick={onLogout}>
        Logout
      </button>
    </aside>
  )
}
