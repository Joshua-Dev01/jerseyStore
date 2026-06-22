import Image from 'next/image'
import Link from 'next/link'

export default function FeaturedProduct() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

        {/* Image */}
        <div className="relative h-[600px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"
            alt="Featured Product"
            fill
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="bg-gray-50 flex flex-col justify-center px-12 py-16">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">
            Featured Drop
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-4">
            The Oversized Wool Coat
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Crafted from 100% merino wool, this coat is the centerpiece of any wardrobe. Structured shoulders, clean lines, and a silhouette that commands attention.
          </p>
          <p className="text-2xl font-black text-gray-900 mb-8">$420.00</p>
          <div className="flex gap-3">
            <Link
              href="/products/oversized-wool-coat"
              className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="border border-black text-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}