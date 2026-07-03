'use client'

import { useState } from 'react'
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
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({
  email,
}: {
  email: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[70] bg-white p-2 rounded-md shadow border"
      >
        <Menu size={18} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200
          flex flex-col z-50 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-gray-100">
          {!collapsed && (
            <>
              <p className="text-sm font-bold text-gray-900">
                Admin Panel
              </p>
              <p className="text-xs text-gray-400">
                Jersey Store Manager
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Icon size={18} />

              {!collapsed && label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={14} />
            </div>

            {!collapsed && (
              <div>
                <p className="text-xs font-bold">Admin User</p>
                <p className="text-xs text-gray-400 truncate">
                  {email}
                </p>
              </div>
            )}
          </div>

          <form action={signOut}>
            <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500">
              <LogOut size={14} />

              {!collapsed && 'Logout'}
            </button>
          </form>
        </div>
      </aside>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          hidden lg:flex
          fixed top-1/2 -translate-y-1/2
          z-[60]
          w-8 h-12
          items-center justify-center
          bg-white border rounded-r-lg shadow
          transition-all duration-300
          ${collapsed ? 'left-20' : 'left-56'}
        `}
      >
        {collapsed ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>

      {/* Spacer */}
      <div
        className={`
          hidden lg:block
          transition-all duration-300
          ${collapsed ? 'w-20' : 'w-56'}
        `}
      />
    </>
  )
}