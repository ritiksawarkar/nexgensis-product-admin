"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your products
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}