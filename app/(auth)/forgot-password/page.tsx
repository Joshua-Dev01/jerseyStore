"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email.includes("@")) {
      toast.error("Invalid email address");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black tracking-widest uppercase text-center mb-2">
          Reset Password
        </h1>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-6">
              If an account exists for that email, we&apos;ve sent a link to
              reset your password. Check your inbox (and spam folder).
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-black underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-8">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs tracking-widest uppercase text-gray-500">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white py-3 text-xs cursor-pointer tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{" "}
              <Link href="/login" className="text-black font-medium underline">
                Log In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}