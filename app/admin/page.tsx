"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { db, storage } from "@/lib/firebase"
import { addLog, deleteOrder, getLogs, getOrders, updateOrderStatus } from "@/lib/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { Auction, Banner, Promotions, Rewards } from "./_components/Operations"
import { Buybacks } from "./_components/Buybacks"
import { Catalog } from "./_components/Catalog"
import { Chat } from "./_components/Chat"
import { Dashboard } from "./_components/Dashboard"
import { Logs } from "./_components/Logs"
import { Orders } from "./_components/Orders"
import { Sidebar } from "./_components/Sidebar"
import { StaffPermissions } from "./_components/StaffPermissions"
import { SAAS_THEME, styles } from "./_components/styles"
import type { AdminTab, BuybackMetrics, OrderStatus } from "./_components/types"

export default function AdminPage() {
  const [authOk, setAuthOk] = useState(false)
  const [login, setLogin] = useState("")
  const [pass, setPass] = useState("")
  const [tab, setTab] = useState<AdminTab>("dashboard")

  const [orders, setOrders] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [buybacks, setBuybacks] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])

  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promo, setPromo] = useState(10)
  const [editId, setEditId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState("")
  const [buybackLimit, setBuybackLimit] = useState("3")
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [notif, setNotif] = useState("")
  const [lastPending, setLastPending] = useState(0)
  const [clock, setClock] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [itemFileUploading, setItemFileUploading] = useState(false)
  const [newPseudo, setNewPseudo] = useState("")
  const [newCode, setNewCode] = useState("")
  const [newRole, setNewRole] = useState("moderator")
  const [userRole, setUserRole] = useState("guest")
  const [currentUser, setCurrentUser] = useState("")
  const [auctionItem, setAuctionItem] = useState("")
  const [auctionStep, setAuctionStep] = useState("100")
  const [auctionStart, setAuctionStart] = useState("1000")
  const [rewardOrders, setRewardOrders] = useState("5")
  const [rewardPercent, setRewardPercent] = useState("10")
  const [chatText, setChatText] = useState("")
  const [chatUnread, setChatUnread] = useState(0)
  const [staffOnline, setStaffOnline] = useState(false)
  const [replyTarget, setReplyTarget] = useState("")
  const [replyText, setReplyText] = useState("")
  const [buybackFilter, setBuybackFilter] = useState("all")
  const [buybackUnread, setBuybackUnread] = useState(0)
  const [lastBuybackCount, setLastBuybackCount] = useState(0)

  async function logAction(message: string) {
    await addLog(`${currentUser || "SYSTEM"} • ${message}`)
  }

  async function loadAdmins() {
    const snap = await getDocs(collection(db, "admins"))
    setAdminUsers(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
  }

  async function loadAll() {
    const allOrders = (await getOrders()) || []
    setOrders(allOrders)

    const allLogs = (await getLogs()) || []
    setLogs(allLogs)

    const pendingCount = allOrders.filter((order: any) => (order.status || "pending") === "pending").length
    if (pendingCount > lastPending && lastPending > 0) {
      setNotif("🔔 Nouvelle commande reçue !")
      setTimeout(() => setNotif(""), 5000)
    }
    setLastPending(pendingCount)

    const weaponSnap = await getDocs(collection(db, "weapons"))
    const weaponItems = weaponSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
    setItems(weaponItems)

    const promoRef = await getDoc(doc(db, "settings", "promo"))
    if (promoRef.exists()) {
      const data: any = promoRef.data()
      setPromoEnabled(Boolean(data.enabled))
      setPromo(Number(data.percent || 10))
    }

    const bannerRef = await getDoc(doc(db, "settings", "banner"))
    if (bannerRef.exists()) {
      setBannerUrl(bannerRef.data().url || "")
    }

    await loadAdmins()

    const chatSnap = await getDocs(collection(db, "staffChat"))
    setChatMessages(chatSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })).slice(-20))

    const auctionRef = await getDoc(doc(db, "settings", "auction"))
    if (auctionRef.exists()) {
      const data: any = auctionRef.data()
      setAuctionItem(data.item || "")
      setAuctionStep(String(data.step || 100))
      setAuctionStart(String(data.start || 1000))
    }

    const rewardsRef = await getDoc(doc(db, "settings", "rewards"))
    if (rewardsRef.exists()) {
      const data: any = rewardsRef.data()
      setRewardOrders(String(data.orders || 5))
      setRewardPercent(String(data.percent || 10))
    }

    const buybackSnap = await getDocs(collection(db, "buybackRequests"))
    const liveBuybacks = buybackSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
    liveBuybacks.sort((a: any, b: any) => sortBuybacks(a, b, weaponItems))
    setBuybacks(liveBuybacks)

    const pendingBuybacks = liveBuybacks.filter((entry: any) => entry.status === "pending").length
    if (pendingBuybacks > lastBuybackCount && lastBuybackCount > 0) {
      setNotif("🔔 Nouvelle demande de rachat !")
      if (tab !== "buybacks") setBuybackUnread((value) => value + 1)
    }
    setLastBuybackCount(pendingBuybacks)
  }

  useEffect(() => {
    loadAdmins()
    if (localStorage.getItem("admin-auth") === "ok") {
      setUserRole(localStorage.getItem("admin-role") || "guest")
      setCurrentUser(localStorage.getItem("admin-user") || "")
      setAuthOk(true)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString("fr-FR")), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!authOk) return

    loadAll()
    const timer = setInterval(loadAll, 5000)
    const chatQuery = query(collection(db, "staffChat"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(chatQuery, (snap) => {
      const messages = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })).slice(-30)
      setChatMessages(messages)
      setStaffOnline(messages.some((message: any) => message.role !== "joueur" && Date.now() - Number(message.createdAt || 0) < 300000))
      if (tab !== "chat" && messages.length > chatMessages.length) setChatUnread((value) => value + 1)
    })

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [authOk, tab])

  function connect() {
    const found = adminUsers.find((user: any) => user.pseudo === login && user.code === pass)
    if ((login === "admin" && pass === "Armory781228") || found) {
      const role = found?.role || (login === "admin" ? "superadmin" : "admin")
      localStorage.setItem("admin-auth", "ok")
      localStorage.setItem("admin-role", role)
      localStorage.setItem("admin-user", login)
      setUserRole(role)
      setCurrentUser(login)
      setAuthOk(true)
    } else {
      alert("Accès refusé")
    }
  }

  function logout() {
    localStorage.removeItem("admin-auth")
    localStorage.removeItem("admin-role")
    localStorage.removeItem("admin-user")
    location.reload()
  }

  function selectTab(nextTab: AdminTab) {
    setTab(nextTab)
    if (nextTab === "chat") setChatUnread(0)
    if (nextTab === "buybacks") setBuybackUnread(0)
  }

  async function saveAdminUser() {
    if (userRole === "moderator") return alert("Accès refusé")
    if (!newPseudo || !newCode) return
    await addDoc(collection(db, "admins"), { pseudo: newPseudo, code: newCode, role: newRole })
    setNewPseudo("")
    setNewCode("")
    setNewRole("moderator")
    await logAction("Compte admin/mod ajouté")
    loadAll()
  }

  async function removeAdminUser(id: string) {
    if (userRole !== "superadmin") return alert("Accès refusé")
    const target = adminUsers.find((user: any) => user.id === id)
    if (target?.pseudo === "admin") return alert("Compte protégé")
    await deleteDoc(doc(db, "admins", id))
    await logAction("Compte admin/mod supprimé")
    loadAll()
  }

  async function updateOrder(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status as any)
    await logAction(`Commande passée en ${status}`)
    loadAll()
  }

  async function removeOrder(id: string) {
    await deleteOrder(id)
    await logAction("Commande supprimée")
    loadAll()
  }

  async function saveAuction() {
    await setDoc(doc(db, "settings", "auction"), { item: auctionItem, step: Number(auctionStep), start: Number(auctionStart) })
    await logAction("Enchères modifiées")
  }

  async function saveRewards() {
    await setDoc(doc(db, "settings", "rewards"), { orders: Number(rewardOrders), percent: Number(rewardPercent) })
    await logAction("Récompenses modifiées")
  }

  async function sendPrivateReply() {
    if (!replyTarget || !replyText.trim()) return
    await addDoc(collection(db, "privateReplies"), {
      pseudo: replyTarget,
      message: replyText.trim().slice(0, 300),
      admin: currentUser || "admin",
      createdAt: Date.now(),
      read: false,
    })
    setReplyText("")
    setReplyTarget("")
    alert("Réponse privée envoyée")
  }

  async function sendChat() {
    if (!chatText.trim()) return
    await addDoc(collection(db, "staffChat"), {
      user: currentUser || "Staff",
      role: userRole,
      text: chatText.trim().slice(0, 300),
      createdAt: Date.now(),
    })
    setChatText("")
    loadAll()
  }

  async function uploadBanner(file: File) {
    try {
      setUploading(true)
      const fileRef = ref(storage, `banners/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      await setDoc(doc(db, "settings", "banner"), { url })
      setBannerUrl(url)
      await logAction("Bannière modifiée")
    } finally {
      setUploading(false)
    }
  }

  async function deleteBanner() {
    await setDoc(doc(db, "settings", "banner"), { url: "" })
    setBannerUrl("")
    await logAction("Bannière supprimée")
  }

  async function uploadItemImage(file: File) {
    try {
      setItemFileUploading(true)
      const fileRef = ref(storage, `weapons/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      setImage(url)
    } finally {
      setItemFileUploading(false)
    }
  }

  async function savePromo() {
    await setDoc(doc(db, "settings", "promo"), { enabled: promoEnabled, percent: promo })
    await logAction("Promo modifiée")
    alert("Promo sauvegardée")
  }

  function resetForm() {
    setEditId("")
    setName("")
    setPrice("")
    setCategory("")
    setImage("")
    setStock("")
    setBuybackLimit("3")
  }

  async function saveItem() {
    const payload = {
      name,
      price: Number(price),
      category,
      image,
      stock: Number(stock),
      buybackLimit: Number(buybackLimit || 3),
    }

    if (editId) {
      await updateDoc(doc(db, "weapons", editId), payload)
      await logAction("Item modifié")
    } else {
      await addDoc(collection(db, "weapons"), payload)
      await logAction("Item ajouté")
    }

    resetForm()
    loadAll()
  }

  function editItem(item: any) {
    setEditId(item.id)
    setName(item.name)
    setPrice(String(item.price))
    setCategory(item.category)
    setImage(item.image)
    setStock(String(item.stock))
    setBuybackLimit(String(item.buybackLimit || 3))
  }

  async function removeItem(id: string) {
    await deleteDoc(doc(db, "weapons", id))
    await logAction("Item supprimé")
    loadAll()
  }

  async function updateBuyback(id: string, status: "accepted" | "refused") {
    await updateDoc(doc(db, "buybackRequests", id), { status })
    await logAction(status === "accepted" ? "Rachat accepté" : "Rachat refusé")
    loadAll()
  }

  async function deleteBuyback(id: string) {
    await deleteDoc(doc(db, "buybackRequests", id))
    await logAction("Rachat supprimé")
    loadAll()
  }

  async function clearFinishedBuybacks() {
    const finished = buybacks.filter((buyback: any) => buyback.status === "accepted" || buyback.status === "refused")
    for (const buyback of finished) {
      await deleteDoc(doc(db, "buybackRequests", buyback.id))
    }
    await logAction("Rachats terminés vidés")
    loadAll()
  }

  const stats = useMemo(() => {
    const totalMoney = orders.reduce((sum, order: any) => sum + Number(order.total || 0), 0)
    const pending = orders.filter((order: any) => (order.status || "pending") === "pending").length
    return { totalMoney, pending }
  }, [orders])

  const categories = useMemo(() => [...new Set(items.map((item: any) => item.category).filter(Boolean))] as string[], [items])

  const filteredItems = useMemo(
    () =>
      items.filter((item: any) => {
        const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase())
        const stockValue = Number(item.stock || 0)
        const matchStock =
          stockFilter === "all"
            ? true
            : stockFilter === "rupture"
              ? stockValue === 0
              : stockFilter === "faible"
                ? stockValue > 0 && stockValue <= 3
                : stockValue > 3
        const matchCategory = categoryFilter === "all" ? true : item.category === categoryFilter
        return matchSearch && matchStock && matchCategory
      }),
    [items, search, stockFilter, categoryFilter],
  )

  const topClient = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((order: any) => {
      const name = order.playerName || order.pseudo || order.user || "Inconnu"
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Aucun"
  }, [orders])

  const todayOrders = useMemo(
    () =>
      orders.filter((order: any) => {
        try {
          const date = new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt)
          return date.toDateString() === new Date().toDateString()
        } catch {
          return false
        }
      }).length,
    [orders],
  )

  const buybackMetrics = useMemo<BuybackMetrics>(() => {
    const accepted = buybacks.filter((buyback: any) => buyback.status === "accepted")
    const totalPaid = accepted.reduce((sum: number, buyback: any) => {
      const match: any = items.find((item: any) => item.name?.toLowerCase() === String(buyback.item || "").toLowerCase()) || {}
      return sum + Math.round(Number(match.price || 0) * 0.5 * Number(buyback.quantity || 0))
    }, 0)
    const topItem = topBy(accepted, (buyback: any) => buyback.item, (buyback: any) => Number(buyback.quantity || 0))
    const topSupplier = topBy(accepted, (buyback: any) => buyback.pseudo, () => 1)
    return { totalPaid, topItem, topSupplier }
  }, [buybacks, items])

  const criticalStock = items.filter((item: any) => Number(item.stock) <= 3).length

  function stockBadge(value: number) {
    if (value === 0) return "Rupture"
    if (value <= 3) return "Faible"
    return "OK"
  }

  if (!authOk) {
    return (
      <main style={styles.loginPage}>
        <div style={styles.card}>
          <h1>🔐 Admin</h1>
          <input style={styles.input} placeholder="Login" value={login} onChange={(event) => setLogin(event.target.value)} />
          <input style={styles.input} type="password" placeholder="Code" value={pass} onChange={(event) => setPass(event.target.value)} />
          <button style={styles.button} onClick={connect}>
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ ...styles.shell, background: SAAS_THEME.background }}>
      <Sidebar
        tab={tab}
        clock={clock}
        pendingOrders={stats.pending}
        chatUnread={chatUnread}
        buybackUnread={buybackUnread}
        onSelectTab={selectTab}
        onLogout={logout}
      />

      <section style={styles.content}>
        {notif && <div style={styles.notif}>{notif}</div>}

        {tab === "dashboard" && (
          <Dashboard
            stats={stats}
            orderCount={orders.length}
            todayOrders={todayOrders}
            topClient={topClient}
            criticalStock={criticalStock}
            buybacks={buybackMetrics}
          />
        )}

        {tab === "orders" && (
          <Orders
            orders={orders}
            search={search}
            stats={stats}
            topClient={topClient}
            onSearch={setSearch}
            onUpdateStatus={updateOrder}
            onDelete={removeOrder}
          />
        )}

        {tab === "items" && (
          <Catalog
            items={items}
            filteredItems={filteredItems}
            categories={categories}
            search={search}
            stockFilter={stockFilter}
            categoryFilter={categoryFilter}
            editId={editId}
            name={name}
            price={price}
            category={category}
            image={image}
            stock={stock}
            buybackLimit={buybackLimit}
            itemFileUploading={itemFileUploading}
            onSearch={setSearch}
            onStockFilter={setStockFilter}
            onCategoryFilter={setCategoryFilter}
            onName={setName}
            onPrice={setPrice}
            onCategory={setCategory}
            onImage={setImage}
            onStock={setStock}
            onBuybackLimit={setBuybackLimit}
            onUploadImage={uploadItemImage}
            onClearImage={() => setImage("")}
            onSave={saveItem}
            onReset={resetForm}
            onEdit={editItem}
            onRemove={removeItem}
            stockBadge={stockBadge}
          />
        )}

        {tab === "promo" && (
          <Promotions enabled={promoEnabled} percent={promo} onEnabled={setPromoEnabled} onPercent={setPromo} onSave={savePromo} />
        )}

        {tab === "banner" && <Banner bannerUrl={bannerUrl} uploading={uploading} onUpload={uploadBanner} onDelete={deleteBanner} />}

        {tab === "auction" && (
          <Auction
            items={items}
            auctionItem={auctionItem}
            auctionStart={auctionStart}
            auctionStep={auctionStep}
            onItem={setAuctionItem}
            onStart={setAuctionStart}
            onStep={setAuctionStep}
            onSave={saveAuction}
          />
        )}

        {tab === "rewards" && (
          <Rewards
            rewardOrders={rewardOrders}
            rewardPercent={rewardPercent}
            onOrders={setRewardOrders}
            onPercent={setRewardPercent}
            onSave={saveRewards}
          />
        )}

        {tab === "users" && (
          <StaffPermissions
            adminUsers={adminUsers}
            newPseudo={newPseudo}
            newCode={newCode}
            newRole={newRole}
            onPseudoChange={setNewPseudo}
            onCodeChange={setNewCode}
            onRoleChange={setNewRole}
            onSave={saveAdminUser}
            onRemove={removeAdminUser}
          />
        )}

        {tab === "chat" && (
          <Chat
            chatMessages={chatMessages}
            chatText={chatText}
            replyTarget={replyTarget}
            replyText={replyText}
            staffOnline={staffOnline}
            onChatTextChange={setChatText}
            onReplyTargetChange={setReplyTarget}
            onReplyTextChange={setReplyText}
            onSendChat={sendChat}
            onSendPrivateReply={sendPrivateReply}
          />
        )}

        {tab === "buybacks" && (
          <Buybacks
            buybacks={buybacks}
            items={items}
            filter={buybackFilter}
            metrics={buybackMetrics}
            onFilterChange={setBuybackFilter}
            onAccept={(id) => updateBuyback(id, "accepted")}
            onRefuse={(id) => updateBuyback(id, "refused")}
            onDelete={deleteBuyback}
            onClearFinished={clearFinishedBuybacks}
          />
        )}

        {tab === "logs" && <Logs logs={logs} />}
      </section>
    </main>
  )
}

