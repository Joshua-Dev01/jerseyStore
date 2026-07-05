"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/admin";
import { revalidatePath } from "next/cache";

export async function saveCustomerNote(customerId: string, note: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("customer_notes").upsert({
    customer_id: customerId,
    note,
    updated_by: admin.id,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { success: true };
}