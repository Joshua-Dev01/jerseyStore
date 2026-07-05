'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { verifyPayment } from '@/actions/payment'
import { createOrder } from '@/actions/orders'

type PaystackResponse = {
  reference: string
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string | undefined
        email: string
        amount: number
        currency: string
        ref: string
        callback: (response: PaystackResponse) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
  }
}

function generateReference() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000000)
  return `JS_${timestamp}_${random}`
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const subtotal = totalPrice()
  const shipping = subtotal > 50000 ? 0 : 50
  const total = subtotal + shipping

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handlePayment() {
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.state) {
      toast.error('Please fill in all fields')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      toast.error('Please log in to checkout')
      router.push('/login?redirectTo=/checkout')
      return
    }

    const reference = generateReference()

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: Math.round(total * 100), // Paystack expects kobo
      currency: 'NGN',
      ref: reference,
      callback: function (response: PaystackResponse) {
        handleVerifyAndSave(response.reference)
      },
      onClose: function () {
        setLoading(false)
        toast.error('Payment window closed')
      },
    })

    handler.openIframe()
  }

  async function handleVerifyAndSave(reference: string) {
    const verification = await verifyPayment(reference)

    if (verification?.data?.status !== 'success') {
      toast.error('Payment verification failed')
      setLoading(false)
      return
    }

    const result = await createOrder({
      ...form,
      items,
      subtotal,
      shipping,
      total,
      paymentReference: reference,
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    clearCart()
    toast.success('Order placed successfully! 🎉')
    router.push(`/order-confirmation/${result.orderId}`)
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-6 text-center">
        <p className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-4">
          Your Cart is Empty
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Add some jerseys before checking out.
        </p>
      </div>
    )
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <div className="pt-32 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Form */}
          <div className="lg:col-span-2 space-y-6">

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors col-span-2"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">
                Delivery Address
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="address"
                  placeholder="Street Address"
                  value={form.address}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors col-span-2"
                />
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
                <input
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="border border-gray-200 p-6 h-fit">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm text-gray-600">
                  <span>{item.name} ({item.size}) × {item.quantity}</span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors mt-6 font-bold disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₦${total.toLocaleString()} with Paystack`}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}