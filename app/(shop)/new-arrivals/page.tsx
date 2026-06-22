import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NewArrivalsClient from '@/components/product/NewArrivalsClient'

export default async function NewArrivalsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .order('created_at', { ascending: false })

  if (error) console.error(error)

  return (
    <div className="pb-20">

      {/* Hero Header */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80')",
            backgroundColor: 'rgba(0,0,0,0.5)',
            backgroundBlendMode: 'darken',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          
          <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-3">
            Just Dropped
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase leading-none">
            New Arrivals
          </h1>
        </div>
      </div>

      {/* Client Component */}
      <NewArrivalsClient products={products ?? []} />

    </div>
  )
}