"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePassword } from "@/actions/auth";

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    const result = await updatePassword(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(
        result.error.includes("session")
          ? "This reset link has expired. Please request a new one."
          : result.error,
      );
      return;
    }

    toast.success("Password updated! Please log in.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black tracking-widest uppercase text-center mb-2">
          Set New Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Choose a new password for your account.
        </p>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase text-gray-500">
              New Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase text-gray-500">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              minLength={6}
              className="border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 text-xs cursor-pointer tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}