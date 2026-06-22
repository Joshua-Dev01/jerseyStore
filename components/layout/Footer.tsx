import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-lg font-black tracking-widest uppercase text-gray-900 mb-3">
            Jersey Store
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-wide">
            Authentic jerseys from the world&apos;s biggest clubs and national teams.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-4">
            Shop
          </h4>
          <ul className="space-y-3">
            <li><Link href="/products" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">All Jerseys</Link></li>
            <li><Link href="/products?category=club" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Club Jerseys</Link></li>
            <li><Link href="/products?category=national" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">National Teams</Link></li>
            <li><Link href="/sale" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Sale</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-4">
            Support
          </h4>
          <ul className="space-y-3">
            <li><Link href="/faq" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Shipping</Link></li>
            <li><Link href="/returns" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Returns</Link></li>
            <li><Link href="/contact" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Contact Us</Link></li>
          </ul>
        </div>

      </div>

      {/* Social Row */}
      <div className="border-t border-gray-100 px-6 py-6 flex justify-center gap-8 max-w-7xl mx-auto">
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Instagram</a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Twitter / X</a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Facebook</a>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 max-w-7xl mx-auto">
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          © 2026 Jersey Store. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-gray-400 uppercase tracking-wide hover:text-black transition-colors">Terms of Use</Link>
        </div>
      </div>

    </footer>
  )
}