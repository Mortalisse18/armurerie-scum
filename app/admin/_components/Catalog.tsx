import { styles } from "./styles"

export function Catalog({
  items,
  filteredItems,
  categories,
  search,
  stockFilter,
  categoryFilter,
  editId,
  name,
  price,
  category,
  image,
  stock,
  buybackLimit,
  itemFileUploading,
  onSearch,
  onStockFilter,
  onCategoryFilter,
  onName,
  onPrice,
  onCategory,
  onImage,
  onStock,
  onBuybackLimit,
  onUploadImage,
  onClearImage,
  onSave,
  onReset,
  onEdit,
  onRemove,
  stockBadge,
}: {
  items: any[]
  filteredItems: any[]
  categories: string[]
  search: string
  stockFilter: string
  categoryFilter: string
  editId: string
  name: string
  price: string
  category: string
  image: string
  stock: string
  buybackLimit: string
  itemFileUploading: boolean
  onSearch: (value: string) => void
  onStockFilter: (value: string) => void
  onCategoryFilter: (value: string) => void
  onName: (value: string) => void
  onPrice: (value: string) => void
  onCategory: (value: string) => void
  onImage: (value: string) => void
  onStock: (value: string) => void
  onBuybackLimit: (value: string) => void
  onUploadImage: (file: File) => void
  onClearImage: () => void
  onSave: () => void
  onReset: () => void
  onEdit: (item: any) => void
  onRemove: (id: string) => void
  stockBadge: (value: number) => string
}) {
  return (
    <div>
      <h1>Boutique CRUD</h1>

      <input style={styles.input} placeholder="Recherche..." value={search} onChange={(event) => onSearch(event.target.value)} />

      <div style={styles.inlineGrid}>
        <select style={styles.input} value={stockFilter} onChange={(event) => onStockFilter(event.target.value)}>
          <option value="all">Tous stocks</option>
          <option value="rupture">Rupture</option>
          <option value="faible">Stock faible</option>
          <option value="ok">Stock OK</option>
        </select>

        <select style={styles.input} value={categoryFilter} onChange={(event) => onCategoryFilter(event.target.value)}>
          <option value="all">Toutes catégories</option>
          {categories.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.card}>
        <input style={styles.input} placeholder="Nom" value={name} onChange={(event) => onName(event.target.value)} />
        <input style={styles.input} placeholder="Prix" value={price} onChange={(event) => onPrice(event.target.value)} />

        <select style={styles.input} value={category} onChange={(event) => onCategory(event.target.value)}>
          <option value="">Catégorie</option>
          {[...new Set(items.map((item: any) => item.category).filter(Boolean))].map((entry: any) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>

        <input style={styles.input} placeholder="Image URL" value={image} onChange={(event) => onImage(event.target.value)} />
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onUploadImage(file)
          }}
        />

        {itemFileUploading && <p>Upload image...</p>}

        {image && (
          <div>
            <img src={image} alt={name || "Item"} style={{ ...styles.thumbnail, width: 120, height: 120 }} />
            <div>
              <button style={styles.button} onClick={onClearImage}>
                ❌ Retirer image
              </button>
            </div>
          </div>
        )}

        <input style={styles.input} placeholder="Stock actuel" value={stock} onChange={(event) => onStock(event.target.value)} />
        <input
          style={styles.input}
          placeholder="Limite rachat"
          value={buybackLimit}
          onChange={(event) => onBuybackLimit(event.target.value)}
        />

        <button style={styles.button} onClick={onSave}>
          {editId ? "💾 Modifier" : "➕ Ajouter"}
        </button>

        {editId && (
          <button style={styles.button} onClick={onReset}>
            Annuler
          </button>
        )}
      </div>

      {filteredItems.map((item: any) => (
        <div
          key={item.id}
          style={{
            ...styles.card,
            ...(Number(item.stock) === 0 ? styles.cardDanger : Number(item.stock) <= 3 ? styles.cardWarn : styles.cardOk),
          }}
        >
          {item.image && <img src={item.image} alt={item.name} style={styles.thumbnail} />}
          <b>{item.name}</b> — {item.price}$ — Stock {item.stock} • Rachat max {item.buybackLimit || 3} ({stockBadge(Number(item.stock))})

          <div style={{ marginTop: 8 }}>
            <button style={styles.button} onClick={() => onEdit(item)}>
              ✏ Modifier
            </button>
            <button style={styles.button} onClick={() => onRemove(item.id)}>
              🗑 Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
