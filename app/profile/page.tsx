// /app/profile/page.tsx

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

import { auth, logout } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { getOrders } from "@/lib/firestore"
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from "firebase/firestore"

export default function ProfilePage() {
  const router = useRouter()

  const [orders, setOrders] =
    useState<any[]>([])

  const [pseudo, setPseudo] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [notif, setNotif] =
    useState("")
  const [replies, setReplies] =
    useState<any[]>([])
  const audioRef = useRef<any>(null)
  const [buybacks, setBuybacks] = useState<any[]>([])
  const [sellItem, setSellItem] = useState("")
  const [sellQty, setSellQty] = useState("1")
  const [sellPrice, setSellPrice] = useState("0")
  const SHOP_ITEMS:any[] = [
    { name: "AK47", price: 20000 },
    { name: "M4A1", price: 25000 },
    { name: "MP5", price: 14000 },
    { name: "9mm Ammo", price: 500 },
  ]

  useEffect(() => {
    loadData()

    const t =
      setInterval(
        loadData,
        5000
      )

    return () =>
      clearInterval(t)
  }, [])

  async function loadData() {
    const user =
      auth.currentUser

    if (!user) {
      router.push("/login")
      return
    }

    const name =
      user.email?.replace(
        "@scum.local",
        ""
      ) || "Inconnu"

    setPseudo(name)
    setEmail(
      user.email || ""
    )

    const data =
      await getOrders()

    const mine =
      data.filter(
        (x: any) =>
          x.pseudo ===
          name
      )

    const oldDone =
      orders.filter(
        (x) =>
          x.status ===
          "done"
      ).length

    const newDone =
      mine.filter(
        (x: any) =>
          x.status ===
          "done"
      ).length

    if (
      newDone >
        oldDone &&
      orders.length > 0
    ) {
      setNotif(
        "🔔 Votre commande est prête !"
      )

      setTimeout(
        () =>
          setNotif(
            ""
          ),
        5000
      )
    }

    const q = query(collection(db,"privateReplies"), where("pseudo","==",name))
    const snap = await getDocs(q)
    const msgs = snap.docs.map((d:any)=>({id:d.id,...d.data()})).reverse()
    if(msgs.length > replies.length && replies.length > 0){
      try { audioRef.current?.play() } catch {}
    }
    setReplies(msgs)

    const unread = msgs.filter((x:any)=>!x.read).length
    if(unread > 0){
      setNotif(`🔔 ${unread} message(s) du staff`)
    }

    for(const m of msgs){
      if(!m.read){
        await updateDoc(doc(db,"privateReplies",m.id),{read:true})
      }
    }

    const buySnap = await getDocs(query(collection(db,"buybackRequests"), where("pseudo","==",name)))
    setBuybacks(buySnap.docs.map((d:any)=>({id:d.id,...d.data()})).reverse())

    setOrders(mine)
    setLoading(false)
  }

  async function sendSellRequest(){
    if(!sellItem || Number(sellQty) <= 0) return
    const selected = SHOP_ITEMS.find((x:any)=>x.name===sellItem)
    const autoUnitPrice = Math.round(Number(selected?.price || 0) * 0.5)
    await addDoc(collection(db,"buybackRequests"),{
      pseudo,
      item:sellItem,
      quantity:Number(sellQty),
      unitPrice:autoUnitPrice,
      total:Number(sellQty) * autoUnitPrice,
      status:"pending",
      createdAt:Date.now(),
    })
    setSellItem("")
    setSellQty("1")
    setSellPrice("0")
    setNotif("📦 Offre envoyée au staff")
  }

  async function handleLogout() {
    await logout()
    router.push("/login")
  }

  function formatDate(
    value: any
  ) {
    if (!value)
      return "..."

    try {
      if (
        value.seconds
      ) {
        return new Date(
          value.seconds *
            1000
        ).toLocaleString(
          "fr-FR"
        )
      }

      return new Date(
        value
      ).toLocaleString(
        "fr-FR"
      )
    } catch {
      return "..."
    }
  }

  function statusLabel(
    value: string
  ) {
    if (
      value ===
      "done"
    ) {
      return (
        <span className="done">
          ✅ Livrée
        </span>
      )
    }

    return (
      <span className="wait">
        ⏳ En attente
      </span>
    )
  }

  return (
    <main className="page">
      <audio ref={audioRef} preload="auto">
        <source src="/notif.mp3" type="audio/mpeg" />
      </audio>
      <div className="box">
        {/* HEADER */}
        <div className="head">
          <div>
            <h1>
              👤{" "}
              {pseudo}
            </h1>

            <small>
              {email}
            </small>
          </div>

          <button
            className="mini"
            onClick={
              handleLogout
            }
          >
            🚪
          </button>
        </div>

        {notif && (
          <div className="notif">
            {notif}
          </div>
        )}

        {/* STATS */}
        <div className="stats">
          <div className="stat">
            📦{" "}
            {
              orders.length
            }
          </div>

          <div className="stat">
            💰{" "}
            {orders.reduce(
              (
                sum,
                o
              ) =>
                sum +
                Number(
                  o.total ||
                    0
                ),
              0
            )}
            $
          </div>

          <div className="stat">
            ✅{" "}
            {
              orders.filter(
                (
                  o
                ) =>
                  o.status ===
                  "done"
              ).length
            }
          </div>
        </div>

        <h2>♻️ Vente de Stock au Shop</h2>
        <div className="card">
          <select value={sellItem} onChange={(e)=>setSellItem(e.target.value)}>
            <option value="">Choisir un item</option>
            {SHOP_ITEMS.map((it:any)=><option key={it.name} value={it.name}>{it.name}</option>)}
          </select>
          <input value={sellQty} onChange={(e)=>setSellQty(e.target.value)} placeholder="Quantité" />
          <p>💵 Prix reprise unité : {Math.round(Number(SHOP_ITEMS.find((x:any)=>x.name===sellItem)?.price || 0) * 0.5)}$</p>
          <p>💰 Total : {Number(sellQty||0) * Math.round(Number(SHOP_ITEMS.find((x:any)=>x.name===sellItem)?.price || 0) * 0.5)}$</p>
          <button onClick={sendSellRequest}>Envoyer offre</button>
        </div>

        <div className="list">
          {buybacks.map((b:any)=>(
            <div key={b.id} className="card">
              <div className="rowTop"><strong>{b.item} x{b.quantity}</strong><span>{b.status}</span></div>
              <p>💰 {b.total}$</p>
            </div>
          ))}
        </div>

        <h2>📩 Messages du Staff</h2>
        <div className="list">
          {replies.length === 0 && <p>Aucun message</p>}
          {replies.map((r:any)=>(
            <div key={r.id} className="card">
              <div className="rowTop"><strong>👮 {r.admin}</strong><button className="mini">🔴</button></div>
              <p>{r.message}</p>
              <small>{formatDate(r.createdAt)}</small>
            </div>
          ))}
        </div>

        <h2>
          Mes commandes
        </h2>

        {loading ? (
          <p>
            Chargement...
          </p>
        ) : (
          <div className="list">
            {orders.length ===
              0 && (
              <p>
                Aucune
                commande
              </p>
            )}

            {orders.map(
              (
                o,
                index
              ) => (
                <div
                  key={
                    o.id
                  }
                  className="card"
                >
                  <div className="rowTop">
                    <strong>
                      Commande #
                      {index +
                        1}
                    </strong>

                    {statusLabel(
                      o.status
                    )}
                  </div>

                  <p>
                    💰{" "}
                    {
                      o.total
                    }
                    $
                  </p>

                  <p>
                    ⚡{" "}
                    {
                      o.priority
                    }
                  </p>

                  <p>
                    🕒{" "}
                    {formatDate(
                      o.createdAt
                    )}
                  </p>

                  {o.items
                    ?.length >
                    0 && (
                    <div className="items">
                      {o.items.map(
                        (
                          item: any,
                          i: number
                        ) => (
                          <div
                            key={
                              i
                            }
                          >
                            {
                              item.name
                            }{" "}
                            x
                            {
                              item.quantity
                            }
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        <div className="actions">
          <button
            onClick={() =>
              router.push(
                "/shop"
              )
            }
          >
            🛒 Boutique
          </button>

          <button
            onClick={() =>
              router.push(
                "/cart"
              )
            }
          >
            📦 Panier
          </button>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background:
            radial-gradient(circle at top, rgba(0,255,204,0.08), transparent 35%),
            url("/background.jpg") center/cover no-repeat;
        }

        .box {
          width: 560px;
          max-width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          background: linear-gradient(180deg, rgba(0,0,0,0.88), rgba(5,18,18,0.9));
          box-shadow: 0 0 30px rgba(0,255,204,0.18);
          border: 1px solid
            #00ffcc;
          border-radius: 18px;
          padding: 28px;
          backdrop-filter: blur(8px);
          color: #00ffcc;
        }

        .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        h1,
        h2 {
          margin: 0;
          text-shadow: 0 0 12px rgba(0,255,204,0.25);
        }

        small {
          opacity: 0.8;
        }

        .mini {
          width: 48px;
          margin: 0;
        }

        .notif {
          margin-top: 14px;
          padding: 12px;
          text-align: center;
          border: 1px solid lime;
          box-shadow: 0 0 18px rgba(0,255,0,0.18);
          color: lime;
          border-radius: 12px;
          background: rgba(
            0,
            255,
            0,
            0.12
          );
          font-weight: bold;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              1fr
            );
          gap: 10px;
          margin: 20px 0;
        }

        .stat {
          text-align: center;
          border: 1px solid
            #00ffcc;
          border-radius: 10px;
          padding: 10px;
          background: rgba(0,0,0,0.72);
          box-shadow: inset 0 0 12px rgba(0,255,204,0.08);
        }

        .list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card {
          transition: transform .18s ease, box-shadow .18s ease;
          border: 1px solid
            #00ffcc;
          border-radius: 10px;
          padding: 14px;
          background: rgba(0,0,0,0.74);
          box-shadow: 0 0 16px rgba(0,255,204,0.10);
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 22px rgba(0,255,204,0.22);
        }

        .rowTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .items {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );
          font-size: 14px;
          display: grid;
          gap: 4px;
        }

        .done {
          color: lime;
        }

        .wait {
          color: orange;
        }

        .actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: #00ffcc;
          border: 1px solid
            #00ffcc;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all .18s ease;
        }

        button:hover {
          background: #001a16;
          box-shadow: 0 0 14px rgba(0,255,204,0.24);
        }

        select, input {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          background: #000;
          color: #00ffcc;
          border: 1px solid #00ffcc;
          border-radius: 10px;
        }

        @media (max-width: 600px) {
          .stats {
            grid-template-columns:
              1fr;
          }

          .actions {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>
    </main>
  )
}