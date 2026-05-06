"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { BuybackPanel } from "./_components/BuybackPanel"
import { ChatPanel } from "./_components/ChatPanel"
import { DashboardPanel } from "./_components/DashboardPanel"
import { ItemsPanel } from "./_components/ItemsPanel"
import { LogsPanel } from "./_components/LogsPanel"
import { OrdersPanel } from "./_components/OrdersPanel"
import { Sidebar } from "./_components/Sidebar"
import { UsersPanel } from "./_components/UsersPanel"
import { medicalStyles } from "./_components/ui"
import type { MedicalAlert, MedicalChatMessage, MedicalTab } from "./_components/types"

export default function MedicalAdminPage() {
  const [alerts, setAlerts] = useState<MedicalAlert[]>([])
  const [chat, setChat] = useState<MedicalChatMessage[]>([])
  const [msg, setMsg] = useState("")
  const [online] = useState(3)
  const [filter, setFilter] = useState("all")
  const [status, setStatus] = useState("Disponible")
  const [flash, setFlash] = useState(false)
  const [ambulance, setAmbulance] = useState("Alpha")
  const [sound, setSound] = useState(true)
  const [role, setRole] = useState("Chef")
  const [staffName, setStaffName] = useState("Medic-01")
  const [shift, setShift] = useState("Jour")
  const [zoom, setZoom] = useState(1)
  const [mapOffset, setMapOffset] = useState(0)
  const [gpsMode, setGpsMode] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<MedicalAlert | null>(null)
  const [activeTab, setActiveTab] = useState<MedicalTab>("dashboard")
  const [now, setNow] = useState(0)

  useEffect(() => {
    const alertsQuery = query(collection(db, "medicalAlerts"), orderBy("createdAt", "desc"))
    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const data = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })) as MedicalAlert[]
      setAlerts(data)

      if (data.some((alert) => (alert.status || "pending") === "pending")) {
        setFlash((value) => !value)
        if (sound && typeof window !== "undefined") {
          try {
            new Audio("/alert.mp3").play()
          } catch {
            // Audio autoplay can be blocked by the browser.
          }
        }
      }
    })

    const chatQuery = query(collection(db, "medicalChat"), orderBy("createdAt", "asc"))
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      setChat(snapshot.docs.map((entry) => entry.data()) as MedicalChatMessage[])
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeChat()
    }
  }, [sound])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  async function acceptMission(id: string) {
    await updateDoc(doc(db, "medicalAlerts", id), { status: "accepted" })
  }

  async function deleteMission(id: string) {
    await deleteDoc(doc(db, "medicalAlerts", id))
  }

  async function finishMission(id: string) {
    await updateDoc(doc(db, "medicalAlerts", id), { status: "done" })
  }

  async function saveProfile() {
    await setDoc(doc(db, "medicalStaff", staffName), {
      name: staffName,
      role,
      status,
      shift,
      updatedAt: Date.now(),
    })
  }

  async function send() {
    if (!msg.trim()) return
    await addDoc(collection(db, "medicalChat"), {
      user: "Medic",
      text: msg,
      createdAt: Date.now(),
    })
    setMsg("")
  }

  const stats = useMemo(() => {
    const completedCount = alerts.filter((alert) => (alert.status || "pending") === "done").length
    const pendingCount = alerts.filter((alert) => (alert.status || "pending") === "pending").length
    const acceptedCount = alerts.filter((alert) => (alert.status || "pending") === "accepted").length
    const todayCount = alerts.filter((alert) => new Date(alert.createdAt || 0).toDateString() === new Date().toDateString()).length
    const zones: Record<string, number> = {}
    alerts.forEach((alert) => {
      const zone = alert.zone || "Inconnue"
      zones[zone] = (zones[zone] || 0) + 1
    })
    const topZone = Object.entries(zones).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Aucune"

    return { completedCount, pendingCount, acceptedCount, todayCount, topZone, online }
  }, [alerts, online])

  const filteredAlerts = useMemo(
    () => alerts.filter((alert) => (filter === "all" ? true : (alert.severity || "light") === filter)),
    [alerts, filter],
  )

  const livePins = useMemo(
    () => alerts.filter((alert) => (alert.status || "pending") !== "done").slice(0, 6),
    [alerts],
  )

  function resetMap() {
    setZoom(1)
    setMapOffset(0)
  }

  return (
    <main style={medicalStyles.page}>
      <Sidebar
        activeTab={activeTab}
        pendingCount={stats.pendingCount}
        staffName={staffName}
        status={status}
        onSelect={setActiveTab}
      />

      <section style={medicalStyles.content}>
        {activeTab === "dashboard" && (
          <DashboardPanel
            stats={stats}
            flash={flash}
            status={status}
            role={role}
            shift={shift}
            sound={sound}
            staffName={staffName}
            onStaffNameChange={setStaffName}
            onShiftToggle={() => setShift(shift === "Jour" ? "Nuit" : "Jour")}
            onSaveProfile={saveProfile}
            onFilterChange={setFilter}
            onStatusToggle={() => setStatus(status === "Disponible" ? "Occupé" : "Disponible")}
            onSoundToggle={() => setSound(!sound)}
            onRoleToggle={() => setRole(role === "Chef" ? "Médecin" : "Chef")}
          />
        )}

        {activeTab === "orders" && (
          <OrdersPanel
            alerts={alerts}
            filteredAlerts={filteredAlerts}
            livePins={livePins}
            selectedAlert={selectedAlert}
            zoom={zoom}
            mapOffset={mapOffset}
            gpsMode={gpsMode}
            ambulance={ambulance}
            now={now}
            onSelectAlert={setSelectedAlert}
            onAccept={acceptMission}
            onAssign={setAmbulance}
            onFinish={finishMission}
            onDelete={deleteMission}
            onZoomOut={() => setZoom(Math.max(0.8, zoom - 0.1))}
            onZoomIn={() => setZoom(Math.min(2, zoom + 0.1))}
            onMoveLeft={() => setMapOffset(mapOffset - 20)}
            onMoveRight={() => setMapOffset(mapOffset + 20)}
            onResetMap={resetMap}
            onGpsToggle={() => setGpsMode(!gpsMode)}
            onAmbulanceChange={setAmbulance}
          />
        )}

        {activeTab === "items" && (
          <ItemsPanel
            ambulance={ambulance}
            gpsMode={gpsMode}
            zoom={zoom}
            mapOffset={mapOffset}
            shift={shift}
            onAmbulanceChange={setAmbulance}
            onGpsToggle={() => setGpsMode(!gpsMode)}
            onResetMap={resetMap}
          />
        )}

        {activeTab === "buyback" && <BuybackPanel alerts={alerts} />}

        {activeTab === "logs" && <LogsPanel alerts={alerts} />}

        {activeTab === "chat" && <ChatPanel chat={chat} msg={msg} onMessageChange={setMsg} onSend={send} />}

        {activeTab === "users" && (
          <UsersPanel
            staffName={staffName}
            role={role}
            status={status}
            shift={shift}
            online={online}
            onStaffNameChange={setStaffName}
            onRoleToggle={() => setRole(role === "Chef" ? "Médecin" : "Chef")}
            onStatusToggle={() => setStatus(status === "Disponible" ? "Occupé" : "Disponible")}
            onShiftToggle={() => setShift(shift === "Jour" ? "Nuit" : "Jour")}
            onSaveProfile={saveProfile}
          />
        )}
      </section>
    </main>
  )
}
