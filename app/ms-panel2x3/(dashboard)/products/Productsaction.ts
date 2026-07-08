'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProducts(ids: string[]) {
  if (!ids.length) return { error: 'No products selected' }

  const supabase = await createClient()

  const { error } = await supabase.from('products').delete().in('id', ids)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  return { success: true }
}