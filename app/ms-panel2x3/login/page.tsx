'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      toast.error('Invalid credentials')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      toast.error('Access denied')
      setLoading(false)
      return
    }

    router.push('/ms-panel2x3')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-widest uppercase text-white mb-1">
            Mekus Standard
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Restricted Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors rounded"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 rounded mt-2"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Unauthorized access is strictly prohibited.
        </p>

      </div>
    </div>
  )
}