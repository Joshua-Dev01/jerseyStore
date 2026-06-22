'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-6 text-center">
        <p className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-4">
          Your Cart is Empty
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Looks like you haven&apos;t added any jerseys yet.
        </p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors"
        >
          Shop Jerseys
        </Link>
      </div>
    )
  }

  const subtotal = totalPrice()
  const shipping = subtotal > 50 ? 0 : 4.99
  const total = subtotal + shipping

  return (
    <div className="pt-32 pb-20 max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-10">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-gray-200 pb-6">

              <div className="relative w-24 h-32 bg-gray-100 shrink-0">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1551958219-acbc630e2914?w=300&q=80'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Size: {item.size} {item.kitType && `· ${item.kitType}`}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-blue-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id, item.size)}
                className="text-gray-400 hover:text-red-500 transition-colors self-start"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 p-6 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full bg-blue-600 text-white text-center py-4 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors mt-6"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="block text-center text-xs text-gray-500 underline mt-4 hover:text-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}