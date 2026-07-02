import Link from 'next/link'
import { signOut } from '@/actions/auth'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
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
  const user = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-screen z-50">

        {/* Brand */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Admin Panel</p>
          <p className="text-xs text-gray-400">Jersey Store Manager</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-blue-600 hover:text-white rounded-md transition-colors group"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={14} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors w-full"
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>

    </div>
  )
}