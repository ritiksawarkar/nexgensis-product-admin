"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ProductList from "@/components/products/ProductList";
import ProductSkeleton from "@/components/products/ProductSkeleton";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Bar */}
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Product Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage, search, filter, and modify your product inventory
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                ● Live API Connected
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Product Management Section */}
          <Suspense fallback={<ProductSkeleton count={10} />}>
            <ProductList />
          </Suspense>
        </div>
      </main>
    </AuthGuard>
  );
}