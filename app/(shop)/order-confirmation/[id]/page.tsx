import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-2">
        Order Confirmed
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        Order #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString()}
      </p>

      <div className="border border-gray-200 p-6 text-left mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
          Items
        </h3>
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{item.product_name} ({item.size}) × {item.quantity}</span>
            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-gray-900 pt-4 mt-4 border-t border-gray-200">
          <span>Total</span>
          <span>₦{order.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="border border-gray-200 p-6 text-left mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
          Delivery Address
        </h3>
        <p className="text-sm text-gray-600">{order.full_name}</p>
        <p className="text-sm text-gray-600">{order.address}</p>
        <p className="text-sm text-gray-600">{order.city}, {order.state}</p>
        <p className="text-sm text-gray-600">{order.phone}</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/orders"
          className="border border-black text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          Track Order
        </Link>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}