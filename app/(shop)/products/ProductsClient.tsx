"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";

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
  sizes?: string[];
  images: string[];
  is_new: boolean;
  in_stock: boolean;
  status?: string
};

const PAGE_SIZE = 8;

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      toast.error("Please log in to add items to your cart");
      router.push(`/login?redirectTo=/products/${product.slug}`);
      return;
    }

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? "",
      size: product.sizes?.[0] ?? "One Size",
      kitType: product.kit_type,
    });

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
    <Link href={`/products/${product.slug}`} className="group cursor-pointer">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100 mb-3">
        <Image
          src={image}
          alt={title || product.name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {product.is_new && product.status === "available" && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 tracking-widest uppercase">
            New
          </span>
        )}
        {product.status === "sold_out" && (
          <span className="absolute top-3 right-3 bg-gray-400 text-white text-xs px-2 py-1 tracking-widest uppercase">
            Sold Out
          </span>
        )}
        {product.status === "coming_soon" && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-2 py-1 tracking-widest uppercase">
            Coming Soon
          </span>
        )}
        <button
          onClick={handleQuickAdd}
          disabled={
            product.status === "sold_out" || product.status === "coming_soon"
          }
          className={`absolute bottom-0 left-0 cursor-pointer right-0 py-3 text-xs tracking-widest uppercase font-medium transition-all duration-300 translate-y-full group-hover:translate-y-0 disabled:cursor-not-allowed ${
            added
              ? "bg-green-600 text-white"
              : product.status === "sold_out" ||
                  product.status === "coming_soon"
                ? "bg-gray-300 text-gray-500"
                : "bg-white text-black hover:bg-black hover:text-white"
          }`}
        >
          {added && "✓ Added"}
          {!added && product.status === "sold_out" && "Sold Out"}
          {!added && product.status === "coming_soon" && "Coming Soon"}
          {!added &&
            (!product.status || product.status === "available") &&
            "Quick Add"}
        </button>
      </div>

      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
        {product.category}
      </p>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-400 transition-colors">
        {title || product.name}
      </h3>
      <div className="flex items-center gap-2">
        <p className="text-sm text-blue-600 font-medium">
          {formatNaira(product.price)}
        </p>
        {hasDiscount && (
          <p className="text-xs text-gray-400 line-through">
            {formatNaira(product.compare_at_price!)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedKitTypes, setSelectedKitTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Derive price bounds from real product data instead of a hardcoded
  // dollar-style 20-200 range, so this works for any currency/price scale.
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 200 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const [maxPrice, setMaxPrice] = useState(priceBounds.max);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products],
  );
  const kitTypes = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.kit_type).filter(Boolean)),
      ) as string[],
    [products],
  );
  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes ?? []))),
    [products],
  );

  function toggle(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = products.filter((p) => {
    if (selectedCategories.length && !selectedCategories.includes(p.category))
      return false;
    if (selectedKitTypes.length && !selectedKitTypes.includes(p.kit_type ?? ""))
      return false;
    if (
      selectedSizes.length &&
      !p.sizes?.some((s) => selectedSizes.includes(s))
    )
      return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const visibleProducts = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const activeFilterCount =
    selectedCategories.length +
    selectedKitTypes.length +
    selectedSizes.length +
    (maxPrice < priceBounds.max ? 1 : 0);

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedKitTypes([]);
    setSelectedSizes([]);
    setMaxPrice(priceBounds.max);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-14">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-6">
        <p className="text-xs text-gray-400 tracking-widest uppercase">
          {sorted.length} items
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-700 hover:text-black transition-colors border border-gray-200 px-3 py-2"
          >
            <SlidersHorizontal size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs uppercase tracking-widest text-gray-700 border border-gray-200 px-3 py-2 outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="border border-gray-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
              Category
            </p>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      toggle(cat, selectedCategories, setSelectedCategories)
                    }
                    className="accent-blue-600"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
              Kit Type
            </p>
            <div className="flex flex-col gap-2">
              {kitTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedKitTypes.includes(type)}
                    onChange={() =>
                      toggle(type, selectedKitTypes, setSelectedKitTypes)
                    }
                    className="accent-blue-600"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggle(size, selectedSizes, setSelectedSizes)}
                  className={`w-10 h-10 text-xs border transition-colors ${
                    selectedSizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-600 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
              Max Price — {formatNaira(maxPrice)}
            </p>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setVisibleCount(PAGE_SIZE);
              }}
              className="w-full accent-blue-600"
            />

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-6 flex items-center gap-1 text-xs text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                <X size={12} />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm uppercase tracking-widest">
            No jerseys found matching this filter
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 underline mt-3 inline-block"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Load More */}
      {sorted.length > 0 && (
        <div className="mt-16 flex flex-col items-center gap-6">
          <p className="text-xs text-gray-400 italic tracking-wide">
            Viewing {visibleProducts.length} of {sorted.length} jerseys
          </p>

          <div className="w-48 h-px bg-gray-200 relative">
            <div
              className="absolute left-0 top-0 h-full bg-black transition-all duration-500"
              style={{
                width: `${(visibleProducts.length / sorted.length) * 100}%`,
              }}
            />
          </div>

          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-12 py-4 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-all duration-300"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}