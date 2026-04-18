// /app/cart/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { createOrder } from "@/lib/firestore"

export default function CartPage() {
  const router = useRouter()

  const [cart, setCart] = useState<any[]>([])
  const [priority, setPriority] = useState("low")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cart")

    if (saved) {
      setCart(JSON.parse(saved))
    }
  }, [])

  const itemsTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  )

  const priorityPrice =
    priority === "medium"
      ? 300
      : priority === "high"
      ? 600
      : 0

  const total = itemsTotal + priorityPrice

  async function validateOrder() {
    const user = auth.currentUser

    if (!user) {
      router.push("/login")
      return
    }

    if (cart.length === 0) return

    setLoading(true)

    const pseudo =
      user.email?.replace(
        "@scum.local",
        ""
      ) || "Inconnu"

    await createOrder({
      pseudo,
      total,
      priority,
      items: cart
    })

    localStorage.removeItem("cart")

    router.push("/profile")
  }

  return (
    <main className="page">
      <div className="box">
        <h1>🛒 Validation</h1>

        <div className="items">
          {cart.map((item) => (
            <div
              key={item.id}
              className="row"
            >
              <span>
                {item.name} x
                {item.quantity}
              </span>

              <span>
                {item.price}$
              </span>
            </div>
          ))}
        </div>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(
              e.target.value
            )
          }
        >
          <option value="low">
            Faible (0$)
          </option>

          <option value="medium">
            Moyen (+300$)
          </option>

          <option value="high">
            Haute (+600$)
          </option>
        </select>

        <p>Items: {itemsTotal}$</p>
        <p>
          Supplément:{" "}
          {priorityPrice}$
        </p>

        <h2>Total: {total}$</h2>

        <button
          disabled={loading}
          onClick={validateOrder}
        >
          {loading
            ? "Envoi..."
            : "Valider commande"}
        </button>

        <button
          className="back"
          onClick={() =>
            router.push("/shop")
          }
        >
          Retour boutique
        </button>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background:
            url("/background.jpg")
            center/cover no-repeat;
        }

        .box {
          width: 420px;
          background: rgba(0,0,0,.84);
          border: 1px solid #00ffcc;
          border-radius: 14px;
          padding: 28px;
          color: #00ffcc;
        }

        h1,h2 {
          text-align: center;
        }

        .items {
          max-height: 240px;
          overflow-y: auto;
          margin: 16px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        select,
        button {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: black;
          color: #00ffcc;
          border: 1px solid #00ffcc;
          border-radius: 8px;
        }

        .back {
          font-size: 13px;
        }
      `}</style>
    </main>
  )
}