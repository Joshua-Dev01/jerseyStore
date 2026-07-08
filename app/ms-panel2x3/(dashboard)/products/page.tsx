import { createClient } from "@/lib/supabase/server";
import ProductsTable from "./Productstable";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to load products:", error);

  return <ProductsTable products={products ?? []} />;
}