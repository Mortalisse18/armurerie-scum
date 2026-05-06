/* eslint-disable @typescript-eslint/no-explicit-any */

import { styles } from "./styles"

export function StaffPermissions({
  adminUsers,
  newPseudo,
  newCode,
  newRole,
  onPseudoChange,
  onCodeChange,
  onRoleChange,
  onSave,
  onRemove,
}: {
  adminUsers: any[]
  newPseudo: string
  newCode: string
  newRole: string
  onPseudoChange: (value: string) => void
  onCodeChange: (value: string) => void
  onRoleChange: (value: string) => void
  onSave: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div>
      <h1>👮 Gestion Staff & Permissions</h1>

      <div style={styles.card}>
        <input style={styles.input} placeholder="Pseudo" value={newPseudo} onChange={(event) => onPseudoChange(event.target.value)} />
        <input style={styles.input} placeholder="Code accès" value={newCode} onChange={(event) => onCodeChange(event.target.value)} />
        <select style={styles.input} value={newRole} onChange={(event) => onRoleChange(event.target.value)}>
          <option value="moderator">Modérateur</option>
          <option value="admin">Admin</option>
          <option value="superadmin">SuperAdmin</option>
        </select>

        <button style={styles.button} onClick={onSave}>
          ➕ Ajouter membre staff
        </button>
      </div>

      {adminUsers.map((user: any) => (
        <div key={user.id} style={styles.card}>
          <b>{user.pseudo}</b> — {user.role}

          <div style={{ marginTop: 10 }}>
            <button style={styles.button} onClick={() => onRemove(user.id)}>
              🗑 Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
