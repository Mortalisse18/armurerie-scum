import { medicalStyles, Panel } from "./ui"
import type { MedicalAlert } from "./types"

export function BuybackPanel({ alerts }: { alerts: MedicalAlert[] }) {
  const completed = alerts.filter((alert) => (alert.status || "pending") === "done")

  return (
    <div style={medicalStyles.grid}>
      <Panel title="♻️ Récupérations & Interventions Clôturées">
        {completed.length === 0 && <p>Aucune intervention clôturée.</p>}
        {completed.map((alert) => (
          <div key={alert.id} style={medicalStyles.item}>
            ✅ {alert.zone || "Zone inconnue"} • {alert.type || "SOS"} • {alert.severity || "light"}
          </div>
        ))}
      </Panel>
    </div>
  )
}
