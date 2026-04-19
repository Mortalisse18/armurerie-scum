// /app/shop/page.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getDocs, collection, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth, logout } from "@/lib/auth"
import { createOrderWithStock } from "@/lib/firestore"

import type { Weapon } from "@/types/weapon"
import type { CartItem } from "@/types/cart"

export default function ShopPage() {
  const router = useRouter()

  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("default")
  const [priority, setPriority] = useState("low")
  const [cartOpen, setCartOpen] = useState(false)
  const [notif, setNotif] = useState("")
  const [pseudo, setPseudo] = useState("Joueur")
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoPercent, setPromoPercent] = useState(0)

  useEffect(() => {
    loadWeapons()
    loadPromo()

    const saved = localStorage.getItem("cart")
    if (saved) setCart(JSON.parse(saved))

    const user = auth.currentUser
    if (user?.email) {
      setPseudo(user.email.replace("@scum.local", ""))
    }
  }, [])

  async function loadWeapons() {
    const snap = await getDocs(collection(db, "weapons"))
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Weapon[]

    setWeapons(data)
  }

  async function loadPromo() {
    const ref = await getDoc(doc(db, "settings", "promo"))

    if (ref.exists()) {
      const data: any = ref.data()
      setPromoEnabled(Boolean(data.enabled))
      setPromoPercent(Number(data.percent || 0))
    }
  }

  function getPrice(price: number) {
    if (!promoEnabled) return price
    return Math.round(price * (1 - promoPercent / 100))
  }

  function saveCart(next: CartItem[]) {
    setCart(next)
    localStorage.setItem("cart", JSON.stringify(next))
  }

  function notify(text: string) {
    setNotif(text)
    setTimeout(() => setNotif(""), 1800)
  }

  function addToCart(item: Weapon) {
    if (item.stock <= 0) return

    const found = cart.find((x) => x.id === item.id)
    const finalPrice = getPrice(item.price)

    let next: CartItem[]

    if (found) {
      next = cart.map((x) =>
        x.id === item.id
          ? { ...x, quantity: x.quantity + 1 }
          : x
      )
    } else {
      next = [
        ...cart,
        {
          ...item,
          price: finalPrice,
          quantity: 1,
        },
      ]
    }

    saveCart(next)
    notify(`${item.name} ajouté`)
  }

  function plusQty(id: string) {
    saveCart(
      cart.map((x) =>
        x.id === id
          ? { ...x, quantity: x.quantity + 1 }
          : x
      )
    )
  }

  function minusQty(id: string) {
    saveCart(
      cart
        .map((x) =>
          x.id === id
            ? { ...x, quantity: x.quantity - 1 }
            : x
        )
        .filter((x) => x.quantity > 0)
    )
  }

  function removeItem(id: string) {
    saveCart(cart.filter((x) => x.id !== id))
  }

  function clearCart() {
    saveCart([])
  }

  async function validateOrder() {
    if (cart.length === 0) return

    try {
      await createOrderWithStock({
        pseudo,
        items: cart,
        priority,
        total,
      })

      clearCart()
      setCartOpen(false)
      notify("Commande validée ✅")
      loadWeapons()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleLogout() {
    await logout()
    router.push("/login")
  }

  const filtered = useMemo(() => {
    let list = [...weapons]

    if (search.trim()) {
      list = list.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category !== "all") {
      list = list.filter((w) =>
        w.category?.toLowerCase().includes(category)
      )
    }

    if (sort === "price-asc") {
      list.sort((a, b) => getPrice(a.price) - getPrice(b.price))
    }

    if (sort === "price-desc") {
      list.sort((a, b) => getPrice(b.price) - getPrice(a.price))
    }

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [weapons, search, category, sort, promoEnabled, promoPercent])

  const itemsTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  )

  const priorityPrice =
    priority === "medium"
      ? 300
      : priority === "high"
      ? 600
      : 0

  const total = itemsTotal + priorityPrice

  function stockBadge(stock: number) {
    if (stock === 0)
      return <span className="badge red">Rupture</span>

    if (stock <= 3)
      return (
        <span className="badge orange">
          Stock faible
        </span>
      )

    return (
      <span className="badge green">
        En stock
      </span>
    )
  }

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>🛒 Boutique Armurerie</h1>
          <small>Bienvenue {pseudo}</small>
        </div>

        <div className="actionsTop">
          <button onClick={() => router.push("/profile")}>
            👤 Profil
          </button>

          <button onClick={handleLogout}>
            🚪 Logout
          </button>

          <button
            className="cartBtn"
            onClick={() => setCartOpen(true)}
          >
            🛒 {cart.length}
          </button>
        </div>
      </header>

      {notif && (
        <div className="promoBar green">
          {notif}
        </div>
      )}

      {promoEnabled && (
        <div className="promoBar">
          🔥 PROMO ACTIVE : -{promoPercent}%
        </div>
      )}

      <section className="filters">
        <input
          placeholder="Recherche..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="all">Toutes</option>
          <option value="assaut">Assaut</option>
          <option value="sniper">Sniper</option>
          <option value="soin">Soins</option>
        </select>

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <option value="default">Tri</option>
          <option value="price-asc">
            Prix ↑
          </option>
          <option value="price-desc">
            Prix ↓
          </option>
          <option value="name">Nom</option>
        </select>
      </section>

      <section className="grid">
        {filtered.map((weapon) => {
          const finalPrice =
            getPrice(weapon.price)

          return (
            <div
              className="card"
              key={weapon.id}
            >
              <img
                src={weapon.image}
                alt=""
              />

              <h3>{weapon.name}</h3>

              {promoEnabled ? (
                <>
                  <p className="oldPrice">
                    {weapon.price}$
                  </p>
                  <p className="promoPrice">
                    {finalPrice}$
                  </p>
                </>
              ) : (
                <p>{weapon.price}$</p>
              )}

              <p>Stock : {weapon.stock}</p>

              {stockBadge(weapon.stock)}

              {weapon.stock > 0 ? (
                <button
                  onClick={() =>
                    addToCart(weapon)
                  }
                >
                  Ajouter
                </button>
              ) : (
                <button disabled>
                  Indisponible
                </button>
              )}
            </div>
          )
        })}
      </section>

      {cartOpen && (
        <div className="drawer">
          <h2>🛒 Panier</h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="line"
            >
              <span>
                {item.name}
              </span>

              <div>
                <button
                  onClick={() =>
                    minusQty(item.id)
                  }
                >
                  -
                </button>

                <span className="qty">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    plusQty(item.id)
                  }
                >
                  +
                </button>
              </div>

              <button
                onClick={() =>
                  removeItem(item.id)
                }
              >
                ✖
              </button>
            </div>
          ))}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
          >
            <option value="low">
              Standard
            </option>
            <option value="medium">
              Prioritaire +300$
            </option>
            <option value="high">
              Urgent +600$
            </option>
          </select>

          <h3>Total : {total}$</h3>

          <button
            onClick={validateOrder}
          >
            ✅ Valider commande
          </button>

          <button
            onClick={() =>
              setCartOpen(false)
            }
          >
            Fermer
          </button>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 20px;
          color: #00ffcc;
          background:
            url("/background.jpg")
              center/cover
              no-repeat;
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .actionsTop,
        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .promoBar {
          margin: 18px 0;
          padding: 12px;
          text-align: center;
          border: 1px solid red;
          color: #fff;
          background: rgba(255,0,0,.25);
          border-radius: 10px;
        }

        .promoBar.green {
          border-color: lime;
          background: rgba(0,255,0,.15);
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit,minmax(220px,1fr));
          gap: 20px;
        }

        .card,
        .drawer {
          background: rgba(0,0,0,.78);
          border: 1px solid #00ffcc;
          border-radius: 14px;
          padding: 15px;
          text-align: center;
        }

        .card img {
          width: 100%;
          height: 160px;
          object-fit: contain;
        }

        .oldPrice {
          text-decoration: line-through;
          opacity: .7;
        }

        .promoPrice {
          color: lime;
          font-size: 24px;
          font-weight: bold;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          margin: 6px 0;
          border-radius: 8px;
          font-size: 12px;
          border: 1px solid currentColor;
        }

        .green { color: lime; }
        .orange { color: orange; }
        .red { color: red; }

        input,
        select,
        button {
          background: black;
          color: #00ffcc;
          border: 1px solid #00ffcc;
          padding: 8px;
          border-radius: 8px;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 420px;
          height: 100vh;
          overflow: auto;
          z-index: 99;
        }

        .line {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          gap: 8px;
          align-items: center;
        }

        .qty {
          padding: 0 10px;
        }
      `}</style>
    </main>
  )
}