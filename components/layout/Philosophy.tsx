import Image from 'next/image'
import Link from 'next/link'

export default function Philosophy() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-7xl mx-auto px-6 py-20">

      {/* Left — Text */}
      <div className="flex flex-col justify-center pr-0 md:pr-16">
        <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
          Our Philosophy
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight text-gray-900 mb-8">
          We Believe In The Power Of Essentialism.
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Cloth Brand is founded on the principle that true style is
          timeless. We curate garments that transcend trends,
          focusing on the architectural integrity of the fabric and the
          precision of the cut.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-10">
          Our collections are crafted in limited runs, ensuring each piece
          meets our rigorous standards for quality and sustainability. We don&apos;t
          just design clothing; we design the foundation of your wardrobe.
        </p>
        <Link
          href="/about"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-gray-900 border-b border-gray-900 pb-1 w-fit hover:text-gray-500 hover:border-gray-500 transition-colors"
        >
          Read Our Story
          <span className="text-base">→</span>
        </Link>
      </div>

      {/* Right — Image */}
      <div className="relative h-125 md:h-auto overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
          alt="Our Philosophy"
          fill
          className="object-cover object-center"
        />
      </div>

    </section>
  )
}