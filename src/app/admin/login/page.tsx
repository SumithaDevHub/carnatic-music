"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-6 text-[#2c2925]">
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8a6f47]">
            Carnatic Music
          </p>

          <h1 className="mt-4 text-3xl font-semibold text-[#2c2925]">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-[#777168]">
            Sign in to manage the learning portal.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-[#e7e1d8] bg-white p-8 shadow-sm"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#2c2925]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#ddd6cc] bg-white px-4 py-3 text-[#2c2925] outline-none placeholder:text-[#aaa39a] focus:border-[#8a6f47]"
              placeholder="Admin email"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#2c2925]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#ddd6cc] bg-white px-4 py-3 text-[#2c2925] outline-none placeholder:text-[#aaa39a] focus:border-[#8a6f47]"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-lg bg-[#2c2925] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#454039] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#8a6f47] hover:underline"
          >
            ← Back to portal
          </a>
        </div>

      </div>
    </main>
  );
}
