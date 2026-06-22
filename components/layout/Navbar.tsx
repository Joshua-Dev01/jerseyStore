"use client";

import Link from "next/link";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";
import { useCartStore } from "@/store/cartStore";

const navDropdowns = [
  {
    label: "Clubs",
    items: [
      { label: "Manchester United", href: "/products?manchester-united" },
      { label: "Real Madrid", href: "/products?real-madrid" },
      { label: "Barcelona", href: "/products?barcelona" },
      { label: "Chelsea", href: "/products?chelsea" },
      { label: "Liverpool", href: "/products?liverpool" },
      { label: "View All Clubs →", href: "/products" },
    ],
  },
  {
    label: "Nations",
    items: [
      { label: "Nigeria", href: "/products?nigeria" },
      { label: "Brazil", href: "/products?brazil" },
      { label: "England", href: "/products?england" },
      { label: "Argentina", href: "/products?argentina" },
      { label: "View All Nations →", href: "/products" },
    ],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function openDropdown(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 200);
  }

  const userInitial = user?.email?.charAt(0).toUpperCase();
  const textColor = scrolled ? "text-gray-900" : "text-white";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white border-b border-gray-200 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className={`text-lg font-black tracking-widest uppercase transition-colors duration-500 ${textColor}`}
        >
          Mekus Standard
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/products"
            className={`text-xs tracking-widest uppercase transition-colors duration-500 hover:opacity-60 ${textColor}`}
          >
            Shop
          </Link>

          {navDropdowns.map((nav) => (
            <div
              key={nav.label}
              className="relative"
              onMouseEnter={() => openDropdown(nav.label)}
              onMouseLeave={scheduleClose}
            >
              <button
                className={`text-xs tracking-widest uppercase transition-colors duration-500 hover:opacity-60 flex items-center gap-1 py-3 ${textColor}`}
              >
                {nav.label}
                <span
                  className={`text-xs transition-transform duration-300 ${activeDropdown === nav.label ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {activeDropdown === nav.label && (
                <div
                  onMouseEnter={() => openDropdown(nav.label)}
                  onMouseLeave={scheduleClose}
                  className="absolute top-full left-0 bg-white border border-gray-100 shadow-lg w-52 z-50 pt-1"
                >
                  {nav.items.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-5 py-3 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/new-arrivals"
            className={`text-xs tracking-widest uppercase transition-colors duration-500 hover:opacity-60 ${textColor}`}
          >
            New Arrivals
          </Link>
          <Link
            href="/sale"
            className={`text-xs tracking-widest uppercase transition-colors duration-500 hover:opacity-60 ${textColor}`}
          >
            Sale
          </Link>
        </div>

        <div className="flex items-center gap-5">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5">
              <Search size={14} className="text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search jerseys..."
                className="text-xs outline-none w-36 text-gray-900"
                onBlur={() => setSearchOpen(false)}
              />
              <button onClick={() => setSearchOpen(false)}>
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className={`transition-colors duration-500 hover:opacity-60 ${textColor}`}
            >
              <Search size={18} />
            </button>
          )}

          <Link
            href="/wishlist"
            className={`transition-colors duration-500 hover:opacity-60 ${textColor}`}
          >
            <Heart size={18} />
          </Link>

          <Link
            href="/cart"
            className={`relative transition-colors duration-500 hover:opacity-60 ${textColor}`}
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-widest transition-all ${
                  scrolled ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {userInitial}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-xs tracking-widest uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-xs tracking-widest uppercase text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    Admin Panel
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-3 text-xs tracking-widest uppercase text-red-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-xs tracking-widest uppercase transition-colors duration-500 hover:opacity-60 ${textColor}`}
            >
              Login
            </Link>
          )}

          <button
            className={`md:hidden transition-colors duration-500 ${textColor}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className={`md:hidden px-6 pt-4 pb-6 flex flex-col gap-4 border-t mt-3 ${
            scrolled
              ? "bg-white border-gray-200"
              : "bg-black/90 border-white/10"
          }`}
        >
          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className={`text-xs tracking-widest uppercase ${scrolled ? "text-gray-900" : "text-white"}`}
          >
            Shop
          </Link>

          {navDropdowns.map((nav) => (
            <div key={nav.label}>
              <p
                className={`text-xs tracking-widest uppercase font-bold mb-2 ${scrolled ? "text-gray-400" : "text-white/40"}`}
              >
                {nav.label}
              </p>
              {nav.items.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-xs tracking-widest uppercase pl-3 py-1.5 ${scrolled ? "text-gray-700" : "text-white"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}

          <div
            className={`border-t pt-4 flex flex-col gap-3 ${scrolled ? "border-gray-200" : "border-white/10"}`}
          >
            <Link
              href="/new-arrivals"
              onClick={() => setMenuOpen(false)}
              className={`text-xs tracking-widest uppercase ${scrolled ? "text-gray-900" : "text-white"}`}
            >
              New Arrivals
            </Link>
            <Link
              href="/sale"
              onClick={() => setMenuOpen(false)}
              className={`text-xs tracking-widest uppercase ${scrolled ? "text-gray-900" : "text-white"}`}
            >
              Sale
            </Link>
          </div>

          <div
            className={`border-t pt-4 ${scrolled ? "border-gray-200" : "border-white/10"}`}
          >
            {user ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className={`text-xs tracking-widest uppercase ${scrolled ? "text-red-500" : "text-red-400"}`}
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <div className="flex gap-6">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`text-xs tracking-widest uppercase ${scrolled ? "text-gray-900" : "text-white"}`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className={`text-xs tracking-widest uppercase ${scrolled ? "text-gray-900" : "text-white"}`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
