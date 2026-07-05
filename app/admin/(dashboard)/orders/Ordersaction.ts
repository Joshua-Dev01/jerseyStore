"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/admin";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}