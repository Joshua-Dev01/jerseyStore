import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    label: 'Club Jerseys',
    sub: 'Shop by Club',
    href: '/products?category=club',
    image: '/images/clubjersey.png',
  },
  {
    label: 'National Teams',
    sub: 'Shop by Nation',
    href: '/products?category=national',
    image: '/images/nationalJersey.jpg',
  },
  // {
  //   label: 'Retro Collection',
  //   sub: 'Classic Kits',
  //   href: '/products?category=retro',
  //   image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=800&q=80',
  // },
]

export default function Categories() {
  return (
    <section className="grid grid-cols-2 gap-1 w-full">
      {categories.map(({ label, sub, href, image }) => (
        <Link
          key={label}
          href={href}
          className="relative overflow-hidden group h-125"
        >
          {/* Image */}
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/55 transition-colors duration-500" />

          {/* Label bottom left */}
          <div className="absolute bottom-5 left-5 z-10">
            <p className="text-white/60 text-xs tracking-widest uppercase mb-1">
              {sub}
            </p>
            <span className="text-white text-lg font-black tracking-widest uppercase drop-shadow-md">
              {label}
            </span>
            <p className="text-white/70 text-xs tracking-widest uppercase mt-1 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              Explore →
            </p>
          </div>

        </Link>
      ))}
    </section>
  )
}