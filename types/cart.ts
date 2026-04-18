// /types/cart.ts

import { Weapon } from "./weapon"

export type CartItem = Weapon & {
  quantity: number
}