function sortBuybacks(a: any, b: any, items: any[]) {
  const getItem = (name: any) => items.find((item: any) => item.name?.toLowerCase() === String(name || "").toLowerCase()) || {}
  const itemA: any = getItem(a.item)
  const itemB: any = getItem(b.item)
  const needA = Math.max(0, Number(itemA.buybackLimit || 3) - Number(itemA.stock || 0))
  const needB = Math.max(0, Number(itemB.buybackLimit || 3) - Number(itemB.stock || 0))
  const priorityA = Number(itemA.stock || 0) === 0 ? 3 : Number(itemA.stock || 0) <= 3 ? 2 : 1
  const priorityB = Number(itemB.stock || 0) === 0 ? 3 : Number(itemB.stock || 0) <= 3 ? 2 : 1
  const payA = Math.round(Number(itemA.price || 0) * 0.5 * Number(a.quantity || 0))
  const payB = Math.round(Number(itemB.price || 0) * 0.5 * Number(b.quantity || 0))

  if ((a.status || "pending") !== (b.status || "pending")) return a.status === "pending" ? -1 : 1
  if (priorityA !== priorityB) return priorityB - priorityA
  if (needA !== needB) return needB - needA
  if (payA !== payB) return payB - payA
  return Number(a.createdAt || 0) - Number(b.createdAt || 0)
}

function topBy(list: any[], keyFn: (entry: any) => string, valueFn: (entry: any) => number) {
  const map: Record<string, number> = {}
  list.forEach((entry) => {
    const key = keyFn(entry) || "Inconnu"
    map[key] = (map[key] || 0) + valueFn(entry)
  })
  return Object.entries(map).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "Aucun"
}
