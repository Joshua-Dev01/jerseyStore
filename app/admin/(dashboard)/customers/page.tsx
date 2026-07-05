import { createClient } from "@/lib/supabase/server";
import CustomersClient from "./CustomersClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id, email, full_name, phone, total, status, created_at, order_items(*)")
    .order("created_at", { ascending: false });

  const { data: notes } = await supabase
    .from("customer_notes")
    .select("customer_id, note, updated_at");

  return <CustomersClient orders={orders ?? []} notes={notes ?? []} />;
}