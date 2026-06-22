'use client'

import { subscribeToNewsletter } from '@/actions/newsletter'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Newsletter() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await subscribeToNewsletter(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('You\'re in! Welcome to the squad 🎉')
    }
    setLoading(false)
  }

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row items-center gap-20">

        {/* Left — Image */}
        <div className="w-full lg:w-3/5 relative overflow-hidden aspect-video group">
          <Image
            src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80"
            alt="Newsletter"
            fill
            className="object-cover grayscale brightness-95 transition-all duration-3000 group-hover:grayscale-0 group-hover:scale-105"
          />
        </div>

        {/* Right — Form */}
        <div className="w-full lg:w-2/5 space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tight text-gray-900 leading-tight">
              Join The Squad
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Get early access to new jersey drops, transfer window specials, and exclusive deals before anyone else.
            </p>
          </div>

          <form action={handleSubmit} className="flex flex-col gap-8">
            <input
              name="email"
              type="email"
              placeholder="EMAIL ADDRESS"
              required
              className="w-full bg-transparent border-b border-gray-300 focus:border-black px-0 py-4 text-xs outline-none tracking-widest uppercase placeholder:text-gray-300 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-fit px-12 py-5 bg-blue-950 cursor-pointer text-white text-xs uppercase tracking-widest hover:bg-blue-900 transition-all disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}