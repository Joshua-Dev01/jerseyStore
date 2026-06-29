"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Trash2,
  Minus,
  Plus,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const [promoCode, setPromoCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-6 text-center">
        <p className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-4">
          Your Cart is Empty
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Looks like you haven&apos;t added any jerseys yet.
        </p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors"
        >
          Shop Jerseys
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="pt-32 pb-20 max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-10">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex gap-4 border border-gray-200 rounded-lg p-4"
            >
              <div className="relative w-20 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                <Image
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=300&q=80"
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                  {item.kitType ? `${item.kitType} Kit` : "Home Kit"} ·
                  Authentic Player Version
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Size: {item.size}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Badge: None
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity - 1)
                      }
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-lg p-6 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 uppercase text-xs tracking-wide">
              <span>Subtotal</span>
              <span className="text-gray-900 font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 uppercase text-xs tracking-wide">
              <span>Shipping</span>
              <span className="text-blue-600 font-medium">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 uppercase text-xs tracking-wide">
              <span>Estimated Tax</span>
              <span className="text-gray-900 font-medium">
                ${tax.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mt-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Promo Code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-black transition-colors"
              />
              <button className="bg-black text-white text-xs uppercase tracking-widest px-4 rounded-md hover:bg-gray-800 transition-colors">
                Apply
              </button>
            </div>
          </div>

          <div className="flex justify-between font-bold text-gray-900 pt-4 mt-4 border-t border-gray-200">
            <span className="text-sm uppercase tracking-widest">Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full bg-blue-600 text-white text-center py-4 text-xs uppercase tracking-widest rounded-md hover:bg-blue-700 transition-colors mt-6 font-bold"
          >
            Checkout
          </Link>

          {/* Trust badges */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={14} className="text-blue-600" />
              SSL Secured Payment
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RotateCcw size={14} className="text-blue-600" />
              Free 30-Day Returns
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BadgeCheck size={14} className="text-blue-600" />
              100% Authentic Guaranteed
            </div>
          </div>

          <Link
            href="/products"
            className="block text-center text-xs text-gray-500 underline mt-4 hover:text-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
