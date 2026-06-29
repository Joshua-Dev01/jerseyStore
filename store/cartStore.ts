import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addToCartDB, updateCartQuantityDB, removeFromCartDB, clearCartDB } from '@/actions/cart'
import { createClient } from '@/lib/supabase/client'

export type CartItem = {
  id: string
  cartItemId?: string
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
  isSyncing: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>
  removeItem: (id: string, size: string) => Promise<void>
  updateQuantity: (id: string, size: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncFromDB: () => Promise<void>
  totalItems: () => number
  totalPrice: () => number
}

async function isLoggedIn() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return !!data.user
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,

      addItem: async (item, quantity = 1) => {
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

        if (await isLoggedIn()) {
          await addToCartDB(item.id, item.size, quantity)
        }
      },

      removeItem: async (id, size) => {
        const item = get().items.find((i) => i.id === id && i.size === size)
        set({ items: get().items.filter((i) => !(i.id === id && i.size === size)) })

        if (await isLoggedIn() && item?.cartItemId) {
          await removeFromCartDB(item.cartItemId)
        }
      },

      updateQuantity: async (id, size, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id, size)
          return
        }

        const item = get().items.find((i) => i.id === id && i.size === size)
        set({
          items: get().items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        })

        if (await isLoggedIn() && item?.cartItemId) {
          await updateCartQuantityDB(item.cartItemId, quantity)
        }
      },

      clearCart: async () => {
        set({ items: [] })
        if (await isLoggedIn()) {
          await clearCartDB()
        }
      },

      syncFromDB: async () => {
        if (!(await isLoggedIn())) return

        set({ isSyncing: true })

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          set({ isSyncing: false })
          return
        }

        const { data } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', user.id)

        if (data) {
          const dbItems: CartItem[] = data.map((row: any) => ({
            id: row.product_id,
            cartItemId: row.id,
            slug: row.products.slug,
            name: row.products.name,
            price: row.products.price,
            image: row.products.images?.[0] ?? '',
            size: row.size,
            kitType: row.products.kit_type,
            quantity: row.quantity,
          }))
          set({ items: dbItems })
        }

        set({ isSyncing: false })
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'jersey-store-cart',
    }
  )
)