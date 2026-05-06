import { medicalStyles } from "./ui"
import type { MedicalTab } from "./types"

const MENU: { key: MedicalTab; icon: string; label: string }[] = [
  { key: "dashboard", icon: "📊", label: "Dashboard" },
  { key: "orders", icon: "🚨", label: "Orders" },
  { key: "items", icon: "🚑", label: "Items" },
  { key: "buyback", icon: "♻️", label: "Buyback" },
  { key: "logs", icon: "📚", label: "Logs" },
  { key: "chat", icon: "💬", label: "Chat" },
  { key: "users", icon: "👨‍⚕️", label: "Users" },
]

export function Sidebar({
  activeTab,
  pendingCount,
  staffName,
  status,
  onSelect,
}: {
  activeTab: MedicalTab
  pendingCount: number
  staffName: string
  status: string
  onSelect: (tab: MedicalTab) => void
}) {
  return (
    <aside style={medicalStyles.sidebar}>
      <div style={medicalStyles.brand}>🚑 TRAUMA TEAM</div>
      <div style={medicalStyles.sidebarMeta}>
        {staffName} • {status}
      </div>

      {MENU.map((item) => (
        <button
          key={item.key}
          style={{
            ...medicalStyles.navButton,
            ...(activeTab === item.key ? medicalStyles.navButtonActive : {}),
          }}
          onClick={() => onSelect(item.key)}
        >
          <span>
            {item.icon} {item.label}
          </span>
          {item.key === "orders" && pendingCount > 0 && <span style={medicalStyles.badge}>{pendingCount}</span>}
        </button>
      ))}
    </aside>
  )
}
