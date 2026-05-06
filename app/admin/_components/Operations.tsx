import { styles } from "./styles"

export function Promotions({
  enabled,
  percent,
  onEnabled,
  onPercent,
  onSave,
}: {
  enabled: boolean
  percent: number
  onEnabled: (value: boolean) => void
  onPercent: (value: number) => void
  onSave: () => void
}) {
  return (
    <div>
      <h1>Promotions</h1>
      <label>
        <input type="checkbox" checked={enabled} onChange={(event) => onEnabled(event.target.checked)} /> Activer
      </label>

      <div style={{ marginTop: 10 }}>
        <input style={styles.input} type="number" min="0" max="20" value={percent} onChange={(event) => onPercent(Number(event.target.value))} />
        <button style={styles.button} onClick={onSave}>
          💾 Sauvegarder
        </button>
      </div>
    </div>
  )
}

export function Banner({
  bannerUrl,
  uploading,
  onUpload,
  onDelete,
}: {
  bannerUrl: string
  uploading: boolean
  onUpload: (file: File) => void
  onDelete: () => void
}) {
  return (
    <div>
      <h1>Bannière Boutique</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
      {uploading && <p>Upload...</p>}
      {bannerUrl && (
        <>
          <img
            src={bannerUrl}
            alt="Bannière boutique"
            style={{ width: "100%", maxWidth: 700, marginTop: 20, borderRadius: 12, border: "1px solid #00ffcc" }}
          />
          <div>
            <button style={styles.button} onClick={onDelete}>
              🗑 Supprimer bannière
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function Auction({
  items,
  auctionItem,
  auctionStart,
  auctionStep,
  onItem,
  onStart,
  onStep,
  onSave,
}: {
  items: any[]
  auctionItem: string
  auctionStart: string
  auctionStep: string
  onItem: (value: string) => void
  onStart: (value: string) => void
  onStep: (value: string) => void
  onSave: () => void
}) {
  return (
    <div>
      <h1>Gestion Enchères</h1>
      <div style={styles.card}>
        <select style={styles.input} value={auctionItem} onChange={(event) => onItem(event.target.value)}>
          <option value="">Choisir un item</option>
          {items.map((item: any) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input style={styles.input} placeholder="Prix départ" value={auctionStart} onChange={(event) => onStart(event.target.value)} />
        <input style={styles.input} placeholder="Pas enchère" value={auctionStep} onChange={(event) => onStep(event.target.value)} />
        <button style={styles.button} onClick={onSave}>
          💾 Sauvegarder
        </button>
      </div>
    </div>
  )
}

export function Rewards({
  rewardOrders,
  rewardPercent,
  onOrders,
  onPercent,
  onSave,
}: {
  rewardOrders: string
  rewardPercent: string
  onOrders: (value: string) => void
  onPercent: (value: string) => void
  onSave: () => void
}) {
  return (
    <div>
      <h1>Coupons Réduction</h1>
      <div style={styles.card}>
        <input style={styles.input} placeholder="Nb commandes" value={rewardOrders} onChange={(event) => onOrders(event.target.value)} />
        <input style={styles.input} placeholder="Pourcentage réduction" value={rewardPercent} onChange={(event) => onPercent(event.target.value)} />
        <button style={styles.button} onClick={onSave}>
          💾 Sauvegarder
        </button>
      </div>
    </div>
  )
}
