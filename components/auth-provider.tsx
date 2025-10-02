"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/types/models";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/signup"];

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Initial mount, checking localStorage");
        const storedUser = localStorage.getItem("user");
        console.log("AuthProvider: Raw stored user data:", storedUser);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log(
            "AuthProvider: Parsed user data:",
            JSON.stringify(parsedUser, null, 2)
          );

          // Log specific fields we're looking for
          console.log("AuthProvider: Critical fields:", {
            hasId: !!parsedUser.id,
            hasEmail: !!parsedUser.email,
            hasName: !!parsedUser.name,
            id: parsedUser.id,
            _id: parsedUser._id,
          });

          if (parsedUser._id && !parsedUser.id) {
            console.log("AuthProvider: Converting _id to id");
            parsedUser.id = parsedUser._id;
          }

          if (!parsedUser.id) {
            console.error("AuthProvider: No id field found in user data");
            localStorage.removeItem("user");
            setUser(null);
            return;
          }

          // Ensure all required fields are present
          const normalizedUser = {
            id: parsedUser.id,
            email: parsedUser.email,
            universityEmailVerified:
              parsedUser.universityEmailVerified || false,
            name: parsedUser.name,
            status: parsedUser.status,
            major: parsedUser.major,
            department: parsedUser.department,
            bio: parsedUser.bio || "",
            reputationScore: parsedUser.reputationScore || 0,
            badges: parsedUser.badges || [],
            createdAt: parsedUser.createdAt || new Date().toISOString(),
          };

          console.log("AuthProvider: Setting normalized user:", normalizedUser);
          setUser(normalizedUser);
        } else {
          console.log("AuthProvider: No user found in localStorage");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthProvider: Error loading user:", error);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (loading) return; // Wait until we've checked localStorage

    console.log("Auth state:", {
      user: !!user,
      pathname,
      isPublicRoute: publicRoutes.includes(pathname),
    });

    if (!user) {
      // If user is not authenticated and trying to access protected route
      if (!publicRoutes.includes(pathname)) {
        console.log("Redirecting to login - no user");
        router.push("/auth/login");
      }
    } else {
      // If user is authenticated and trying to access auth pages
      if (publicRoutes.includes(pathname)) {
        console.log("Redirecting to home - user authenticated");
        router.push("/");
      }
    }
  }, [loading, user, pathname, router]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Don't render children until we've checked auth state
  if (!publicRoutes.includes(pathname) && !user) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
