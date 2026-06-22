// import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NewArrivalsClient from '../product/NewArrivalsClient'

export default async function NewArrivals() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (!products || products.length === 0) return null

  return (
    <section className="px-6 py-16 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
            Just Dropped
          </p>
          <h2 className="text-2xl font-black tracking-wide uppercase text-gray-900">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs tracking-widest uppercase text-gray-900 underline underline-offset-4 hover:text-gray-500 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Product Grid */}
      <NewArrivalsClient products={products} />

    </section>
  )
}