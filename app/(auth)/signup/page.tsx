'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { signUp, signInWithGoogle } from '@/actions/auth'

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)

  function validate(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (!email.includes('@')) {
      toast.error('Invalid email address')
      return false
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

  async function handleSubmit(formData: FormData) {
    if (!validate(formData)) return

    setLoading(true)
    const result = await signUp(formData)

    if (result?.error) {
      // Map Supabase errors to friendly messages
      const msg = result.error
      if (msg.includes('already registered')) {
        toast.error('This email is already registered. Try logging in.')
      } else if (msg.includes('invalid')) {
        toast.error('Invalid email address')
      } else if (msg.includes('password')) {
        toast.error('Password is too weak')
      } else {
        toast.error(result.error)
      }
      setLoading(false)
    } else {
      toast.success('Account created! Welcome 🎉')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-sm">

        <h1 className="text-2xl font-black tracking-widest uppercase text-center mb-8">
          Create Account
        </h1>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase text-gray-500">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase text-gray-500">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              required
              className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase text-gray-500">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              placeholder="Repeat your password"
              required
              className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form action={async () => await signInWithGoogle()}>
          <button
            type="submit"
            className="w-full border border-gray-200 py-3 text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-black font-medium underline">Login</Link>
        </p>

      </div>
    </div>
  )
}