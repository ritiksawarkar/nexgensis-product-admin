"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}