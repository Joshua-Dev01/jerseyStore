'use server'

import { adminNotificationHTML, customerReceiptHTML } from '@/lib/email/order-receipt'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type OrderItem = {
  product_name: string
  size: string
  kit_type?: string
  quantity: number
  price: number
}

type OrderDetails = {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  subtotal: number
  shipping_fee: number
  total: number
  created_at: string
  items: OrderItem[]
}

export async function sendOrderEmails(order: OrderDetails) {
  try {
    // Send to customer
    await resend.emails.send({
      from: 'Mekus Standard <onboarding@resend.dev>',
      to: order.email,
      subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      html: customerReceiptHTML(order),
    })

    // Send to admin
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: 'Mekus Standard <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Order — #${order.id.slice(0, 8).toUpperCase()} (${order.full_name})`,
        html: adminNotificationHTML(order),
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { error: 'Failed to send emails' }
  }
}