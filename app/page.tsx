"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [items, setItems] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [pseudo, setPseudo] = useState("")

  useEffect(() => {
    const base = [
      { id: 1, name: "MK18", price: 10000, stock: 5 },
      { id: 2, name: "M85", price: 100000, stock: 1 }
    ]

    setItems(base)
  }, [])

  const addToCart = (item: any) => {
    setCart([...cart, item])
  }

  const total = cart.reduce((acc, item) => acc + item.price, 0)

  return (
    <main className="container">
      <h1>🔥 SAUCE SANGUINE ARMORY 🔥</h1>

      <input
        placeholder="Pseudo joueur"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />

      <div className="card">
        <h2>🛒 Panier</h2>
        <p>Total : {total}</p>
        <button>Commander</button>
      </div>

      <div className="card">
        <h2>🔫 Armes</h2>

        {items.map((item) => (
          <div key={item.id}>
            {item.name} - 💰 {item.price} - 📦 {item.stock}
            <button onClick={() => addToCart(item)}>Acheter</button>
          </div>
        ))}
      </div>
    </main>
  )
}