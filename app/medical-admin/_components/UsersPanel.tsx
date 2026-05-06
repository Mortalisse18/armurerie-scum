import { ActionButton, medicalStyles, Panel } from "./ui"

export function UsersPanel({
  staffName,
  role,
  status,
  shift,
  online,
  onStaffNameChange,
  onRoleToggle,
  onStatusToggle,
  onShiftToggle,
  onSaveProfile,
}: {
  staffName: string
  role: string
  status: string
  shift: string
  online: number
  onStaffNameChange: (value: string) => void
  onRoleToggle: () => void
  onStatusToggle: () => void
  onShiftToggle: () => void
  onSaveProfile: () => void
}) {
  return (
    <div style={medicalStyles.grid}>
      <Panel title="👨‍⚕️ Staff & Permissions">
        <input value={staffName} onChange={(event) => onStaffNameChange(event.target.value)} style={medicalStyles.input} placeholder="Nom staff" />
        <div style={medicalStyles.item}>{staffName} • {role} • {status} • {shift}</div>
        <div style={medicalStyles.item}>Médics online: {online}</div>
        <ActionButton secondary onClick={onRoleToggle}>{role}</ActionButton>
        <ActionButton onClick={onStatusToggle}>{status}</ActionButton>
        <ActionButton secondary onClick={onShiftToggle}>🌗 {shift}</ActionButton>
        <ActionButton secondary onClick={onSaveProfile}>💾 Profil</ActionButton>
      </Panel>

      <Panel title="🏆 Leaderboard Staff">
        <div style={medicalStyles.item}>{staffName} • {role} • {status}</div>
      </Panel>
    </div>
  )
}
