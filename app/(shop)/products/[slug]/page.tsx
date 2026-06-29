import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from '../ProductDetailClient'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .neq('slug', slug)
    .limit(4)

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-black font-bold">{product.club_name || product.name}</span>
        </nav>

        <ProductDetailClient product={product} />

        {/* Related Products */}
        {related && related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => {
                const img = item.images?.[0] ?? 'https://images.unsplash.com/photo-1551958219-acbc630e2914?w=400&q=80'
                const title = [item.club_name, item.season, item.kit_type].filter(Boolean).join(' ')
                return (
                  <Link key={item.id} href={`/products/${item.slug}`} className="group">
                    <div className="relative aspect-3/4 overflow-hidden bg-gray-100 mb-2">
                      <Image
                        src={img}
                        alt={title || item.name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-xs text-gray-700 group-hover:text-gray-400 transition-colors truncate">
                      {title || item.name}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">${item.price.toFixed(2)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}