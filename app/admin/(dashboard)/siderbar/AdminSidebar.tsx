"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
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
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ email }: { email: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-70 bg-white p-2 rounded-md shadow border border-gray-200"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
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
          flex flex-col z-50 transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-[72px]" : "lg:w-60"}
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-gray-700"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Brand + collapse toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                Admin Panel
              </p>
              <p className="text-xs text-gray-400 truncate">
                Jersey Store Manager
              </p>
            </div>
          )}

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm
                  transition-colors
                  ${collapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-blue-900/10 text-blue-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? "text-blue-900" : ""}
                />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + sign out */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div
            className={`flex items-center gap-3 mb-3 px-1 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={14} className="text-gray-600" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
            )}
          </div>

          <form action={signOut}>
            <button
              type="submit"
              title={collapsed ? "Logout" : undefined}
              className={`
                flex items-center gap-2 text-xs text-gray-500 hover:text-red-500
                transition-colors w-full px-2 py-1.5 rounded-md hover:bg-red-50
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <LogOut size={14} />
              {!collapsed && "Logout"}
            </button>
          </form>
        </div>
      </aside>

      {/* Spacer so page content isn't hidden behind the fixed sidebar (desktop only) */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:w-[72px]" : "lg:w-60"
        }`}
      />
    </>
  );
}