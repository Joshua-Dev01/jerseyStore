import Link from 'next/link'
import Image from 'next/image'

export default function BrandStoryBanner() {
  return (
    <section className="relative w-full h-96 overflow-hidden">
      {/* Background */}
      {/* <Image
        src="/images/storybg.jpg"
        alt="Brand Story"
        fill
        className="object-cover object-center"
      /> */}
       <div
          className="absolute inset-0 bg-cover bg-blend-darken bg-black bg-center bg-no-repeat "
          style={{
            backgroundImage: "url('/images/storybg.png')",
            backgroundColor: "rgba(0,0,0,0.8)",
            backgroundBlendMode: "darken",
            backgroundAttachment:"fixed",
          }}
        />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <p className="text-xs tracking-[0.3em] uppercase mb-3 opacity-70">
          Our Story
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 max-w-2xl">
          Built On Craft. Driven By Purpose.
        </h2>
        <Link
          href="/about"
          className="border border-white text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
        >
          Read Our Story
        </Link>
      </div>
    </section>
  )
}