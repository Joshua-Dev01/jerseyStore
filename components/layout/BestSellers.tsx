import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BestSellersClient from '../product/BestSellersClient'
export default async function BestSellers() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!products || products.length === 0) return null

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
              Most Loved
            </p>
            <h2 className="text-2xl font-black tracking-wide uppercase text-gray-900">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs tracking-widest uppercase text-gray-900 underline underline-offset-4 hover:text-gray-500 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Products */}
        <BestSellersClient products={products} />

      </div>
    </section>
  )
}

