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

  const publicRoutes = ["/auth/login", "/auth/signup"];

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser._id && !parsedUser.id) {
            parsedUser.id = parsedUser._id;
          }

          if (!parsedUser.id) {
            console.error("AuthProvider: No id field found in user data");
            localStorage.removeItem("user");
            setUser(null);
            return;
          }

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

          setUser(normalizedUser);
        } else {
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
    if (loading) return;

    if (!user) {
      if (!publicRoutes.includes(pathname)) {
        router.push("/auth/login");
      }
    } else {
      if (publicRoutes.includes(pathname)) {
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
