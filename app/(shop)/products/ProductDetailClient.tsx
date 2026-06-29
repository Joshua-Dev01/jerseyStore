"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";

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
  description?: string;
  sizes: string[];
  colors?: string[];
  images: string[];
  in_stock: boolean;
  status?: string;
};

const kitOptions = ["Home", "Away", "Third"];

const accordions = [
  { title: "Description", key: "description" },
  { title: "Sizing & Fit", key: "sizing" },
  { title: "Delivery & Returns", key: "delivery" },
  { title: "Authenticity", key: "authenticity" },
];

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedKit, setSelectedKit] = useState(product.kit_type || "Home");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "description",
  );

  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const image =
    product.images?.[0] ??
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=800&q=80";
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;

  async function handleAddToCart() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      toast.error("Please log in to add items to your cart");
      router.push(`/login?redirectTo=/products/${product.slug}`);
      return;
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: `${product.club_name ?? product.name} ${selectedKit}`,
        price: product.price,
        image,
        size: selectedSize || "One Size",
        kitType: selectedKit,
      },
      quantity,
    );

    toast.success("Added to cart!");
  }

  async function handleWishlist() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      toast.error("Please log in to use wishlist");
      router.push(`/login?redirectTo=/products/${product.slug}`);
      return;
    }

    setWishlisted(!wishlisted);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left — Image */}
      {/* Left — Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={image}
          alt={product.club_name || product.name}
          fill
          priority
          className="object-cover object-center"
        />
        {product.status === "sold_out" && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500">
              Sold Out
            </p>
          </div>
        )}
        {product.status === "coming_soon" && (
          <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs px-3 py-1 tracking-widest uppercase">
            Coming Soon
          </div>
        )}
      </div>

      {/* Right — Info */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          Official Authentic Jersey
        </p>

        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-3 leading-tight">
          {product.club_name} {product.season}
        </h1>

        <div className="flex items-center gap-3 mb-1">
          <p className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-gray-400 line-through">
              ${product.compare_at_price!.toFixed(2)}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-8">
          Season {product.season}
        </p>

        {/* Kit selector */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
            Select Kit
          </p>
          <div className="grid grid-cols-3 gap-2">
            {kitOptions.map((kit) => (
              <button
                key={kit}
                onClick={() => setSelectedKit(kit)}
                className={`py-2.5 text-xs uppercase tracking-widest border transition-all ${
                  selectedKit === kit
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {kit}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        {product.sizes?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900">
                Select Size
              </p>
              <button className="text-xs text-blue-600 underline">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 text-xs uppercase tracking-widest border transition-all ${
                    selectedSize === size
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={
              product.status === "sold_out" || product.status === "coming_soon"
            }
            className="flex-1 bg-black text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {product.status === "sold_out" && "Sold Out"}
            {product.status === "coming_soon" && "Coming Soon"}
            {(!product.status || product.status === "available") &&
              "Add to Cart 🛒"}
          </button>

          <button
            onClick={handleWishlist}
            className={`w-12 h-12 border flex items-center justify-center transition-all shrink-0 ${
              wishlisted
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-700 hover:border-black"
            }`}
          >
            <Heart size={16} fill={wishlisted ? "white" : "none"} />
          </button>
        </div>

        {/* Accordions */}
        <div className="border-t border-gray-200">
          {accordions.map(({ title, key }) => (
            <div key={key} className="border-b border-gray-200">
              <button
                onClick={() =>
                  setOpenAccordion(openAccordion === key ? null : key)
                }
                className="w-full flex items-center justify-between py-4 text-xs font-bold uppercase tracking-widest text-gray-900"
              >
                {title}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${openAccordion === key ? "rotate-180" : ""}`}
                />
              </button>
              {openAccordion === key && (
                <div className="pb-4 text-sm text-gray-500 leading-relaxed">
                  {key === "description" &&
                    (product.description ||
                      `Official ${product.club_name} ${selectedKit.toLowerCase()} jersey for the ${product.season} season.`)}
                  {key === "sizing" &&
                    "This jersey follows standard athletic sizing. If between sizes, we recommend sizing up for a more comfortable fit."}
                  {key === "delivery" &&
                    "Free standard shipping on orders over $50 (5-7 business days). Express shipping available at checkout. 30-day returns on unworn items with tags attached."}
                  {key === "authenticity" &&
                    "This product is sourced through official channels and verified for authenticity before listing."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
