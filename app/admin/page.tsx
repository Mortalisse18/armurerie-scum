"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { db, storage } from "@/lib/firebase"
import { addLog, deleteOrder, getLogs, getOrders } from "@/lib/firestore"
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
  serverTimestamp,
} from "firebase/firestore"
import { Auction, Banner, Promotions, Rewards } from "./_components/Operations"
import { Buybacks } from "./_components/Buybacks"
import { Catalog } from "./_components/Catalog"
import { Chat } from "./_components/Chat"
import { Dashboard } from "./_components/Dashboard"
import { Logs } from "./_components/Logs"
import { getOrderPlayerName, Orders } from "./_components/Orders"
import { PlayerProfiles } from "./_components/PlayerProfiles"
import { Sidebar } from "./_components/Sidebar"
import { StaffPermissions } from "./_components/StaffPermissions"
import { AdminHeader, CyberpunkStyles, Toast } from "./_components/ui"
import {
  canAccessTab,
  getFirstAllowedTab,
  normalizePermissions,
  normalizeRole,
  permissionsForRole,
} from "./_components/permissions"
import { ADMIN_MENU, SAAS_THEME, styles } from "./_components/styles"
import type { AdminPermissionKey, AdminTab, BuybackMetrics, LiveActivity, OrderStatus, PlayerNote, StaffMember, StaffPermissions as StaffPermissionMap, StaffRole, ToastMessage, ToastTone } from "./_components/types"

