"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  category: string;
  club_name?: string;
  season?: string;
  kit_type?: string;
  images: string[];
};

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const image =
    product.images?.[0] ??
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=600&q=80";

  const title = [product.club_name, product.season, product.kit_type]
    .filter(Boolean)
    .join(" ");

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      {/* Image */}
      <div className="relative w-full h-72 overflow-hidden bg-gray-100 mb-3">
        <Image
          src={image}
          alt={title || product.name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-0 left-0 right-0 py-3 cursor-pointer text-xs tracking-widest uppercase font-medium transition-all duration-300 translate-y-full group-hover:translate-y-0 ${
            added
              ? "bg-green-600 text-white"
              : "bg-white text-black hover:bg-black hover:text-white"
          }`}
        >
          {added ? "✓ Added" : "Quick Add"}
        </button>
      </div>

      {/* Info */}
      <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
        {product.category}
      </p>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-500 transition-colors">
        {title || product.name}
      </h3>
      <div className="flex items-center gap-2">
        <p className="text-sm text-blue-600 font-medium">
          ${product.price.toFixed(2)}
        </p>
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            ${product.compare_at_price!.toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function NewArrivalsClient({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
