import Link from "next/link";
import Categories from "./Categories";
import NewArrivals from "./NewArrivals";
// import Philosophy from "./Philosophy";
import Newsletter from "./Newsletter";
// import FeaturedProduct from "./FeaturedProduct";
import BestSellers from "./BestSellers";
// import BrandStoryBanner from "./BrandStoryBanner";
import Testimonials from "./Testimonials";
// import InstagramGrid from "./InstagramGrid";
import ShopByClub from "./clubs";

export default function Hero() {
  return (
    <>
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('images/homeImg.jpg')",
            backgroundColor: 'rgba(0,0,0,0.20)',
            backgroundBlendMode: 'darken',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          <p className="text-xs tracking-[0.4em] uppercase mb-4 opacity-70">
            Official Licensed Jerseys
          </p>
          <p className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight mb-6 max-w-4xl">
            Wear Your <span className="text-blue-600">Colors</span>
          </p>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-10 tracking-wide leading-relaxed">
            Authentic jerseys from the world&apos;s biggest clubs and national teams. Delivered straight to your door.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="bg-blue-950 text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-blue-700 transition-colors font-medium"
            >
              Shop Now
            </Link>
            <Link
              href="/new-arrivals"
              className="border border-white text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors font-medium"
            >
              New Arrivals
            </Link>
          </div>

        </div>
      </section>
      <Categories />
      <ShopByClub />
      <NewArrivals />
      {/* <FeaturedProduct /> */}
      <BestSellers />
      {/* <Philosophy />
      <BrandStoryBanner /> */}
      <Testimonials />
      {/* <InstagramGrid /> */}
      <Newsletter />

    </>
  );
}