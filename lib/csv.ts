export function exportOrdersCSV(orders: any[]) {
  const rows = [
    ["Joueur", "Total", "Status", "Priorité", "Items"]
  ]

  orders.forEach(o => {
    rows.push([
      o.playerName,
      o.total,
      o.status,
      o.priority,
      o.items.map((i: any) => `${i.name} x${i.quantity}`).join(", ")
    ])
  })

  const csv = rows.map(r => r.join(";")).join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "commandes.csv"
  a.click()
}