// /app/admin/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import {
  getOrders,
  getLogs,
  addLog,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/firestore"

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

  const [promoEnabled, setPromoEnabled] =
    useState(false)

  const [promo, setPromo] =
    useState(10)

  const [editId, setEditId] =
    useState("")

  const [name, setName] =
    useState("")

  const [price, setPrice] =
    useState("")

  const [category, setCategory] =
    useState("")

  const [image, setImage] =
    useState("")

  const [stock, setStock] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [notif, setNotif] =
    useState("")

  const [lastPending, setLastPending] =
    useState(0)

  useEffect(() => {
    if (
      localStorage.getItem(
        "admin-auth"
      ) === "ok"
    ) {
      setAuthOk(true)
    }
  }, [])

  useEffect(() => {
    if (!authOk) return

    loadAll()

    const t =
      setInterval(
        loadAll,
        5000
      )

    return () =>
      clearInterval(t)
  }, [authOk])

  async function loadAll() {
    const allOrders =
      (await getOrders()) ||
      []

    setOrders(allOrders)

    setLogs(
      (await getLogs()) ||
        []
    )

    const pendingCount =
      allOrders.filter(
        (o) =>
          o.status !==
          "done"
      ).length

    if (
      pendingCount >
        lastPending &&
      lastPending > 0
    ) {
      setNotif(
        "🔔 Nouvelle commande reçue !"
      )

      setTimeout(
        () =>
          setNotif(""),
        5000
      )
    }

    setLastPending(
      pendingCount
    )

    const snap =
      await getDocs(
        collection(
          db,
          "weapons"
        )
      )

    setItems(
      snap.docs.map(
        (d) => ({
          id: d.id,
          ...d.data(),
        })
      )
    )

    const ref =
      await getDoc(
        doc(
          db,
          "settings",
          "promo"
        )
      )

    if (ref.exists()) {
      const data: any =
        ref.data()

      setPromoEnabled(
        Boolean(
          data.enabled
        )
      )

      setPromo(
        Number(
          data.percent ||
            10
        )
      )
    }
  }

  function connect() {
    if (
      login ===
        "admin" &&
      pass ===
        "Armory781228"
    ) {
      localStorage.setItem(
        "admin-auth",
        "ok"
      )

      setAuthOk(true)
    } else {
      alert(
        "Accès refusé"
      )
    }
  }

  function logout() {
    localStorage.removeItem(
      "admin-auth"
    )

    location.reload()
  }

  async function savePromo() {
    await setDoc(
      doc(
        db,
        "settings",
        "promo"
      ),
      {
        enabled:
          promoEnabled,
        percent:
          promo,
      }
    )

    await addLog(
      "Promo modifiée"
    )

    alert(
      "Promo sauvegardée"
    )
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
      price:
        Number(price),
      category,
      image,
      stock:
        Number(stock),
    }

    if (editId) {
      await updateDoc(
        doc(
          db,
          "weapons",
          editId
        ),
        payload
      )

      await addLog(
        "Item modifié"
      )
    } else {
      await addDoc(
        collection(
          db,
          "weapons"
        ),
        payload
      )

      await addLog(
        "Item ajouté"
      )
    }

    resetForm()
    loadAll()
  }

  function editItem(
    it: any
  ) {
    setEditId(it.id)
    setName(it.name)
    setPrice(
      String(
        it.price
      )
    )
    setCategory(
      it.category
    )
    setImage(it.image)
    setStock(
      String(
        it.stock
      )
    )
  }

  async function removeItem(
    id: string
  ) {
    await deleteDoc(
      doc(
        db,
        "weapons",
        id
      )
    )

    await addLog(
      "Item supprimé"
    )

    loadAll()
  }

  const stats =
    useMemo(() => {
      const totalMoney =
        orders.reduce(
          (
            s,
            o
          ) =>
            s +
            Number(
              o.total ||
                0
            ),
          0
        )

      const pending =
        orders.filter(
          (o) =>
            o.status !==
            "done"
        ).length

      return {
        totalMoney,
        pending,
      }
    }, [orders])

  const filteredItems =
    items.filter(
      (x) =>
        x.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )

  const topClient =
    (() => {
      const map: any =
        {}

      orders.forEach(
        (o) => {
          const n =
            o.pseudo ||
            "Inconnu"

          map[n] =
            (map[n] ||
              0) + 1
        }
      )

      const sorted =
        Object.entries(
          map
        ).sort(
          (
            a: any,
            b: any
          ) =>
            b[1] -
            a[1]
        )

      return (
        sorted[0]?.[0] ||
        "Aucun"
      )
    })()

  const todayOrders =
    orders.filter(
      (o) => {
        try {
          const d =
            new Date(
              o.createdAt
                ?.seconds
                ? o
                    .createdAt
                    .seconds *
                    1000
                : o.createdAt
            )

          return (
            d.toDateString() ===
            new Date().toDateString()
          )
        } catch {
          return false
        }
      }
    ).length

  const criticalStock =
    items.filter(
      (i) =>
        Number(
          i.stock
        ) <= 3
    ).length

  function stockBadge(
    v: number
  ) {
    if (v === 0)
      return "Rupture"

    if (v <= 3)
      return "Faible"

    return "OK"
  }

  if (!authOk) {
    return (
      <main
        style={
          styles.loginPage
        }
      >
        <div
          style={
            styles.card
          }
        >
          <h1>
            🔐 Admin
          </h1>

          <input
            style={
              styles.input
            }
            placeholder="Login"
            value={login}
            onChange={(
              e
            ) =>
              setLogin(
                e.target
                  .value
              )
            }
          />

          <input
            style={
              styles.input
            }
            type="password"
            placeholder="Code"
            value={pass}
            onChange={(
              e
            ) =>
              setPass(
                e.target
                  .value
              )
            }
          />

          <button
            style={
              styles.button
            }
            onClick={
              connect
            }
          >
            Connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main
      style={styles.page}
    >
      <aside
        style={
          styles.sidebar
        }
      >
        <h2>
          ⚙ ADMIN
        </h2>

        <button
          style={
            styles.button
          }
          onClick={() =>
            setTab(
              "dashboard"
            )
          }
        >
          📊 Dashboard
        </button>

        <button
          style={
            styles.button
          }
          onClick={() =>
            setTab(
              "orders"
            )
          }
        >
          📦 Commandes
          {stats.pending >
            0 &&
            ` (${stats.pending})`}
        </button>

        <button
          style={
            styles.button
          }
          onClick={() =>
            setTab(
              "items"
            )
          }
        >
          🔫 Boutique
        </button>

        <button
          style={
            styles.button
          }
          onClick={() =>
            setTab(
              "promo"
            )
          }
        >
          💸 Promotions
        </button>

        <button
          style={
            styles.button
          }
          onClick={() =>
            setTab(
              "logs"
            )
          }
        >
          📜 Logs
        </button>

        <button
          style={
            styles.button
          }
          onClick={
            logout
          }
        >
          🚪 Logout
        </button>
      </aside>

      <section
        style={
          styles.content
        }
      >
        {notif && (
          <div
            style={
              styles.notif
            }
          >
            {notif}
          </div>
        )}

        {tab ===
          "dashboard" && (
          <div>
            <h1>
              Dashboard
              Luxe
            </h1>

            <div
              style={
                styles.grid
              }
            >
              <div
                style={
                  styles.card
                }
              >
                <h3>
                  💰 Chiffre
                  total
                </h3>
                <p>
                  {
                    stats.totalMoney
                  }
                  $
                </p>
              </div>

              <div
                style={
                  styles.card
                }
              >
                <h3>
                  📦 Total
                  commandes
                </h3>
                <p>
                  {
                    orders.length
                  }
                </p>
              </div>

              <div
                style={
                  styles.card
                }
              >
                <h3>
                  ⏳ En
                  attente
                </h3>
                <p>
                  {
                    stats.pending
                  }
                </p>
              </div>

              <div
                style={
                  styles.card
                }
              >
                <h3>
                  📅
                  Aujourd’hui
                </h3>
                <p>
                  {
                    todayOrders
                  }
                </p>
              </div>

              <div
                style={
                  styles.card
                }
              >
                <h3>
                  🏆 Top
                  client
                </h3>
                <p>
                  {
                    topClient
                  }
                </p>
              </div>

              <div
                style={
                  styles.card
                }
              >
                <h3>
                  ⚠ Stock
                  critique
                </h3>
                <p>
                  {
                    criticalStock
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {tab ===
          "orders" && (
          <div>
            <h1>
              Commandes
            </h1>

            {orders.map(
              (o) => (
                <div
                  key={
                    o.id
                  }
                  style={
                    styles.card
                  }
                >
                  <b>
                    {
                      o.pseudo
                    }
                  </b>{" "}
                  —{" "}
                  {
                    o.total
                  }
                  $ —{" "}
                  {
                    o.status
                  }

                  <div
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <button
                      style={
                        styles.button
                      }
                      onClick={() =>
                        updateOrderStatus(
                          o.id,
                          "done"
                        )
                      }
                    >
                      ✔
                      Livrée
                    </button>

                    <button
                      style={
                        styles.button
                      }
                      onClick={() =>
                        deleteOrder(
                          o.id
                        )
                      }
                    >
                      ✖
                      Supprimer
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {tab ===
          "items" && (
          <div>
            <h1>
              Boutique
              CRUD
            </h1>

            <input
              style={
                styles.input
              }
              placeholder="Recherche..."
              value={
                search
              }
              onChange={(
                e
              ) =>
                setSearch(
                  e.target
                    .value
                )
              }
            />

            <div
              style={
                styles.card
              }
            >
              <input
                style={
                  styles.input
                }
                placeholder="Nom"
                value={
                  name
                }
                onChange={(
                  e
                ) =>
                  setName(
                    e.target
                      .value
                  )
                }
              />

              <input
                style={
                  styles.input
                }
                placeholder="Prix"
                value={
                  price
                }
                onChange={(
                  e
                ) =>
                  setPrice(
                    e.target
                      .value
                  )
                }
              />

              <input
                style={
                  styles.input
                }
                placeholder="Catégorie"
                value={
                  category
                }
                onChange={(
                  e
                ) =>
                  setCategory(
                    e.target
                      .value
                  )
                }
              />

              <input
                style={
                  styles.input
                }
                placeholder="Image URL"
                value={
                  image
                }
                onChange={(
                  e
                ) =>
                  setImage(
                    e.target
                      .value
                  )
                }
              />

              <input
                style={
                  styles.input
                }
                placeholder="Stock"
                value={
                  stock
                }
                onChange={(
                  e
                ) =>
                  setStock(
                    e.target
                      .value
                  )
                }
              />

              <button
                style={
                  styles.button
                }
                onClick={
                  saveItem
                }
              >
                {editId
                  ? "💾 Modifier"
                  : "➕ Ajouter"}
              </button>

              {editId && (
                <button
                  style={
                    styles.button
                  }
                  onClick={
                    resetForm
                  }
                >
                  Annuler
                </button>
              )}
            </div>

            {filteredItems.map(
              (
                it
              ) => (
                <div
                  key={
                    it.id
                  }
                  style={
                    styles.card
                  }
                >
                  <b>
                    {
                      it.name
                    }
                  </b>{" "}
                  —{" "}
                  {
                    it.price
                  }
                  $ —
                  Stock{" "}
                  {
                    it.stock
                  }{" "}
                  (
                  {stockBadge(
                    it.stock
                  )}
                  )

                  <div
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <button
                      style={
                        styles.button
                      }
                      onClick={() =>
                        editItem(
                          it
                        )
                      }
                    >
                      ✏
                      Modifier
                    </button>

                    <button
                      style={
                        styles.button
                      }
                      onClick={() =>
                        removeItem(
                          it.id
                        )
                      }
                    >
                      🗑
                      Supprimer
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {tab ===
          "promo" && (
          <div>
            <h1>
              Promotions
            </h1>

            <label>
              <input
                type="checkbox"
                checked={
                  promoEnabled
                }
                onChange={(
                  e
                ) =>
                  setPromoEnabled(
                    e.target
                      .checked
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
                style={
                  styles.input
                }
                type="number"
                min="0"
                max="20"
                value={
                  promo
                }
                onChange={(
                  e
                ) =>
                  setPromo(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
              />

              <button
                style={
                  styles.button
                }
                onClick={
                  savePromo
                }
              >
                💾
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {tab ===
          "logs" && (
          <div>
            <h1>
              Logs
            </h1>

            {logs.map(
              (l) => (
                <div
                  key={
                    l.id
                  }
                  style={
                    styles.card
                  }
                >
                  {
                    l.message
                  }
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  )
}

const styles: any = {
  page: {
    minHeight:
      "100vh",
    display:
      "grid",
    gridTemplateColumns:
      "240px 1fr",
    background:
      "#000",
    color:
      "#00ffcc",
  },

  loginPage: {
    minHeight:
      "100vh",
    display:
      "grid",
    placeItems:
      "center",
    background:
      "#000",
    color:
      "#00ffcc",
  },

  sidebar: {
    padding: 20,
    borderRight:
      "1px solid #00ffcc",
    display:
      "grid",
    gap: 10,
  },

  content: {
    padding: 20,
  },

  grid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 14,
    marginTop: 20,
  },

  card: {
    border:
      "1px solid #00ffcc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  input: {
    padding: 10,
    background:
      "#000",
    color:
      "#00ffcc",
    border:
      "1px solid #00ffcc",
    borderRadius: 8,
    margin: 4,
  },

  button: {
    padding:
      "10px 12px",
    background:
      "#000",
    color:
      "#00ffcc",
    border:
      "1px solid #00ffcc",
    borderRadius: 8,
    cursor:
      "pointer",
    margin: 4,
  },

  notif: {
    padding: 12,
    marginBottom: 18,
    border:
      "1px solid red",
    color: "#fff",
    background:
      "rgba(255,0,0,.22)",
    borderRadius: 10,
    fontWeight:
      "bold",
  },
}