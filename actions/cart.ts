"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToCartDB(
  productId: string,
  size: string,
  quantity: number = 1,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in" };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, size, quantity });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantityDB(
  cartItemId: string,
  quantity: number,
) {
  const supabase = await createClient();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", cartItemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
  }

  revalidatePath("/cart");
}

export async function removeFromCartDB(cartItemId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", cartItemId);
  revalidatePath("/cart");
}

export async function getCartItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function clearCartDB() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cart_items").delete().eq("user_id", user.id);
  revalidatePath("/cart");
}
