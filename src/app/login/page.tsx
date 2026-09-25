"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleFillDemo = () => {
    setUsername("emilys");
    setPassword("emilyspass");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    if (!username.trim() || !password.trim()) {
      setError("Please provide both username and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      localStorage.setItem("authToken", data.accessToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xs">
        <div className="mb-6">
          <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Nexgensis Assignment
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Product Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage products and inventory
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-blue-800">
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-blue-700"
            >
              Fill Demo
            </button>
          </div>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-blue-700">
            <div>
              Username: <span className="font-semibold text-blue-950">emilys</span>
            </div>
            <div>
              Password: <span className="font-semibold text-blue-950">emilyspass</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. emilys"
              required
              disabled={isLoading}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{isLoading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}