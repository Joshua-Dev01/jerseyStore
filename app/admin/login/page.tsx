"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { adminSignIn } from "@/actions/auth";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email.includes("@")) {
      toast.error("Invalid email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    const result = await adminSignIn(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center bg-neutral-100 justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-t-xl shadow-2xl p-10 pb-8">
          {/* Brand */}
          {/* <div className="text-center mb-6">
            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-900">
              Jersey Store
            </h1>
            <div className="w-10 h-0.75 bg-blue-700 mx-auto mt-3" />
          </div> */}

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-extrabold uppercase text-gray-900 mb-1">
              Admin Access
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to manage the squad.
            </p>
          </div>

          <form action={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-gray-700">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="admin@jerseystore.com"
                required
                className="bg-gray-100 border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-blue-700 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-4 py-3 pr-11 text-sm outline-none focus:border-blue-700 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-700"
                />
                Remember me
              </label>
              <a
                href="/admin/forgot-password"
                className="text-sm text-blue-700 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center cursor-pointer gap-2 bg-blue-700 text-white py-3.5 rounded-md text-sm font-bold tracking-widest uppercase hover:bg-blue-800 transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Gradient accent bar */}
        <div className="h-1.5 rounded-b-xl bg-linear-to-r from-blue-950 via-blue-400 to-blue-800" />

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="flex items-center justify-center gap-1.5 text-xs tracking-widest uppercase">
            <Lock size={12} />
            Authorized Personnel Only
          </p>
          <p className="text-xs tracking-widest uppercase mt-1 text-gray-600">
            © 2026 Jersey Store. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}