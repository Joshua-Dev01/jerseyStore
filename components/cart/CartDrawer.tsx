'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  sizes: string[]
  colors?: string[]
  kit_type?: string
  images: string[]
  in_stock: boolean
}

export default function AddToCart({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [wishlisted, setWishlisted] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()

  async function handleAddToCart() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Please log in to add items to your cart')
      router.push(`/login?redirectTo=/products/${product.slug}`)
      return
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? '',
      size: selectedSize || 'One Size',
      kitType: product.kit_type,
    })

    toast.success(`${product.name} added to cart!`)
  }

  async function handleWishlist() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      toast.error('Please log in to use wishlist')
      router.push(`/login?redirectTo=/products/${product.slug}`)
      return
    }

    setWishlisted(!wishlisted)
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
  }

  return (
    <div className="space-y-6">

      {/* Sizes */}
      {product.sizes?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
            Size — <span className="text-gray-900">{selectedSize || 'Select'}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 text-xs uppercase tracking-widest border transition-all ${
                  selectedSize === size
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-700 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="flex-1 py-4 bg-blue-600 text-white text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.in_stock ? 'Add to Cart' : 'Sold Out'}
        </button>
        <button
          onClick={handleWishlist}
          className={`w-14 h-14 border flex items-center justify-center transition-all ${
            wishlisted
              ? 'border-black bg-black text-white'
              : 'border-gray-200 text-gray-700 hover:border-black'
          }`}
        >
          <Heart size={18} fill={wishlisted ? 'white' : 'none'} />
        </button>
      </div>

      <p className="text-xs text-gray-400 tracking-wide">
        ✓ Free shipping on orders over ₦50,000 &nbsp;·&nbsp; ✓ 30-day returns
      </p>

    </div>
  )
}