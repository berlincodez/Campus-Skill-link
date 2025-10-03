"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("AuthGuard: No user found, redirecting to login");
      router.push("/auth/login");
      return;
    }
    console.log("AuthGuard: Auth state", { user: !!user, loading });
  }, [user, loading, router]);

  if (loading) {
    console.log("AuthGuard: Loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log("AuthGuard: User not authenticated, rendering null");
    return null;
  }

  console.log("AuthGuard: Rendering protected content");
  return <>{children}</>;
}

// Re-export the hook so callers can import it from this module
export { useAuth } from "./auth-provider";
