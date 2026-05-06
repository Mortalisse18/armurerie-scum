import { medicalStyles, Panel } from "./ui"
import type { MedicalAlert } from "./types"

export function LogsPanel({ alerts }: { alerts: MedicalAlert[] }) {
  const history = alerts.filter((alert) => (alert.status || "pending") === "done").slice(0, 12)

  return (
    <div style={medicalStyles.grid}>
      <Panel title="📚 Historique">
        {history.length === 0 && <p>Aucun historique.</p>}
        {history.map((alert) => (
          <div key={alert.id} style={medicalStyles.item}>
            ✅ {alert.zone || "Zone inconnue"} terminée
          </div>
        ))}
      </Panel>
    </div>
  )
}
