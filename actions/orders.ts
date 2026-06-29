'use server'

import { createClient } from '@/lib/supabase/server'
import { sendOrderEmails } from '@/actions/email'
import type { CartItem } from '@/store/cartStore'

type CheckoutData = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  paymentReference: string
}

export async function createOrder(data: CheckoutData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return { error: 'Not logged in' }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userData.user.id,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      status: 'paid',
      payment_reference: data.paymentReference,
      subtotal: data.subtotal,
      shipping_fee: data.shipping,
      total: data.total,
    })
    .select()
    .single()

  if (error || !order) return { error: 'Failed to create order' }

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    size: item.size,
    kit_type: item.kitType,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) return { error: 'Failed to save order items' }

  // Send receipt + admin notification — don't block order success if email fails
  await sendOrderEmails({
    id: order.id,
    full_name: order.full_name,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    total: order.total,
    created_at: order.created_at,
    items: data.items.map((item) => ({
      product_name: item.name,
      size: item.size,
      kit_type: item.kitType,
      quantity: item.quantity,
      price: item.price,
    })),
  })

  return { success: true, orderId: order.id }
}