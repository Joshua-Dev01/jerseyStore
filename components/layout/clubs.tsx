import Link from 'next/link'
import Image from 'next/image'

const clubs = [
  { name: 'Man United', slug: 'manchester-united', logo: '/images/clubs/manUtd.jpg' },
  { name: 'Real Madrid', slug: 'real-madrid', logo: '/images/clubs/Rmd.jpg' },
  { name: 'Barcelona', slug: 'barcelona', logo: '/images/clubs/barca.jpg' },
  { name: 'PSG', slug: 'psg', logo: '/images/clubs/psg.png' },
  { name: 'Chelsea', slug: 'chelsea', logo: '/images/clubs/chelsea.jpg' },
  { name: 'Liverpool', slug: 'liverpool', logo: '/images/clubs/liverpool.jpg' },
  { name: 'Arsenal', slug: 'arsenal', logo: '/images/clubs/ars.jpg' },
]

export default function ShopByClub() {
  return (
    <section className="px-6 py-16 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900">
          Shop By Top Club
        </h2>
        <Link
          href="/products?category=club"
          className="text-xs tracking-widest uppercase text-blue-600 underline underline-offset-4 hover:text-blue-800 transition-colors"
        >
          View All Clubs
        </Link>
      </div>

      {/* Clubs Row */}
      <div className="flex items-start justify-between gap-4 overflow-x-auto pb-2">
        {clubs.map(({ name, slug, logo }) => (
          <Link
            key={slug}
            href={`/products?${slug}`}
            className="flex flex-col items-center gap-3 shrink-0 group"
          >
            <div className="relative w-40 h-40 rounded-full border border-gray-200 shadow-sm overflow-hidden bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image
                src={logo}
                alt={name}
                fill
                className="object-contain p-3"
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 text-center group-hover:text-blue-600 transition-colors">
              {name}
            </p>
          </Link>
        ))}
      </div>

    </section>
  )
}