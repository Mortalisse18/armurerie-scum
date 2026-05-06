import { ADMIN_MENU, styles } from "./styles"
import type { AdminTab } from "./types"

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
      style={{
        ...styles.sidebarButton,
        ...(active ? styles.sidebarButtonActive : {}),
      }}
      onClick={onClick}
    >
      <span>
        {icon} {label}
      </span>
      {!!notification && <span style={styles.sidebarBadge}>{notification}</span>}
    </button>
  )
}

export function Sidebar({
  tab,
  clock,
  pendingOrders,
  chatUnread,
  buybackUnread,
  onSelectTab,
  onLogout,
}: {
  tab: AdminTab
  clock: string
  pendingOrders: number
  chatUnread: number
  buybackUnread: number
  onSelectTab: (tab: AdminTab) => void
  onLogout: () => void
}) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>🩸 BUNKER ADMIN</div>
      <div style={styles.clock}>⏰ {clock}</div>

      {ADMIN_MENU.map((menu) => (
        <SidebarButton
          key={menu.key}
          icon={menu.icon}
          label={menu.label}
          active={tab === menu.key}
          notification={
            menu.key === "orders"
              ? pendingOrders
              : menu.key === "chat"
                ? chatUnread
                : menu.key === "buybacks"
                  ? buybackUnread
                  : 0
          }
          onClick={() => onSelectTab(menu.key)}
        />
      ))}

      <button style={styles.sidebarLogout} onClick={onLogout}>
        🚪 Logout
      </button>
    </aside>
  )
}
