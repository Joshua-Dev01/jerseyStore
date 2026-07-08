import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return <OrdersClient orders={orders ?? []} />;
}