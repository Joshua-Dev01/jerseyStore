import { createClient } from "@/lib/supabase/server";
import AnalyticsClient from "./Analyticsclient";

export const dynamic = "force-dynamic"; // always fetch fresh — no caching, true real-time on each load

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, email, total, subtotal, status, created_at, order_items(*)")
    .order("created_at", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, club_name, season, kit_type, price, images, stock_count",
    );

  return <AnalyticsClient orders={orders ?? []} products={products ?? []} />;
}
