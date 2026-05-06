import { ActionButton, medicalStyles, Panel } from "./ui"
import type { MedicalAlert } from "./types"

export function OrdersPanel({
  alerts,
  filteredAlerts,
  livePins,
  selectedAlert,
  zoom,
  mapOffset,
  gpsMode,
  ambulance,
  now,
  onSelectAlert,
  onAccept,
  onAssign,
  onFinish,
  onDelete,
  onZoomOut,
  onZoomIn,
  onMoveLeft,
  onMoveRight,
  onResetMap,
  onGpsToggle,
  onAmbulanceChange,
}: {
  alerts: MedicalAlert[]
  filteredAlerts: MedicalAlert[]
  livePins: MedicalAlert[]
  selectedAlert: MedicalAlert | null
  zoom: number
  mapOffset: number
  gpsMode: boolean
  ambulance: string
  now: number
  onSelectAlert: (alert: MedicalAlert) => void
  onAccept: (id: string) => void
  onAssign: (zone: string) => void
  onFinish: (id: string) => void
  onDelete: (id: string) => void
  onZoomOut: () => void
  onZoomIn: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onResetMap: () => void
  onGpsToggle: () => void
  onAmbulanceChange: (name: string) => void
}) {
  return (
    <div style={medicalStyles.grid}>
      <Panel title="🗺 Carte Interventions SCUM • ZOOM PRO">
        <div
          style={{
            ...medicalStyles.map,
            transform: `scale(${zoom}) translateX(${mapOffset}px)`,
            transformOrigin: "center center",
          }}
        >
          <MapGrid />
          {livePins.map((pin, index) => (
            <div
              key={pin.id}
              onClick={() => onSelectAlert(pin)}
              style={{
                position: "absolute",
                top: `${pin.mapY ?? 14 + index * 11}%`,
                left: `${pin.mapX ?? 18 + (index % 4) * 18}%`,
                padding: "6px 8px",
                background: (pin.severity || "light") === "grave" ? "#b91c1c" : "#dc2626",
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              📍 {pin.zone || `Z${index}`}
            </div>
          ))}
          <div style={{ position: "absolute", right: 12, bottom: 12, padding: "8px 10px", background: "#111827", border: "1px solid #60a5fa", borderRadius: 10 }}>
            🚑 Ambulance {ambulance}
          </div>
          <div style={{ position: "absolute", left: 12, bottom: 12, padding: "8px 10px", background: "#111827", border: "1px solid #22c55e", borderRadius: 10 }}>
            {gpsMode ? "📡 GPS LIVE" : "📡 GPS OFF"}
          </div>
          {selectedAlert && (
            <div style={{ position: "absolute", top: 12, right: 12, padding: "10px 12px", background: "rgba(0,0,0,.85)", border: "1px solid #ef4444", borderRadius: 10, minWidth: 180 }}>
              <b>🚨 {selectedAlert.zone || "Zone"}</b>
              <div>Statut: {selectedAlert.status || "pending"}</div>
              <div>Priorité: {selectedAlert.severity || "light"}</div>
              <div>ETA 🚑 3 min</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionButton secondary onClick={onZoomOut}>➖ Zoom</ActionButton>
          <ActionButton secondary onClick={onZoomIn}>➕ Zoom</ActionButton>
          <ActionButton secondary onClick={onMoveLeft}>⬅️</ActionButton>
          <ActionButton secondary onClick={onMoveRight}>➡️</ActionButton>
          <ActionButton secondary onClick={onResetMap}>♻️ Reset</ActionButton>
          <ActionButton secondary onClick={onGpsToggle}>{gpsMode ? "📡 GPS ON" : "📡 GPS OFF"}</ActionButton>
          <ActionButton onClick={() => onAmbulanceChange("Alpha")}>Alpha</ActionButton>
          <ActionButton onClick={() => onAmbulanceChange("Bravo")}>Bravo</ActionButton>
          <ActionButton onClick={() => onAmbulanceChange("Charlie")}>Charlie</ActionButton>
        </div>
      </Panel>

      <Panel title={`🚨 SOS Entrants (${filteredAlerts.length})`}>
        {alerts.length === 0 && <p>Aucune alerte</p>}
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              ...medicalStyles.item,
              borderColor: (alert.severity || "light") === "grave" ? "#ff4d4d" : "rgba(255,255,255,.1)",
            }}
          >
            <b>{alert.type || "SOS"}</b> • {alert.status || "pending"}
            <div>
              📍 {alert.zone || "Inconnue"} • ⏱ {now && alert.createdAt ? Math.floor((now - alert.createdAt) / 60000) : 0} min
            </div>
            <div style={{ marginTop: 8 }}>
              <ActionButton onClick={() => onAccept(alert.id)}>Accepter</ActionButton>
              <ActionButton secondary onClick={() => onAssign(alert.zone || "Mission")}>Assigner</ActionButton>
              <ActionButton onClick={() => onFinish(alert.id)}>Terminer</ActionButton>
              <ActionButton secondary onClick={() => onDelete(alert.id)}>Supprimer</ActionButton>
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="📋 Missions en cours / Dispatch">
        {alerts
          .filter((alert) => (alert.status || "pending") === "accepted")
          .map((alert) => (
            <div key={alert.id} style={medicalStyles.item}>
              <b>{alert.zone || "Zone inconnue"}</b> • 🚑 {ambulance}
            </div>
          ))}
      </Panel>
    </div>
  )
}

function MapGrid() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "12.5% 12.5%",
        }}
      />
      {["A", "B", "C", "D", "E", "F", "G", "H"].map((label, index) => (
        <div key={label} style={{ position: "absolute", top: 4, left: `${index * 12.5 + 6}%`, transform: "translateX(-50%)", fontSize: 11, fontWeight: "bold", background: "rgba(0,0,0,.55)", padding: "2px 4px", borderRadius: 6 }}>
          {label}
        </div>
      ))}
      {["1", "2", "3", "4", "5", "6", "7", "8"].map((label, index) => (
        <div key={label} style={{ position: "absolute", left: 4, top: `${index * 12.5 + 6}%`, transform: "translateY(-50%)", fontSize: 11, fontWeight: "bold", background: "rgba(0,0,0,.55)", padding: "2px 4px", borderRadius: 6 }}>
          {label}
        </div>
      ))}
    </>
  )
}
