"use client"

import { useEffect, useMemo, useState } from "react"
import { db, storage } from "@/lib/firebase"
import {
  getOrders,
  getLogs,
  addLog,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/firestore"

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"

export default function AdminPage() {
  const [authOk, setAuthOk] = useState(false)
  const [login, setLogin] = useState("")
  const [pass, setPass] = useState("")
  const [tab, setTab] = useState("dashboard")

  const [orders, setOrders] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promo, setPromo] = useState(10)

  const [editId, setEditId] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState("")

  const [search, setSearch] = useState("")
  const [notif, setNotif] = useState("")
  const [lastPending, setLastPending] = useState(0)
  const [clock, setClock] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [itemFileUploading, setItemFileUploading] = useState(false)
  const [pulse, setPulse] = useState(true)
  const [adminUsers, setAdminUsers] = useState<any[]>([])
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

  useEffect(() => {
    loadAdmins()
    if (localStorage.getItem("admin-auth") === "ok") {
      setUserRole(localStorage.getItem("admin-role") || "guest")
      setCurrentUser(localStorage.getItem("admin-user") || "")
      setAuthOk(true)
    }
  }, [])

  useEffect(() => {
    const fx = setInterval(() => setPulse((v) => !v), 900)
    return () => clearInterval(fx)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("fr-FR")),1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!authOk) return

    loadAll()

    const t = setInterval(loadAll, 5000)

    return () => clearInterval(t)
  }, [authOk])

  async function loadAdmins() {
    const snap = await getDocs(collection(db, "admins"))
    setAdminUsers(
      snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    )
  }

  async function loadAll() {
    const allOrders = (await getOrders()) || []
    setOrders(allOrders)

    const allLogs = (await getLogs()) || []
    setLogs(allLogs)

    // ✅ ERREUR TYPESCRIPT CORRIGÉE
    const pendingCount = allOrders.filter(
      (o: any) => o.status !== "done"
    ).length

    if (pendingCount > lastPending && lastPending > 0) {
      setNotif("🔔 Nouvelle commande reçue !")

      setTimeout(() => {
        setNotif("")
      }, 5000)
    }

    setLastPending(pendingCount)

    const snap = await getDocs(collection(db, "weapons"))

    setItems(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    )

    const ref = await getDoc(doc(db, "settings", "promo"))

    if (ref.exists()) {
      const data: any = ref.data()

      setPromoEnabled(Boolean(data.enabled))
      setPromo(Number(data.percent || 10))
    }

    const bannerRef = await getDoc(doc(db, "settings", "banner"))
    if (bannerRef.exists()) {
      setBannerUrl(bannerRef.data().url || "")
    }

    await loadAdmins()
    const aucRef = await getDoc(doc(db,"settings","auction"))
    if(aucRef.exists()){const a:any=aucRef.data();setAuctionItem(a.item||"");setAuctionStep(String(a.step||100));setAuctionStart(String(a.start||1000))}
    const rewRef = await getDoc(doc(db,"settings","rewards"))
    if(rewRef.exists()){const r:any=rewRef.data();setRewardOrders(String(r.orders||5));setRewardPercent(String(r.percent||10))}
  }

  function connect() {
    const found = adminUsers.find((u:any)=>u.pseudo===login && u.code===pass)
    if ((login === "admin" && pass === "Armory781228") || found) {
      localStorage.setItem("admin-auth", "ok")
      localStorage.setItem("admin-role", found?.role || (login === "admin" ? "superadmin" : "admin"))
      localStorage.setItem("admin-user", login)
      setUserRole(found?.role || (login === "admin" ? "superadmin" : "admin"))
      setCurrentUser(login)
      setAuthOk(true)
    } else {
      alert("Accès refusé")
    }
  }

  async function saveAdminUser() {
    if(userRole === "moderator") return alert("Accès refusé")
    if (!newPseudo || !newCode) return
    await addDoc(collection(db,"admins"), { pseudo:newPseudo, code:newCode, role:newRole })
    setNewPseudo("")
    setNewCode("")
    setNewRole("moderator")
    await addLog("Compte admin/mod ajouté")
    loadAll()
  }

  async function saveAuction(){await setDoc(doc(db,"settings","auction"),{item:auctionItem,step:Number(auctionStep),start:Number(auctionStart)});await addLog("Enchères modifiées")}

  async function saveRewards(){await setDoc(doc(db,"settings","rewards"),{orders:Number(rewardOrders),percent:Number(rewardPercent)});await addLog("Récompenses modifiées")}

  async function removeAdminUser(id:string) {
    if(userRole !== "superadmin") return alert("Accès refusé")
    const target = adminUsers.find((u:any)=>u.id===id)
    if(target?.pseudo === "admin") return alert("Compte protégé")
    await deleteDoc(doc(db,"admins",id))
    await addLog("Compte admin/mod supprimé")
    loadAll()
  }

  function logout() {
    localStorage.removeItem("admin-auth")
    localStorage.removeItem("admin-role")
    localStorage.removeItem("admin-user")
    location.reload()
  }

  async function uploadBanner(file: File) {
    try {
      setUploading(true)
      const fileRef = ref(storage, `banners/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      await setDoc(doc(db, "settings", "banner"), { url })
      setBannerUrl(url)
      await addLog("Bannière modifiée")
    } finally {
      setUploading(false)
    }
  }

  async function deleteBanner() {
    await setDoc(doc(db, "settings", "banner"), { url: "" })
    setBannerUrl("")
    await addLog("Bannière supprimée")
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

  function clearImage() {
    setImage("")
  }

  async function savePromo() {
    await setDoc(doc(db, "settings", "promo"), {
      enabled: promoEnabled,
      percent: promo,
    })

    await addLog("Promo modifiée")
    alert("Promo sauvegardée")
  }

  function resetForm() {
    setEditId("")
    setName("")
    setPrice("")
    setCategory("")
    setImage("")
    setStock("")
  }

  async function saveItem() {
    const payload = {
      name,
      price: Number(price),
      category,
      image,
      stock: Number(stock),
    }

    if (editId) {
      await updateDoc(doc(db, "weapons", editId), payload)
      await addLog("Item modifié")
    } else {
      await addDoc(collection(db, "weapons"), payload)
      await addLog("Item ajouté")
    }

    resetForm()
    loadAll()
  }

  function editItem(it: any) {
    setEditId(it.id)
    setName(it.name)
    setPrice(String(it.price))
    setCategory(it.category)
    setImage(it.image)
    setStock(String(it.stock))
  }

  async function removeItem(id: string) {
    await deleteDoc(doc(db, "weapons", id))
    await addLog("Item supprimé")
    loadAll()
  }

  const stats = useMemo(() => {
    const totalMoney = orders.reduce(
      (sum, o: any) => sum + Number(o.total || 0),
      0
    )

    const pending = orders.filter(
      (o: any) => o.status !== "done"
    ).length

    return {
      totalMoney,
      pending,
    }
  }, [orders])

  const filteredItems = items.filter((x: any) =>
    x.name?.toLowerCase().includes(search.toLowerCase())
  )

  const topClient = (() => {
    const map: any = {}

    orders.forEach((o: any) => {
      const n = o.pseudo || "Inconnu"
      map[n] = (map[n] || 0) + 1
    })

    const sorted = Object.entries(map).sort(
      (a: any, b: any) => Number(b[1]) - Number(a[1])
    )

    return sorted[0]?.[0] || "Aucun"
  })()

  const todayOrders = orders.filter((o: any) => {
    try {
      const d = new Date(
        o.createdAt?.seconds
          ? o.createdAt.seconds * 1000
          : o.createdAt
      )

      return (
        d.toDateString() ===
        new Date().toDateString()
      )
    } catch {
      return false
    }
  }).length

  const criticalStock = items.filter(
    (i: any) => Number(i.stock) <= 3
  ).length

  function stockBadge(v: number) {
    if (v === 0) return "Rupture"
    if (v <= 3) return "Faible"
    return "OK"
  }

  if (!authOk) {
    return (
      <main style={styles.loginPage}>
        <div style={styles.card}>
          <h1>🔐 Admin</h1>

          <input
            style={styles.input}
            placeholder="Login"
            value={login}
            onChange={(e) =>
              setLogin(e.target.value)
            }
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Code"
            value={pass}
            onChange={(e) =>
              setPass(e.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={connect}
          >
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <h2>☢ BUNKER ADMIN</h2>
        <div style={{...styles.hud, boxShadow: pulse ? "0 0 18px rgba(0,255,204,.45)" : "0 0 4px rgba(0,255,204,.15)"}}>🕒 {clock}</div>
        <div style={styles.radar}>📡 LIVE SYSTEM</div>
        <div style={styles.statusBar}>DEFCON 1 • SECURE NODE • ONLINE</div>

        <button
          style={styles.button}
          onClick={() =>
            setTab("dashboard")
          }
        >
          📊 Dashboard
        </button>

        <button
          style={styles.button}
          onClick={() =>
            setTab("orders")
          }
        >
          📦 Commandes
          {stats.pending > 0 &&
            ` (${stats.pending})`}
        </button>

        <button
          style={styles.button}
          onClick={() =>
            setTab("items")
          }
        >
          🔫 Boutique
        </button>

        <button
          style={styles.button}
          onClick={() =>
            setTab("promo")
          }
        >
          💸 Promotions
        </button>

        <button
          style={styles.button}
          onClick={() =>
            setTab("banner")
          }
        >
          🖼 Bannière
        </button>

        <button style={styles.button} onClick={() => setTab("auction")}>💰 Enchères</button>
        <button style={styles.button} onClick={() => setTab("rewards")}>🎁 Réductions</button>
        {userRole !== "moderator" && <button style={styles.button} onClick={() => setTab("users")}>
          👮 Accès</button>}

        <button
          style={styles.button}
          onClick={() =>
            setTab("logs")
          }
        >
          📜 Logs
        </button>

        <button
          style={styles.button}
          onClick={logout}
        >
          🚪 Logout
        </button>
      </aside>

      <section style={styles.content}>
        {notif && (
          <div style={styles.notif}>
            {notif}
          </div>
        )}

        {tab === "dashboard" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}><h1 style={{margin:0}}>🩸 Armurerie Sauce Sanguine</h1><img src="/logo.png" alt="Logo serveur" style={{width:72,height:72,objectFit:"contain",filter:"drop-shadow(0 0 10px rgba(0,255,204,.45))"}} /></div>

            <div style={styles.grid}>
              <div style={styles.card}><h3>🚨 Alertes</h3><p>{stats.pending > 0 ? `${stats.pending} commande(s)` : "RAS"}</p></div>
              <div style={styles.card}><h3>📈 Revenus moyen</h3><p>{orders.length ? Math.round(stats.totalMoney / orders.length) : 0}$</p></div>
              <div style={styles.card}>
                <h3>💰 Chiffre total</h3>
                <p>
                  {stats.totalMoney} $
                </p>
              </div>

              <div style={styles.card}>
                <h3>📦 Total commandes</h3>
                <p>{orders.length}</p>
              </div>

              <div style={styles.card}>
                <h3>⏳ En attente</h3>
                <p>{stats.pending}</p>
              </div>

              <div style={styles.card}>
                <h3>📅 Aujourd’hui</h3>
                <p>{todayOrders}</p>
              </div>

              <div style={styles.card}>
                <h3>🏆 Top client</h3>
                <p>{topClient}</p>
              </div>

              <div style={styles.card}>
                <h3>⚠ Stock critique</h3>
                <p>{criticalStock}</p>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h1>Commandes</h1>

            {orders.map((o: any) => (
              <div
                key={o.id}
                style={styles.card}
              >
                <b>{o.pseudo}</b> — {o.total}$ —{" "}
                {o.status}

                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  <button
                    style={styles.button}
                    onClick={() =>
                      updateOrderStatus(
                        o.id,
                        "done"
                      )
                    }
                  >
                    ✔ Livrée
                  </button>

                  <button
                    style={styles.button}
                    onClick={() =>
                      deleteOrder(o.id)
                    }
                  >
                    ✖ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "items" && (
          <div>
            <h1>Boutique CRUD</h1>

            <input
              style={styles.input}
              placeholder="Recherche..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <div style={styles.card}>
              <input
                style={styles.input}
                placeholder="Nom"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <input
                style={styles.input}
                placeholder="Prix"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

              <input
                style={styles.input}
                placeholder="Catégorie"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              />

              <input
                style={styles.input}
                placeholder="Image URL"
                value={image}
                onChange={(e) =>
                  setImage(e.target.value)
                }
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadItemImage(file)
                }}
              />

              {itemFileUploading && <p>Upload image...</p>}

              {image && (
                <div>
                  <img src={image} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid #00ffcc" }} />
                  <div>
                    <button style={styles.button} onClick={clearImage}>❌ Retirer image</button>
                  </div>
                </div>
              )}

              <input
                style={styles.input}
                placeholder="Stock"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
              />

              <button
                style={styles.button}
                onClick={saveItem}
              >
                {editId
                  ? "💾 Modifier"
                  : "➕ Ajouter"}
              </button>

              {editId && (
                <button
                  style={styles.button}
                  onClick={resetForm}
                >
                  Annuler
                </button>
              )}
            </div>

            {filteredItems.map(
              (it: any) => (
                <div
                  key={it.id}
                  style={{...styles.card, ...(Number(it.stock) === 0 ? styles.cardDanger : Number(it.stock) <= 3 ? styles.cardWarn : styles.cardOk)}}
                >
                  {it.image && (<img src={it.image} style={{width:72,height:72,objectFit:"cover",borderRadius:10,border:"1px solid #00ffcc",marginBottom:10}} />)}<b>{it.name}</b> — 
                  {it.price}$ —
                  Stock {it.stock} (
                  {stockBadge(
                    Number(it.stock)
                  )}
                  )

                  <div
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <button
                      style={styles.button}
                      onClick={() =>
                        editItem(it)
                      }
                    >
                      ✏ Modifier
                    </button>

                    <button
                      style={styles.button}
                      onClick={() =>
                        removeItem(
                          it.id
                        )
                      }
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {tab === "promo" && (
          <div>
            <h1>Promotions</h1>

            <label>
              <input
                type="checkbox"
                checked={
                  promoEnabled
                }
                onChange={(e) =>
                  setPromoEnabled(
                    e.target.checked
                  )
                }
              />{" "}
              Activer
            </label>

            <div
              style={{
                marginTop: 10,
              }}
            >
              <input
                style={styles.input}
                type="number"
                min="0"
                max="20"
                value={promo}
                onChange={(e) =>
                  setPromo(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <button
                style={styles.button}
                onClick={savePromo}
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        )}

        {tab === "banner" && (
          <div>
            <h1>Bannière Boutique</h1>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadBanner(file)
            }} />
            {uploading && <p>Upload...</p>}
            {bannerUrl && (
              <>
                <img src={bannerUrl} style={{ width:"100%", maxWidth:700, marginTop:20, borderRadius:12, border:"1px solid #00ffcc" }} />
                <div>
                  <button style={styles.button} onClick={deleteBanner}>🗑 Supprimer bannière</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "auction" && (
          <div>
            <h1>Gestion Enchères</h1>
            <div style={styles.card}>
              <select style={styles.input} value={auctionItem} onChange={(e)=>setAuctionItem(e.target.value)}>
                <option value="">Choisir un item</option>
                {items.map((it:any)=><option key={it.id} value={it.id}>{it.name}</option>)}
              </select>
              <input style={styles.input} placeholder="Prix départ" value={auctionStart} onChange={(e)=>setAuctionStart(e.target.value)} />
              <input style={styles.input} placeholder="Pas enchère" value={auctionStep} onChange={(e)=>setAuctionStep(e.target.value)} />
              <button style={styles.button} onClick={saveAuction}>💾 Sauvegarder</button>
            </div>
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <h1>Coupons Réduction</h1>
            <div style={styles.card}>
              <input style={styles.input} placeholder="Nb commandes" value={rewardOrders} onChange={(e)=>setRewardOrders(e.target.value)} />
              <input style={styles.input} placeholder="Pourcentage %" value={rewardPercent} onChange={(e)=>setRewardPercent(e.target.value)} />
              <button style={styles.button} onClick={saveRewards}>💾 Sauvegarder</button>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <h1>Gestion Accès</h1>
            <div style={styles.card}>
              <input style={styles.input} placeholder="Pseudo" value={newPseudo} onChange={(e)=>setNewPseudo(e.target.value)} />
              <input style={styles.input} placeholder="Code" value={newCode} onChange={(e)=>setNewCode(e.target.value)} />
              <select style={styles.input} value={newRole} onChange={(e)=>setNewRole(e.target.value)}>
                <option value="moderator">Modérateur</option>
                <option value="admin">Admin</option>
              </select>
              <button style={styles.button} onClick={saveAdminUser}>➕ Ajouter accès</button>
            </div>
            {adminUsers.map((u:any)=>(
              <div key={u.id} style={styles.card}>
                <b>{u.pseudo}</b> — {u.role}
                <button style={styles.button} onClick={()=>removeAdminUser(u.id)}>🗑 Supprimer</button>
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div>
            <h1>Logs</h1>

            {logs.map((l: any) => (
              <div
                key={l.id}
                style={styles.card}
              >
                {l.message}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns:
      "240px 1fr",
    background: "radial-gradient(circle at top, #1a1a1a 0%, #050505 55%, #000 100%)",
    color: "#00ffcc",
  },

  loginPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#000",
    color: "#00ffcc",
  },

  sidebar: {
    padding: 20,
    alignContent:"start",
    borderRight:
      "1px solid #00ffcc",
    boxShadow:"0 0 25px rgba(0,255,204,.15)",
    display: "grid",
    gap: 10,
  },

  content: {
    padding: 20,
    backgroundImage:"linear-gradient(rgba(0,255,204,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,.03) 1px, transparent 1px)",
    backgroundSize:"24px 24px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 14,
    marginTop: 20,
  },

  card: {
    backdropFilter:"blur(6px)",
    border:
      "1px solid #00ffcc",
    background:"rgba(15,15,15,.88)",
    boxShadow:"0 0 14px rgba(0,255,204,.12)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  input: {
    padding: 10,
    background: "#000",
    color: "#00ffcc",
    border:
      "1px solid #00ffcc",
    borderRadius: 8,
    margin: 4,
  },

  button: {
    fontWeight:"bold",
    padding:
      "10px 12px",
    background: "#000",
    color: "#00ffcc",
    border:
      "1px solid #00ffcc",
    borderRadius: 8,
    cursor: "pointer",
    transition:"all .2s ease", transform:"translateZ(0)",
    margin: 4,
  },

  hud:{padding:6,border:"1px solid #00ffcc",borderRadius:8,textAlign:"center",fontSize:11,marginBottom:8,maxWidth:170},
  radar:{padding:6,border:"1px dashed #00ffcc",borderRadius:8,textAlign:"center",fontSize:11,opacity:.9,marginBottom:8,letterSpacing:1,maxWidth:170},
  statusBar:{padding:6,border:"1px solid rgba(255,255,255,.12)",borderRadius:8,textAlign:"center",fontSize:10,marginBottom:8,color:"#9fffe8",background:"rgba(0,255,204,.06)",maxWidth:170},

  cardOk:{border:"1px solid #00ffcc"},
  cardWarn:{border:"2px solid orange",background:"rgba(255,165,0,.06)",boxShadow:"0 0 18px rgba(255,165,0,.28)"},
  cardDanger:{border:"2px solid #ff3b3b",background:"rgba(255,0,0,.08)",boxShadow:"0 0 22px rgba(255,0,0,.35)"},

  notif: {
    padding: 12,
    marginBottom: 18,
    border:
      "1px solid red",
    color: "#fff",
    background:
      "rgba(255,0,0,.22)",
    borderRadius: 10,
    fontWeight: "bold",
  },
}