import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { requireAdmin } from '@/lib/admin/admin'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-black tracking-widest uppercase text-gray-900">
            Mekus Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black rounded-md transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
          <Link
            href="/"
            className="block text-xs text-gray-400 hover:text-black transition-colors mt-2 px-4"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>

    </div>
  )
}