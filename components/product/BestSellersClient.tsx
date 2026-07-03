import Image from 'next/image'
import Link from 'next/link'
import { formatNaira } from '@/lib/utils'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number | null
  category: string
  club_name?: string
  season?: string
  kit_type?: string
  images: string[]
}

const badges = ['Best Seller', 'Top Rated', 'Fan Favourite', 'Most Loved']

export default function BestSellersClient({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product, index) => {
        const image = product.images?.[0] ?? 'https://images.unsplash.com/photo-1551958219-acbc630e2914?w=600&q=80'
        const title = [product.club_name, product.season, product.kit_type]
          .filter(Boolean)
          .join(' ')
        const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

        return (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <div className="relative h-96 overflow-hidden bg-gray-100 mb-4">
              <Image
                src={image}
                alt={title || product.name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Badge */}
              <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 tracking-widest uppercase">
                {badges[index % badges.length]}
              </span>
            </div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
              {product.category}
            </p>
            <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-gray-500 transition-colors">
              {title || product.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-600 font-medium">
                {formatNaira(product.price)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">
                  {formatNaira(product.compare_at_price!)}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}