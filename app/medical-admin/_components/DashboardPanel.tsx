import { ActionButton, medicalStyles } from "./ui"
import type { MedicalStats } from "./types"

export function DashboardPanel({
  stats,
  flash,
  status,
  role,
  shift,
  sound,
  staffName,
  onStaffNameChange,
  onShiftToggle,
  onSaveProfile,
  onFilterChange,
  onStatusToggle,
  onSoundToggle,
  onRoleToggle,
}: {
  stats: MedicalStats
  flash: boolean
  status: string
  role: string
  shift: string
  sound: boolean
  staffName: string
  onStaffNameChange: (value: string) => void
  onShiftToggle: () => void
  onSaveProfile: () => void
  onFilterChange: (value: string) => void
  onStatusToggle: () => void
  onSoundToggle: () => void
  onRoleToggle: () => void
}) {
  return (
    <div>
      <header style={{ ...medicalStyles.header, boxShadow: flash ? "0 0 25px rgba(239,68,68,.45)" : "none" }}>
        <div>
          <h1>🚑 TRAUMA TEAM ADMIN</h1>
          <p>Dispatch médical • Interventions live</p>
        </div>
        <div style={medicalStyles.statusBadge}>
          👨‍⚕️ {stats.online} Médics Online • {status} • {role}
        </div>
      </header>

      <div style={medicalStyles.stats}>
        <div style={medicalStyles.stat}>🚨 En attente: {stats.pendingCount}</div>
        <div style={medicalStyles.stat}>🚑 En cours: {stats.acceptedCount}</div>
        <div style={medicalStyles.stat}>✅ Terminées: {stats.completedCount}</div>
        <div style={medicalStyles.stat}>👨‍⚕️ Online: {stats.online}</div>
        <div style={medicalStyles.stat}>📅 Aujourd&apos;hui: {stats.todayCount}</div>
        <div style={medicalStyles.stat}>🔥 Zone chaude: {stats.topZone}</div>
      </div>

      <div style={medicalStyles.toolbar}>
        <input
          value={staffName}
          onChange={(event) => onStaffNameChange(event.target.value)}
          style={{ ...medicalStyles.input, maxWidth: 180, marginBottom: 0 }}
          placeholder="Nom staff"
        />
        <ActionButton secondary onClick={onShiftToggle}>
          🌗 {shift}
        </ActionButton>
        <ActionButton secondary onClick={onSaveProfile}>
          💾 Profil
        </ActionButton>
        <ActionButton onClick={() => onFilterChange("all")}>Tous</ActionButton>
        <ActionButton onClick={() => onFilterChange("grave")}>Graves</ActionButton>
        <ActionButton onClick={() => onFilterChange("light")}>Légers</ActionButton>
        <ActionButton onClick={onStatusToggle}>{status}</ActionButton>
        <ActionButton secondary onClick={onSoundToggle}>
          {sound ? "🔊 Son ON" : "🔇 Son OFF"}
        </ActionButton>
        <ActionButton secondary onClick={onRoleToggle}>
          {role}
        </ActionButton>
      </div>
    </div>
  )
}
