const KEY = "cart"

export function getCart() {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(KEY) || "[]")
}

export function saveCart(cart: any[]) {
  localStorage.setItem(KEY, JSON.stringify(cart))
}

export function addToCart(item: any) {
  const cart = getCart()

  const existing = cart.find((i: any) => i.id === item.id)

  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }

  saveCart(cart)
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((i: any) => i.id !== id)
  saveCart(cart)
}

export function clearCart() {
  localStorage.removeItem(KEY)
}