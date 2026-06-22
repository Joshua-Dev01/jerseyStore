'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setLoading(false)
      e.currentTarget && (e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-4 text-center">
        Contact Us
      </h1>
      <p className="text-sm text-gray-500 text-center mb-10">
        Have a question about an order, sizing, or anything &apos; else? We&apos;re here to help.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          required
          className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
        />
        <input
          type="email"
          placeholder="Your Email"
          required
          className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
        />
        <input
          type="text"
          placeholder="Subject"
          required
          className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
        />
        <textarea
          placeholder="Your Message"
          required
          rows={5}
          className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}