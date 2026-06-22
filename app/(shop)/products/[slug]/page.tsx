import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AddToCart from '../../checkout/page'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!product) notFound()

  const image = product.images?.[0] ??
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80'

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-10">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-black font-bold">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">

          {/* Left — Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {product.is_new && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 tracking-widest uppercase">
                New
              </span>
            )}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-500">
                  Sold Out
                </p>
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl font-bold text-blue-600 mb-6">
              ${product.price.toFixed(2)}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <hr className="border-gray-200 mb-8" />

            {/* Add to Cart Client Component */}
            <AddToCart product={product} />

            {/* Divider */}
            <hr className="border-gray-200 mt-8 mb-6" />

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-400">Category</span>
                <span className="text-gray-900">{product.category}</span>
              </div>
              {product.type && (
                <div className="flex justify-between text-xs uppercase tracking-widest">
                  <span className="text-gray-400">Type</span>
                  <span className="text-gray-900">{product.type}</span>
                </div>
              )}
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-400">Availability</span>
                <span className={product.in_stock ? 'text-green-600' : 'text-red-500'}>
                  {product.in_stock ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}