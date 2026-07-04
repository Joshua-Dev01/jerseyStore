"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Upload, Info, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SEASONS = ["2024/25", "2025/26", "2026/27"];
const CATEGORIES = ["Authentic", "Replica", "Fan Version"];

type KitSlot = "home" | "away" | "third";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seasonCode(season: string) {
  // "2024/25" -> "2425"
  const [a, b] = season.split("/");
  return `${a.slice(-2)}${b}`;
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const fileInputHome = useRef<HTMLInputElement>(null);
  const fileInputAway = useRef<HTMLInputElement>(null);
  const fileInputThird = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<Record<KitSlot, File | null>>({
    home: null,
    away: null,
    third: null,
  });
  const [previews, setPreviews] = useState<Record<KitSlot, string | null>>({
    home: null,
    away: null,
    third: null,
  });

  const [productName, setProductName] = useState("");
  const [clubName, setClubName] = useState("");
  const [season, setSeason] = useState(SEASONS[0]);
  const [player, setPlayer] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");

  const [isNew, setIsNew] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [compareAtPrice, setCompareAtPrice] = useState("");

  const [stock, setStock] = useState<Record<string, string>>(
    Object.fromEntries(SIZES.map((s) => [s, ""])),
  );

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  function handleFileSelect(slot: KitSlot, file: File | null) {
    setFiles((prev) => ({ ...prev, [slot]: file }));
    setPreviews((prev) => ({
      ...prev,
      [slot]: file ? URL.createObjectURL(file) : null,
    }));
  }

  function validate() {
    if (!productName.trim()) return "Product name is required";
    if (!clubName.trim()) return "Club / Nation is required";
    if (!price || Number(price) <= 0) return "Enter a valid base price";
    if (!files.home) return "A home kit image is required";
    return null;
  }

  async function uploadImage(file: File, path: string) {
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(status: "coming_soon" | "available") {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(status === "available" ? "publish" : "draft");

    try {
      const totalStock = SIZES.reduce(
        (sum, s) => sum + (Number(stock[s]) || 0),
        0,
      );
      const sizesWithStock = SIZES.filter((s) => Number(stock[s]) > 0);

      const kitSlots: { slot: KitSlot; label: string; file: File | null }[] = [
        { slot: "home", label: "Home", file: files.home },
        { slot: "away", label: "Away", file: files.away },
        { slot: "third", label: "Third", file: files.third },
      ];

      const activeSlots = kitSlots.filter((k) => k.file);
      const code = seasonCode(season);
      const clubSlug = slugify(clubName);

      const rows = [];
      for (const { slot, label, file } of activeSlots) {
        const slug = `${clubSlug}-${slot}-${code}`;
        const imagePath = `${slug}/${Date.now()}-${file!.name}`;
        const imageUrl = await uploadImage(file!, imagePath);

        rows.push({
          name: `${productName} ${label}`,
          slug,
          price: Number(price),
          compare_at_price: onSale && compareAtPrice ? Number(compareAtPrice) : null,
          category: "Club",
          type: category,
          club_name: clubName,
          season,
          kit_type: label,
          sizes: sizesWithStock,
          images: [imageUrl],
          is_new: isNew,
          is_featured: isFeatured,
          in_stock: totalStock > 0,
          stock_count: totalStock,
          status,
          player_name: player || null,
        });
      }

      const { error } = await supabase.from("products").insert(rows);

      if (error) throw new Error(error.message);

      toast.success(
        `${rows.length} product${rows.length > 1 ? "s" : ""} ${
          status === "available" ? "published" : "saved as draft"
        }`,
      );
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb + header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            <Link href="/admin/products" className="hover:text-gray-600">
              Inventory
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Add Product</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
            New Kit Arrival
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit("coming_soon")}
            disabled={saving !== null}
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving === "draft" ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSubmit("available")}
            disabled={saving !== null}
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Media gallery */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4">
              Media Gallery
            </h2>

            <input
              ref={fileInputHome}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect("home", e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputHome.current?.click()}
              className="relative w-full aspect-3/4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors overflow-hidden bg-gray-50"
            >
              {previews.home ? (
                <Image
                  src={previews.home}
                  alt="Home kit preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <>
                  <ImagePlus size={28} className="text-gray-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    Upload Home Kit
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Primary View
                  </p>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                ref={fileInputAway}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileSelect("away", e.target.files?.[0] ?? null)
                }
              />
              <button
                onClick={() => fileInputAway.current?.click()}
                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 transition-colors overflow-hidden bg-gray-50"
              >
                {previews.away ? (
                  <Image
                    src={previews.away}
                    alt="Away kit preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <Upload size={18} className="text-gray-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Away Kit
                    </p>
                  </>
                )}
              </button>

              <input
                ref={fileInputThird}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileSelect("third", e.target.files?.[0] ?? null)
                }
              />
              <button
                onClick={() => fileInputThird.current?.click()}
                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 transition-colors overflow-hidden bg-gray-50"
              >
                {previews.third ? (
                  <Image
                    src={previews.third}
                    alt="Third kit preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <Upload size={18} className="text-gray-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                      Third Kit
                    </p>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visibility & tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Visibility &amp; Tags
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-800">New Arrival</span>
                <span
                  onClick={() => setIsNew((v) => !v)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    isNew ? "bg-blue-700" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                      isNew ? "translate-x-4.5" : ""
                    }`}
                  />
                </span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-800">Featured on Homepage</span>
                <span
                  onClick={() => setIsFeatured((v) => !v)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    isFeatured ? "bg-blue-700" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                      isFeatured ? "translate-x-4.5" : ""
                    }`}
                  />
                </span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-800">On Sale</span>
                <span
                  onClick={() => setOnSale((v) => !v)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    onSale ? "bg-blue-700" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                      onSale ? "translate-x-4.5" : ""
                    }`}
                  />
                </span>
              </label>

              {onSale && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Compare-at Price (₦)
                  </label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="e.g. 157485"
                    className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-700"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Product information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-5">
              Product Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Product Name
                </label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Real Madrid Home Jersey 24/25"
                  className="w-full mt-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Club / Nation
                  </label>
                  <input
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Real Madrid"
                    className="w-full mt-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors cursor-pointer"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Player (optional)
                  </label>
                  <input
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                    placeholder="Vini Jr."
                    className="w-full mt-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Base Price (₦)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120000"
                    className="w-full border border-gray-200 rounded-md pl-8 pr-3.5 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock allocation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                Stock Allocation
              </h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Manual Entry
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SIZES.map((size) => (
                <div key={size} className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                    {size}
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={stock[size]}
                    onChange={(e) =>
                      setStock((prev) => ({ ...prev, [size]: e.target.value }))
                    }
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-2 text-sm text-center outline-none focus:border-blue-700 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>
                This total is stored as a single stock count per kit variant.
                Per-size breakdown isn&apos;t individually tracked in the
                database yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}