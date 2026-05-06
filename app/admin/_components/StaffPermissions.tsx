import { PERMISSION_KEYS, ROLE_COLORS, ROLE_LABELS, ROLE_OPTIONS } from "./permissions"
import { styles } from "./styles"
import type { AdminPermissionKey, StaffMember, StaffRole } from "./types"

const PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  dashboard: "Dashboard",
  orders: "Commandes",
  shop: "Boutique",
  promotions: "Promotions",
  banner: "Bannière",
  auction: "Enchères",
  rewards: "Réductions",
  buybacks: "Rachats",
  access: "Accès",
  staffChat: "Chat staff",
  logs: "Logs",
}

function RoleBadge({ role }: { role: StaffRole }) {
  const roleTheme = ROLE_COLORS[role]

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        color: roleTheme.color,
        background: roleTheme.background,
        border: `1px solid ${roleTheme.border}`,
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
      }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

export function StaffPermissions({
  staffMembers,
  newPseudo,
  newCode,
  newRole,
  canManageAccess,
  onPseudoChange,
  onCodeChange,
  onRoleChange,
  onSave,
  onRemove,
  onStaffRoleChange,
  onPermissionToggle,
}: {
  staffMembers: StaffMember[]
  newPseudo: string
  newCode: string
  newRole: StaffRole
  canManageAccess: boolean
  onPseudoChange: (value: string) => void
  onCodeChange: (value: string) => void
  onRoleChange: (value: StaffRole) => void
  onSave: () => void
  onRemove: (id: string) => void
  onStaffRoleChange: (id: string, role: StaffRole) => void
  onPermissionToggle: (id: string, permission: AdminPermissionKey, value: boolean) => void
}) {
  return (
    <div>
      <h1>👮 Gestion Staff & Permissions</h1>

      <div style={styles.card}>
        <div style={styles.inlineGrid}>
          <input style={styles.input} placeholder="Pseudo" value={newPseudo} onChange={(event) => onPseudoChange(event.target.value)} />
          <input style={styles.input} placeholder="Code accès" value={newCode} onChange={(event) => onCodeChange(event.target.value)} />
          <select style={styles.input} value={newRole} onChange={(event) => onRoleChange(event.target.value as StaffRole)}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button style={styles.button} onClick={onSave} disabled={!canManageAccess}>
          ➕ Ajouter membre staff
        </button>
      </div>

      <div style={styles.grid}>
        {staffMembers.map((member) => (
          <div key={member.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div>
                <b>{member.pseudo}</b>
                <div style={{ marginTop: 8 }}>
                  <RoleBadge role={member.role} />
                </div>
              </div>

              <select
                style={{ ...styles.input, width: 160, marginBottom: 0 }}
                value={member.role}
                disabled={!canManageAccess}
                onChange={(event) => onStaffRoleChange(member.id, event.target.value as StaffRole)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              {PERMISSION_KEYS.map((permission) => (
                <label
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 9,
                    borderRadius: 10,
                    border: "1px solid rgba(0,255,204,.12)",
                    background: member.permissions[permission] ? "rgba(0,255,204,.12)" : "rgba(255,255,255,.04)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={member.permissions[permission]}
                    disabled={!canManageAccess}
                    onChange={(event) => onPermissionToggle(member.id, permission, event.target.checked)}
                  />
                  {PERMISSION_LABELS[permission]}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.button} disabled={!canManageAccess} onClick={() => onRemove(member.id)}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
