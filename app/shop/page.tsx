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
  const [bannerUrl, setBannerUrl] = useState("")
  const [page, setPage] = useState(1)
  const [favorites, setFavorites] = useState<string[]>([])
  const [quickView, setQuickView] = useState<any>(null)
    const [soundOn, setSoundOn] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [xp, setXp] = useState(0)
  const [coupon, setCoupon] = useState(0)
  
            const [leadersOpen, setLeadersOpen] = useState(false)
  const [auctionOpen, setAuctionOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    loadWeapons()
    loadPromo()
    loadBanner()

        
    const saved = localStorage.getItem("cart")
    if (saved) setCart(JSON.parse(saved))
    const fav = localStorage.getItem("favorites")
    if (fav) setFavorites(JSON.parse(fav))
    const savedXp = localStorage.getItem("xp")
    if (savedXp) setXp(Number(savedXp))

    const notifyLoop = setInterval(()=>setAlerts([`🔴 Stock mis à jour ${new Date().toLocaleTimeString()}`]),60000)
    const user = auth.currentUser
    if (user?.email) {
      setPseudo(user.email.replace("@scum.local", ""))
    }
    return ()=>{clearInterval(notifyLoop)}
  }, [])

  async function loadWeapons() {
    const snap = await getDocs(collection(db, "weapons"))
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Weapon[]

    setWeapons(data)
  }

  async function loadBanner() {
    const ref = await getDoc(doc(db, "settings", "banner"))
    if (ref.exists()) {
      setBannerUrl(ref.data().url || "")
    }
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

  function toggleFavorite(id:string){
    const next = favorites.includes(id)
      ? favorites.filter(x=>x!==id)
      : [...favorites,id]
    setFavorites(next)
    localStorage.setItem("favorites", JSON.stringify(next))
  }

  function playBeep(){
    if(!soundOn || typeof window==='undefined') return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type='sine'; osc.frequency.value=880
    osc.connect(gain); gain.connect(ctx.destination)
    gain.gain.value=0.03
    osc.start(); osc.stop(ctx.currentTime + 0.08)
  }

    function rarity(stock:number){
    if(stock===0) return '☠️ Légendaire'
    if(stock<=2) return '💎 Rare'
    if(stock<=5) return '✨ Peu commun'
    return '⚙️ Standard'
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
    playBeep()
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
      const gain = Math.max(10, Math.round(total / 100))
      const nextXp = xp + gain
      setXp(nextXp)
      localStorage.setItem("xp", String(nextXp))
      setCoupon(nextXp >= 100 ? 5 : 0)
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

  const perPage = 12

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

    if (sort === "fav") {
      list.sort((a,b)=> (favorites.includes(b.id as string)?1:0) - (favorites.includes(a.id as string)?1:0))
    }

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [weapons, search, category, sort, promoEnabled, promoPercent, favorites])

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

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
          <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
            <button onClick={()=>setSoundOn(!soundOn)}>{soundOn?'🔊 Son ON':'🔇 Son OFF'}</button>
            
            <button onClick={()=>setHistoryOpen(true)}>📜 Historique</button>
                        <button onClick={()=>setLeadersOpen(true)}>🏆 Classement</button>
                        <button onClick={()=>setAuctionOpen(true)}>💰 Enchères</button>
            <button onClick={()=>setInventoryOpen(true)}>🎒 Inventaire</button>
            
            <span>⭐ XP {xp}</span>
            {coupon > 0 && <span>🎁 Coupon -{coupon}%</span>}
          </div>
        </div>

        <div className="actionsTop eliteTop">
          <button className="eliteBtn" onClick={() => router.push("/profile")}><span className="ico">👤</span><span>Profil</span></button>

          <button className="eliteBtn" onClick={handleLogout}><span className="ico">🚪</span><span>Logout</span></button>

          <button className="cartBtn eliteBtn"
            onClick={() => setCartOpen(true)}
          >
            <span className="ico">🛒</span><span>{cart.length}</span>
          </button>
        </div>
      </header>

      {bannerUrl && (
        <div style={{ margin: "18px 0" }}>
          <img
            src={bannerUrl}
            alt="Bannière"
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              borderRadius: 14,
              border: "1px solid #00ffcc",
            }}
          />
        </div>
      )}

      {alerts.map((a,i)=><div key={i} className="promoBar" style={{borderColor:'#00ffcc',background:'rgba(0,255,204,.1)'}}>{a}</div>)}
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

      <section className="tabs">
        {['all','armes','munition','accessoire','soin','vetement'].map((cat)=>(
          <button key={cat} className={category===cat ? 'tab active':'tab'} onClick={()=>setCategory(cat)}>
            {cat==='all'?'Toutes':cat==='armes'?'Armes':cat==='munition'?'Munitions':cat==='accessoire'?'Accessoires':cat==='soin'?'Soins':'Vêtements'}
          </button>
        ))}
      </section>

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
          <option value="armes">Armes</option>
          <option value="munition">Munitions</option>
          <option value="accessoire">Accessoires</option>
          <option value="soin">Soins</option>
          <option value="vetement">Vêtements</option>
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
          <option value="fav">Favoris</option>
        </select>
      </section>

      <section className="grid">
        {paginated.map((weapon) => {
          const finalPrice =
            getPrice(weapon.price)

          return (
            <div
              className={`card ${weapon.stock === 0 ? 'danger' : weapon.stock <= 3 ? 'warn' : 'ok'}`}
              key={weapon.id}
            >
              <img
                src={weapon.image}
                alt=""
              />

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
              <h3>{weapon.name}</h3>
              <button onClick={()=>toggleFavorite(weapon.id as string)}>{favorites.includes(weapon.id as string)?'❤️':'🤍'}</button>
            </div>

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
              <p>{rarity(weapon.stock)}</p>

              {stockBadge(weapon.stock)}

              <button onClick={()=>setQuickView(weapon)} style={{marginBottom:8}}>👁 Aperçu</button>
              
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

      <section className="pager">
        <button disabled={page===1} onClick={()=>setPage(page-1)}>◀</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=>setPage(page+1)}>▶</button>
      </section>

            {auctionOpen && (<div className="drawer" style={{left:'50%',right:'auto',transform:'translateX(-50%)',width:520,height:'auto',maxHeight:'85vh',top:'7vh'}}><h2>💰 Enchères Rares</h2><p>Katana Doré : 12500$</p><p>AWM Elite : 9800$</p><button onClick={()=>setAuctionOpen(false)}>Fermer</button></div>)}
      {inventoryOpen && (<div className="drawer" style={{left:'50%',right:'auto',transform:'translateX(-50%)',width:520,height:'auto',maxHeight:'85vh',top:'7vh'}}><h2>🎒 Inventaire</h2><p>Articles achetés : {xp>0 ? Math.floor(xp/10) : 0}</p><p>Coupons actifs : {coupon}%</p><button onClick={()=>setInventoryOpen(false)}>Fermer</button></div>)}
      
      {leadersOpen && (
        <div className="drawer" style={{left:'50%',right:'auto',transform:'translateX(-50%)',width:520,height:'auto',maxHeight:'85vh',top:'7vh'}}>
          <h2>🏆 Top Acheteurs</h2>
          <p>1. {pseudo} ⭐ {xp}</p>
          <p>2. RaiderX ⭐ 80</p>
          <p>3. Ghost ⭐ 45</p>
          <button onClick={()=>setLeadersOpen(false)}>Fermer</button>
        </div>
      )}

                  {historyOpen && (
        <div className="drawer" style={{left:'50%',right:'auto',transform:'translateX(-50%)',width:520,height:'auto',maxHeight:'85vh',top:'7vh'}}>
          <h2>📜 Historique Client</h2>
          <p>Niveau fidélité : {Math.floor(xp/100)+1}</p>
          <p>XP total : {xp}</p>
          <p>Récompense active : {coupon>0 ? `-${coupon}%` : 'Aucune'}</p>
          <button onClick={()=>setHistoryOpen(false)}>Fermer</button>
        </div>
      )}

      {quickView && (
        <div className="drawer" style={{left:'50%',right:'auto',transform:'translateX(-50%)',width:520,height:'auto',maxHeight:'90vh',top:'5vh'}}>
          <h2>{quickView.name}</h2>
          <img src={quickView.image} style={{width:'100%',maxHeight:260,objectFit:'contain'}} />
          <p>Prix : {getPrice(quickView.price)}$</p>
          <p>Stock : {quickView.stock}</p>
          <button onClick={()=>addToCart(quickView)}>Ajouter au panier</button>
          <button onClick={()=>setQuickView(null)}>Fermer</button>
        </div>
      )}

      {cartOpen && (
        <div className="drawer">
          <h2>🛒 Panier Premium</h2>

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

          <h3>Total : {Math.round(total * (1 - coupon/100))}$</h3>

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
            linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),
            url("/background.jpg") center center / contain no-repeat fixed;
          background-color:#000;
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .actionsTop { align-items:center; }
        .actionsTop,

        .filters,
        .tabs {
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

        .tabs{margin:18px 0;display:flex;gap:10px;flex-wrap:wrap}
        .tab{background:#000;border:1px solid #00ffcc;color:#00ffcc;padding:10px 14px;border-radius:10px;cursor:pointer}
        .tab.active{box-shadow:0 0 14px rgba(0,255,204,.35);background:rgba(0,255,204,.08)}

        .grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit,minmax(220px,1fr));
          gap: 20px;
        }

        .card,
        .card:hover{transform:translateY(-3px);transition:.2s}

        .drawer {
          background: rgba(0,0,0,.78);
          border: 1px solid #00ffcc;
          border-radius: 14px;
          padding: 15px;
          text-align: center;
        }

        .card.ok{border-color:#00ffcc}
        .card.warn{border-color:orange;box-shadow:0 0 16px rgba(255,165,0,.18)}
        .card.danger{border-color:#ff3b3b;box-shadow:0 0 18px rgba(255,0,0,.22)}

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

        .pager{display:flex;justify-content:center;align-items:center;gap:12px;margin:18px 0;flex-wrap:wrap}
        .eliteTop{gap:14px}
        .actionsTop button,.eliteBtn{min-width:72px;height:72px;padding:10px 12px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;font-size:13px;line-height:1.1;border-radius:16px;background:linear-gradient(180deg,rgba(0,255,204,.08),rgba(0,0,0,.92));box-shadow:0 0 14px rgba(0,255,204,.14), inset 0 0 10px rgba(255,255,255,.03);transition:.2s ease} 
        .eliteBtn:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 0 20px rgba(0,255,204,.28)}
        .eliteBtn .ico{font-size:20px}
        .actionsTop .cartBtn{min-width:72px;width:72px;position:relative}
        .actionsTop .cartBtn::after{content:'';position:absolute;inset:6px;border:1px solid rgba(0,255,204,.18);border-radius:12px}
        @media (max-width:768px){.actionsTop button{min-width:52px;height:52px;font-size:12px;padding:6px}.actionsTop .cartBtn{width:52px}}
        .pager span{padding:8px 12px;border:1px solid #00ffcc;border-radius:8px}

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
