import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  size: string
  kitType?: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string, size: string) => void
  updateQuantity: (id: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.id === item.id && i.size === item.size)

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id && i.size === item.size
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity }] })
        }
      },

      removeItem: (id, size) => {
        set({ items: get().items.filter((i) => !(i.id === id && i.size === size)) })
      },

      updateQuantity: (id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, size)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'jersey-store-cart',
    }
  )
)