export default function AdminPage() {
  const [authOk, setAuthOk] = useState(false)
  const [login, setLogin] = useState("")
  const [pass, setPass] = useState("")
  const [tab, setTab] = useState<AdminTab>("dashboard")

  const [orders, setOrders] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [buybacks, setBuybacks] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<StaffMember[]>([])
  const [userProfiles, setUserProfiles] = useState<any[]>([])
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([])
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
  const [, setOrdersUnread] = useState(0)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [clock, setClock] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [bannerUrl, setBannerUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [itemFileUploading, setItemFileUploading] = useState(false)
  const [newPseudo, setNewPseudo] = useState("")
  const [newCode, setNewCode] = useState("")
  const [newRole, setNewRole] = useState<StaffRole>("moderator")
  const [userRole, setUserRole] = useState<StaffRole>("delivery")
  const [currentPermissions, setCurrentPermissions] = useState<StaffPermissionMap>(permissionsForRole("delivery"))
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
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ordersReadyRef = useRef(false)
  const orderIdsRef = useRef<Set<string>>(new Set())
  const orderStatusRef = useRef<Map<string, OrderStatus>>(new Map())
  const chatReadyRef = useRef(false)
  const chatIdsRef = useRef<Set<string>>(new Set())
  const buybacksReadyRef = useRef(false)
  const buybackIdsRef = useRef<Set<string>>(new Set())
  const stockReadyRef = useRef(false)
  const criticalStockIdsRef = useRef<Set<string>>(new Set())

  async function logAction(
    action: string,
    target = "",
    details: Record<string, unknown> = {},
    severity: "info" | "success" | "warning" | "danger" = "info",
  ) {
    await addLog({
      action,
      admin: currentUser || "SYSTEM",
      target,
      details,
      severity,
    })
  }

  function playNotificationSound() {
    if (typeof window === "undefined") return
    if (!soundEnabled) return

    const sources = [
      "/notification.mp3",
      "/notification.mp3/click.mp3.mp3",
      "/notification.mp3/gun.mp3.mp3",
    ]

    const trySource = (index: number) => {
      const source = sources[index]
      if (!source) return

      const audio = new Audio(source)
      audio.volume = 0.45
      audio.play().catch(() => {
        trySource(index + 1)
      })
    }

    trySource(0)
  }

  function showToast(title: string, message: string, tone: ToastTone = "info") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)

    setToast({
      id: getNow(),
      title,
      message,
      tone,
    })
    playNotificationSound()
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)
  }

  async function loadAdmins() {
    const snap = await getDocs(collection(db, "admins"))
    setAdminUsers(snap.docs.map((entry) => normalizeStaffMember(entry.id, entry.data())))
  }

  async function loadAll() {
    const allOrders = (await getOrders()) || []
    setOrders(allOrders)

    const allLogs = (await getLogs()) || []
    setLogs(allLogs)

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

  }

  useEffect(() => {
    loadAdmins()
    if (localStorage.getItem("admin-auth") === "ok") {
      const role = normalizeRole(localStorage.getItem("admin-role"))
      const permissions = normalizePermissions(parseStoredPermissions(), role)
      setUserRole(role)
      setCurrentPermissions(permissions)
      setCurrentUser(localStorage.getItem("admin-user") || "")
      setAuthOk(true)
      setTab(getFirstAllowedTab(permissions))
    }
  }, [])

  useEffect(() => {
    const updateClock = () => {
      setClock(new Date().toLocaleString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!canAccessTab(currentPermissions, tab)) {
      setTab(getFirstAllowedTab(currentPermissions))
    }
  }, [currentPermissions, tab])

  useEffect(() => {
    if (!authOk) return

    loadAll()
    const timer = setInterval(loadAll, 5000)
    const unsubscribeAdmins = onSnapshot(collection(db, "admins"), (snap) => {
      setAdminUsers(snap.docs.map((entry) => normalizeStaffMember(entry.id, entry.data())))
    })

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUserProfiles(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })))
    })

    const unsubscribePlayerNotes = onSnapshot(collection(db, "playerNotes"), (snap) => {
      setPlayerNotes(snap.docs.map((entry) => normalizePlayerNote(entry.id, entry.data())))
    })

    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const unsubscribeOrders = onSnapshot(ordersQuery, (snap) => {
      const nextOrders: any[] = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
      const nextIds = new Set(nextOrders.map((order: any) => order.id))
      const nextStatuses = new Map<string, OrderStatus>(
        nextOrders.map((order: any) => [order.id, normalizeOrderStatus(order.status)]),
      )

      if (!ordersReadyRef.current) {
        ordersReadyRef.current = true
      } else {
        const newOrders = nextOrders.filter((order: any) => !orderIdsRef.current.has(order.id))
        if (newOrders.length > 0) {
          if (tab !== "orders") setOrdersUnread((value) => value + newOrders.length)
          const firstOrder = newOrders[0]
          showToast(
            "Nouvelle commande",
            `${getOrderPlayerName(firstOrder)} • ${firstOrder.total || 0}$`,
            "success",
          )
        }

        const changedOrders = nextOrders.filter((order: any) => {
          const previous = orderStatusRef.current.get(order.id)
          const next = normalizeOrderStatus(order.status)
          return previous && previous !== next && (next === "assigned" || next === "delivering" || next === "delivered" || next === "refused")
        })

        if (changedOrders.length > 0) {
          const changed = changedOrders[0]
          const status = normalizeOrderStatus(changed.status)
          showToast(
            status === "assigned"
              ? "Commande assignée"
              : status === "delivering"
                ? "Livraison démarrée"
                : status === "delivered"
                  ? "Livraison terminée"
                  : "Commande refusée",
            `${getOrderPlayerName(changed)} • ${changed.total || 0}$`,
            status === "delivered" ? "success" : status === "refused" ? "warning" : "info",
          )
        }
      }

      orderIdsRef.current = nextIds
      orderStatusRef.current = nextStatuses
      setOrders(nextOrders)
    })

    const buybacksQuery = collection(db, "buybackRequests")
    const unsubscribeBuybacks = onSnapshot(buybacksQuery, (snap) => {
      const nextBuybacks: any[] = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
      const nextIds = new Set(nextBuybacks.map((buyback: any) => buyback.id))

      if (!buybacksReadyRef.current) {
        buybacksReadyRef.current = true
      } else {
        const newBuybacks = nextBuybacks.filter((buyback: any) => !buybackIdsRef.current.has(buyback.id) && (buyback.status || "pending") === "pending")
        if (newBuybacks.length > 0) {
          if (tab !== "buybacks") setBuybackUnread((value) => value + newBuybacks.length)
          showToast(
            "Nouvelle demande de rachat",
            `${newBuybacks[0].pseudo || "Joueur"} • ${newBuybacks[0].item || "Item"}`,
            "warning",
          )
        }
      }

      buybackIdsRef.current = nextIds
      setBuybacks(nextBuybacks)
    })

    const unsubscribeStock = onSnapshot(collection(db, "weapons"), (snap) => {
      const nextItems: any[] = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
      const critical = nextItems.filter((item: any) => Number(item.stock || 0) <= 3)
      const criticalIds = new Set(critical.map((item: any) => item.id))

      if (!stockReadyRef.current) {
        stockReadyRef.current = true
      } else {
        const newCritical = critical.filter((item: any) => !criticalStockIdsRef.current.has(item.id))
        if (newCritical.length > 0) {
          showToast(
            "Stock critique",
            `${newCritical[0].name || "Item"} • stock ${newCritical[0].stock ?? 0}`,
            "danger",
          )
        }
      }

      criticalStockIdsRef.current = criticalIds
      setItems(nextItems)
    })

    const chatQuery = query(collection(db, "staffChat"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(chatQuery, (snap) => {
      const messages: any[] = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })).slice(-30)
      const nextIds = new Set(messages.map((message: any) => message.id))

      if (!chatReadyRef.current) {
        chatReadyRef.current = true
      } else {
        const newMessages = messages.filter((message: any) => !chatIdsRef.current.has(message.id) && message.user !== currentUser)
        if (newMessages.length > 0) {
          if (tab !== "chat") setChatUnread((value) => value + newMessages.length)
          showToast(
            "Nouveau message",
            `${newMessages[0].user || "Chat"} • ${String(newMessages[0].text || "").slice(0, 80)}`,
            "info",
          )
        }
      }

      chatIdsRef.current = nextIds
      setChatMessages(messages)
      setStaffOnline(messages.some((message: any) => message.role !== "joueur" && getNow() - Number(message.createdAt || 0) < 300000))
    })

    return () => {
      clearInterval(timer)
      unsubscribeAdmins()
      unsubscribeUsers()
      unsubscribePlayerNotes()
      unsubscribeOrders()
      unsubscribeBuybacks()
      unsubscribeStock()
      unsubscribe()
    }
  }, [authOk, tab])

  function connect() {
    const found = adminUsers.find((user: any) => user.pseudo === login && user.code === pass)
    if ((login === "admin" && pass === "Armory781228") || found) {
      const role = found?.role || (login === "admin" ? "owner" : "admin")
      const permissions = found?.permissions || permissionsForRole(role)
      localStorage.setItem("admin-auth", "ok")
      localStorage.setItem("admin-role", role)
      localStorage.setItem("admin-permissions", JSON.stringify(permissions))
      localStorage.setItem("admin-user", login)
      setUserRole(role)
      setCurrentPermissions(permissions)
      setCurrentUser(login)
      setAuthOk(true)
      setTab(getFirstAllowedTab(permissions))
    } else {
      alert("Accès refusé")
    }
  }

  function logout() {
    localStorage.removeItem("admin-auth")
    localStorage.removeItem("admin-role")
    localStorage.removeItem("admin-permissions")
    localStorage.removeItem("admin-user")
    location.reload()
  }

  function selectTab(nextTab: AdminTab) {
    if (!canAccessTab(currentPermissions, nextTab)) return
    setTab(nextTab)
    if (nextTab === "orders") setOrdersUnread(0)
    if (nextTab === "chat") setChatUnread(0)
    if (nextTab === "buybacks") setBuybackUnread(0)
  }

  function openPlayerChat(pseudo: string) {
    setReplyTarget(pseudo)
    setTab("chat")
  }

  function viewPlayerOrders(pseudo: string) {
    setSearch(pseudo)
    setTab("orders")
  }

  async function addPlayerNote(player: { uid: string; pseudo: string }, note: string) {
    if (userRole !== "owner" && userRole !== "admin") return alert("Accès refusé")
    await addDoc(collection(db, "playerNotes"), {
      uid: player.uid || player.pseudo,
      pseudo: player.pseudo,
      note,
      author: currentUser || "SYSTEM",
      createdAt: serverTimestamp(),
    })
    await logAction("Note joueur ajoutée", player.pseudo, { uid: player.uid || player.pseudo }, "info")
  }

  function toggleFullscreen() {
    if (typeof document === "undefined") return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined)
      return
    }
    document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  async function saveAdminUser() {
    if (!currentPermissions.access) return alert("Accès refusé")
    if (!newPseudo || !newCode) return
    await addDoc(collection(db, "admins"), {
      pseudo: newPseudo,
      code: newCode,
      role: newRole,
      permissions: permissionsForRole(newRole),
    })
    setNewPseudo("")
    setNewCode("")
    setNewRole("moderator")
    await logAction("Staff ajouté", newPseudo, { role: newRole }, "success")
    loadAll()
  }

  async function removeAdminUser(id: string) {
    if (!currentPermissions.access) return alert("Accès refusé")
    const target = adminUsers.find((user: any) => user.id === id)
    if (!target) return
    if (isCurrentStaff(target)) return alert("Impossible de supprimer votre propre compte")
    if (target.role === "owner" && ownerCount <= 1) return alert("Impossible de supprimer le dernier OWNER")
    await deleteDoc(doc(db, "admins", id))
    await logAction("Staff supprimé", target.pseudo, { role: target.role }, "danger")
    loadAll()
  }

  async function updateStaffRole(id: string, role: StaffRole) {
    if (!currentPermissions.access) return alert("Accès refusé")
    const target = adminUsers.find((member) => member.id === id)
    if (!target) return
    if (isCurrentStaff(target) && target.role === "owner" && role !== "owner") return alert("Un OWNER ne peut pas se downgrade lui-même")
    if (target.role === "owner" && role !== "owner" && ownerCount <= 1) return alert("Impossible de retirer le dernier OWNER")
    const permissions = permissionsForRole(role)
    await updateDoc(doc(db, "admins", id), { role, permissions })
    setAdminUsers((members) => members.map((member) => (member.id === id ? { ...member, role, permissions } : member)))
    await logAction("Rôle staff modifié", target.pseudo, { from: target.role, to: role }, "warning")
  }

  async function updateStaffPermission(id: string, permission: AdminPermissionKey, value: boolean) {
    if (!currentPermissions.access) return alert("Accès refusé")
    const member = adminUsers.find((entry) => entry.id === id)
    if (!member) return
    if (member.role === "owner" && isCurrentStaff(member) && value === false) return alert("Un OWNER ne peut pas retirer ses propres permissions")
    if (member.role === "owner" && permission === "access" && value === false && ownerCount <= 1) return alert("Impossible de retirer l'accès du dernier OWNER")
    const permissions = { ...member.permissions, [permission]: value }
    await updateDoc(doc(db, "admins", id), { [`permissions.${permission}`]: value })
    setAdminUsers((members) => members.map((entry) => (entry.id === id ? { ...entry, permissions } : entry)))
    await logAction("Permission staff modifiée", member.pseudo, { permission, value }, "warning")
  }

  function canManageAllOrders() {
    return userRole === "owner" || userRole === "admin"
  }

  function canOperateAssignedOrder(order: any) {
    return canManageAllOrders() || (userRole === "delivery" && order?.assignedTo === currentUser)
  }

  async function assignOrder(id: string, assignedTo: string) {
    if (!canManageAllOrders()) return alert("Accès refusé")
    const order = orders.find((entry) => entry.id === id)
    await updateDoc(doc(db, "orders", id), {
      status: "assigned",
      assignedTo,
      assignedAt: serverTimestamp(),
    })
    await logAction("Livreur assigné", order ? getOrderPlayerName(order) : id, {
      orderId: id,
      assignedTo,
      assignedBy: currentUser || "SYSTEM",
    }, "info")
    loadAll()
  }

  async function startDelivery(id: string) {
    const order = orders.find((entry) => entry.id === id)
    if (!canOperateAssignedOrder(order)) return alert("Accès refusé")
    await updateDoc(doc(db, "orders", id), {
      status: "delivering",
      startedAt: serverTimestamp(),
      startedBy: currentUser || "SYSTEM",
    })
    await logAction("Livraison prise en charge", order ? getOrderPlayerName(order) : id, {
      orderId: id,
      assignedTo: order?.assignedTo,
      startedBy: currentUser || "SYSTEM",
    }, "info")
    loadAll()
  }

  async function completeDelivery(id: string) {
    const order = orders.find((entry) => entry.id === id)
    if (!canOperateAssignedOrder(order)) return alert("Accès refusé")
    await updateDoc(doc(db, "orders", id), {
      status: "delivered",
      deliveredBy: currentUser || "SYSTEM",
      deliveredAt: serverTimestamp(),
    })
    await logAction("Livraison terminée", order ? getOrderPlayerName(order) : id, {
      orderId: id,
      status: "delivered",
      total: order?.total,
      deliveredBy: currentUser || "SYSTEM",
    }, "success")
    loadAll()
  }

  async function refuseOrder(id: string, reason?: string) {
    if (!canManageAllOrders()) return alert("Accès refusé")
    const order = orders.find((entry) => entry.id === id)
    await updateDoc(doc(db, "orders", id), {
      status: "refused",
      refusedBy: currentUser || "SYSTEM",
      refusedAt: serverTimestamp(),
      refusedReason: reason || "",
    })
    await logAction("Commande refusée", order ? getOrderPlayerName(order) : id, {
      orderId: id,
      status: "refused",
      total: order?.total,
      refusedBy: currentUser || "SYSTEM",
      refusedReason: reason || "",
    }, "warning")
    loadAll()
  }

  async function removeOrder(id: string) {
    if (!canManageAllOrders()) return alert("Accès refusé")
    const order = orders.find((entry) => entry.id === id)
    await deleteOrder(id)
    await logAction("Commande supprimée", order ? getOrderPlayerName(order) : id, { orderId: id, total: order?.total }, "danger")
    loadAll()
  }

  async function saveAuction() {
    await setDoc(doc(db, "settings", "auction"), { item: auctionItem, step: Number(auctionStep), start: Number(auctionStart) })
    await logAction("Enchères modifiées", auctionItem || "auction", { step: Number(auctionStep), start: Number(auctionStart) }, "warning")
  }

  async function saveRewards() {
    await setDoc(doc(db, "settings", "rewards"), { orders: Number(rewardOrders), percent: Number(rewardPercent) })
    await logAction("Récompenses modifiées", "rewards", { orders: Number(rewardOrders), percent: Number(rewardPercent) }, "warning")
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
      await logAction("Bannière modifiée", "banner", { url }, "warning")
    } finally {
      setUploading(false)
    }
  }

  async function deleteBanner() {
    await setDoc(doc(db, "settings", "banner"), { url: "" })
    setBannerUrl("")
    await logAction("Bannière supprimée", "banner", {}, "danger")
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
    await logAction("Promotions modifiées", "promo", { enabled: promoEnabled, percent: promo }, "warning")
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
      await logAction("Boutique modifiée", name, { itemId: editId, payload }, "warning")
    } else {
      const created = await addDoc(collection(db, "weapons"), payload)
      await logAction("Item boutique ajouté", name, { itemId: created.id, payload }, "success")
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
    const item = items.find((entry) => entry.id === id)
    await deleteDoc(doc(db, "weapons", id))
    await logAction("Item boutique supprimé", item?.name || id, { itemId: id }, "danger")
    loadAll()
  }

  async function updateBuyback(id: string, status: "accepted" | "refused") {
    const buyback = buybacks.find((entry) => entry.id === id)
    await updateDoc(doc(db, "buybackRequests", id), { status })
    await logAction(status === "accepted" ? "Rachat accepté" : "Rachat refusé", buyback?.pseudo || buyback?.item || id, { buybackId: id, status }, status === "accepted" ? "success" : "warning")
    loadAll()
  }

  async function deleteBuyback(id: string) {
    const buyback = buybacks.find((entry) => entry.id === id)
    await deleteDoc(doc(db, "buybackRequests", id))
    await logAction("Rachat supprimé", buyback?.pseudo || buyback?.item || id, { buybackId: id }, "danger")
    loadAll()
  }

  async function clearFinishedBuybacks() {
    const finished = buybacks.filter((buyback: any) => buyback.status === "accepted" || buyback.status === "refused")
    for (const buyback of finished) {
      await deleteDoc(doc(db, "buybackRequests", buyback.id))
    }
    await logAction("Rachats terminés vidés", "buybacks", { count: finished.length }, "danger")
    loadAll()
  }

  const ownerCount = adminUsers.filter((member) => member.role === "owner").length

  function isCurrentStaff(member: StaffMember) {
    return member.pseudo === currentUser
  }

  const stats = useMemo(() => {
    const pending = orders.filter((order: any) => normalizeOrderStatus(order.status) === "pending").length
    const assigned = orders.filter((order: any) => normalizeOrderStatus(order.status) === "assigned").length
    const delivering = orders.filter((order: any) => normalizeOrderStatus(order.status) === "delivering").length
    const delivered = orders.filter((order: any) => normalizeOrderStatus(order.status) === "delivered").length
    const refused = orders.filter((order: any) => normalizeOrderStatus(order.status) === "refused").length
    const totalMoney = orders
      .filter((order: any) => normalizeOrderStatus(order.status) === "delivered")
      .reduce((sum, order: any) => sum + Number(order.total || 0), 0)
    return { totalMoney, pending, assigned, delivering, delivered, refused }
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
      const name = getOrderPlayerName(order)
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

  const todayRevenue = useMemo(
    () =>
      orders
        .filter((order: any) => normalizeOrderStatus(order.status) === "delivered")
        .filter((order: any) => isToday(getTimestampMillis(order.deliveredAt) || getTimestampMillis(order.createdAt)))
        .reduce((sum, order: any) => sum + Number(order.total || 0), 0),
    [orders],
  )

  const activeStaff = useMemo(() => {
    const recentStaffNames = new Set(
      chatMessages
        .filter((message: any) => String(message.role || "").toLowerCase() !== "joueur")
        .filter((message: any) => getNow() - getTimestampMillis(message.createdAt) < 300000)
        .map((message: any) => String(message.user || "")),
    )

    if (currentUser) recentStaffNames.add(currentUser)
    return adminUsers.filter((member) => recentStaffNames.has(member.pseudo))
  }, [adminUsers, chatMessages, currentUser])

  const liveActivities = useMemo<LiveActivity[]>(() => {
    const orderEvents = orders.flatMap((order: any) => {
      const player = getOrderPlayerName(order)
      const status = normalizeOrderStatus(order.status)
      const events: LiveActivity[] = [
        {
          id: `order-${order.id}`,
          kind: "order",
          title: "Nouvelle commande",
          detail: `${player} - ${order.total || 0}$`,
          timestamp: getTimestampMillis(order.createdAt),
        },
      ]

      if (status === "assigned") {
        events.push({
          id: `assigned-${order.id}`,
          kind: "assigned",
          title: "Livreur assigne",
          detail: `${order.assignedTo || "Livreur"} prend ${player}`,
          timestamp: getTimestampMillis(order.assignedAt) || getTimestampMillis(order.createdAt),
        })
      }

      if (status === "delivered") {
        events.push({
          id: `delivered-${order.id}`,
          kind: "delivered",
          title: "Commande livree",
          detail: `${player} par ${order.deliveredBy || "SYSTEM"}`,
          timestamp: getTimestampMillis(order.deliveredAt) || getTimestampMillis(order.createdAt),
        })
      }

      return events
    })

    const messageEvents = chatMessages.slice(-8).map((message: any) => ({
      id: `message-${message.id}`,
      kind: "message" as const,
      title: "Message joueur/staff",
      detail: `${message.user || "Chat"} - ${String(message.text || "").slice(0, 70)}`,
      timestamp: getTimestampMillis(message.createdAt),
    }))

    const stockEvents = items
      .filter((item: any) => Number(item.stock || 0) <= 3)
      .slice(0, 6)
      .map((item: any) => ({
        id: `stock-${item.id}`,
        kind: "stock" as const,
        title: "Stock critique",
        detail: `${item.name || "Item"} - stock ${item.stock ?? 0}`,
        timestamp: getTimestampMillis(item.updatedAt) || getNow(),
      }))

    const loginEvent: LiveActivity[] = currentUser
      ? [{
          id: `login-${currentUser}`,
          kind: "login",
          title: "Admin connecte",
          detail: `${currentUser} - ${userRole}`,
          timestamp: getNow(),
        }]
      : []

    return [...loginEvent, ...stockEvents, ...messageEvents, ...orderEvents]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 18)
  }, [orders, chatMessages, items, currentUser, userRole])

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
    <main className="command-center-shell" style={{ ...styles.shell, background: SAAS_THEME.background }}>
      <CyberpunkStyles />
      <Sidebar
        tab={tab}
        clock={clock}
        ordersUnread={stats.pending + stats.assigned}
        chatUnread={chatUnread}
        buybackUnread={buybackUnread}
        role={userRole}
        permissions={currentPermissions}
        onSelectTab={selectTab}
        onLogout={logout}
      />

      <section className="command-content" style={styles.content}>
        <AdminHeader
          title={getPageTitle(tab)}
          role={userRole}
          clock={clock}
          staffOnline={staffOnline}
          notifications={stats.pending + stats.assigned + chatUnread + buybackUnread}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((value) => !value)}
          onFullscreen={toggleFullscreen}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />

        {tab === "dashboard" && currentPermissions.dashboard && (
          <Dashboard
            stats={stats}
            orderCount={orders.length}
            todayOrders={todayOrders}
            todayRevenue={todayRevenue}
            topClient={topClient}
            criticalStock={criticalStock}
            buybacks={buybackMetrics}
            activeStaff={activeStaff}
            activities={liveActivities}
            liveClock={clock}
          />
        )}

        {tab === "orders" && currentPermissions.orders && (
          <Orders
            orders={orders}
            search={search}
            stats={stats}
            topClient={topClient}
            staffMembers={adminUsers}
            currentUser={currentUser}
            currentRole={userRole}
            onSearch={setSearch}
            onAssign={assignOrder}
            onStartDelivery={startDelivery}
            onCompleteDelivery={completeDelivery}
            onRefuse={refuseOrder}
            onDelete={removeOrder}
          />
        )}

        {tab === "players" && currentPermissions.orders && (
          <PlayerProfiles
            userProfiles={userProfiles}
            orders={orders}
            buybacks={buybacks}
            logs={logs}
            chatMessages={chatMessages}
            notes={playerNotes}
            currentRole={userRole}
            currentUser={currentUser}
            onAddNote={addPlayerNote}
            onOpenChat={openPlayerChat}
            onViewOrders={viewPlayerOrders}
          />
        )}

        {tab === "items" && currentPermissions.shop && (
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

        {tab === "promo" && currentPermissions.promotions && (
          <Promotions enabled={promoEnabled} percent={promo} onEnabled={setPromoEnabled} onPercent={setPromo} onSave={savePromo} />
        )}

        {tab === "banner" && currentPermissions.banner && <Banner bannerUrl={bannerUrl} uploading={uploading} onUpload={uploadBanner} onDelete={deleteBanner} />}

        {tab === "auction" && currentPermissions.auction && (
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

        {tab === "rewards" && currentPermissions.rewards && (
          <Rewards
            rewardOrders={rewardOrders}
            rewardPercent={rewardPercent}
            onOrders={setRewardOrders}
            onPercent={setRewardPercent}
            onSave={saveRewards}
          />
        )}

        {tab === "users" && currentPermissions.access && (
          <StaffPermissions
            staffMembers={adminUsers}
            newPseudo={newPseudo}
            newCode={newCode}
            newRole={newRole}
            canManageAccess={currentPermissions.access}
            onPseudoChange={setNewPseudo}
            onCodeChange={setNewCode}
            onRoleChange={setNewRole}
            onSave={saveAdminUser}
            onRemove={removeAdminUser}
            onStaffRoleChange={updateStaffRole}
            onPermissionToggle={updateStaffPermission}
          />
        )}

        {tab === "chat" && currentPermissions.staffChat && (
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

        {tab === "buybacks" && currentPermissions.buybacks && (
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

        {tab === "logs" && currentPermissions.logs && <Logs logs={logs} />}
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

function normalizeStaffMember(id: string, data: any): StaffMember {
  const role = normalizeRole(data.role)

  return {
    id,
    pseudo: String(data.pseudo || ""),
    code: typeof data.code === "string" ? data.code : undefined,
    role,
    permissions: normalizePermissions(data.permissions, role),
  }
}

function normalizePlayerNote(id: string, data: any): PlayerNote {
  return {
    id,
    uid: String(data.uid || ""),
    pseudo: String(data.pseudo || ""),
    note: String(data.note || ""),
    author: String(data.author || "SYSTEM"),
    createdAt: data.createdAt,
  }
}

function parseStoredPermissions() {
  try {
    return JSON.parse(localStorage.getItem("admin-permissions") || "null")
  } catch {
    return null
  }
}

function getNow() {
  return Date.now()
}

function getTimestampMillis(value: any): number {
  if (!value) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (value instanceof Date) return value.getTime()
  if (typeof value.toDate === "function") return value.toDate().getTime()
  if (typeof value.seconds === "number") return value.seconds * 1000
  return 0
}

function isToday(timestamp: number) {
  if (!timestamp) return false
  const date = new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function normalizeOrderStatus(status: unknown): OrderStatus {
  if (status === "delivered" || status === "done") return "delivered"
  if (status === "assigned") return "assigned"
  if (status === "delivering") return "delivering"
  if (status === "refused") return "refused"
  return "pending"
}

function getPageTitle(tab: AdminTab) {
  return ADMIN_MENU.find((menu) => menu.key === tab)?.label || "Dashboard"
}
