// import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  // category filter
  if (params.category) {
    query = query.ilike("category", params.category);
  }

  // Any other key in the URL (e.g. ?barcelona, ?chelsea, ?nigeria)
  // gets treated as a search term against club_name
  const knownKeys = ["category"];
  const dynamicKey = Object.keys(params).find(
    (key) => !knownKeys.includes(key),
  );

  let pageTitle = "All Jerseys";

  if (dynamicKey) {
    const searchTerm = dynamicKey.replace(/-/g, " ");
    query = query.ilike("club_name", `%${searchTerm}%`);
    pageTitle = searchTerm
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else if (params.category) {
    pageTitle = `${params.category} Jerseys`;
  }

  const { data: products, error } = await query;

  if (error) console.error(error);

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('images/productBg.jpg')",
            backgroundColor: "rgba(0,0,0,0.65)",
            backgroundBlendMode: "darken",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          {/* <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-bold">Products</span>
          </nav> */}
          <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-3">
            Our Collection
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase leading-none">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Products Grid */}
      <ProductsClient products={products ?? []} />
    </div>
  );
}
