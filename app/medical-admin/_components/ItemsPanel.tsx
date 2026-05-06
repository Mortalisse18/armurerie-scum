import { ActionButton, medicalStyles, Panel } from "./ui"

export function ItemsPanel({
  ambulance,
  gpsMode,
  zoom,
  mapOffset,
  shift,
  onAmbulanceChange,
  onGpsToggle,
  onResetMap,
}: {
  ambulance: string
  gpsMode: boolean
  zoom: number
  mapOffset: number
  shift: string
  onAmbulanceChange: (name: string) => void
  onGpsToggle: () => void
  onResetMap: () => void
}) {
  return (
    <div style={medicalStyles.grid}>
      <Panel title="🚑 Unités & Matériel">
        <div style={medicalStyles.item}>Ambulance active: {ambulance}</div>
        <div style={medicalStyles.item}>GPS: {gpsMode ? "LIVE" : "OFF"}</div>
        <div style={medicalStyles.item}>Shift: {shift}</div>
        <div style={medicalStyles.item}>Map zoom: {zoom.toFixed(1)} • Offset: {mapOffset}</div>

        <ActionButton onClick={() => onAmbulanceChange("Alpha")}>Alpha</ActionButton>
        <ActionButton onClick={() => onAmbulanceChange("Bravo")}>Bravo</ActionButton>
        <ActionButton onClick={() => onAmbulanceChange("Charlie")}>Charlie</ActionButton>
        <ActionButton secondary onClick={onGpsToggle}>{gpsMode ? "📡 GPS ON" : "📡 GPS OFF"}</ActionButton>
        <ActionButton secondary onClick={onResetMap}>♻️ Reset Map</ActionButton>
      </Panel>
    </div>
  )
}
