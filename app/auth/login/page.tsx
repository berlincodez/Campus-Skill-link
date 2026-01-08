"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const userToStore = { ...data.user };
      if (!userToStore.id && userToStore._id) {
        userToStore.id = userToStore._id;
      }

      localStorage.setItem("user", JSON.stringify(userToStore));

      await new Promise((resolve) => setTimeout(resolve, 500));

      window.location.href = "/";
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#3D1A5C]">Welcome Back</CardTitle>
          <CardDescription className="text-base text-[#4A2066]">Login to Campus SkillLink</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold text-[#3D1A5C]">University Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="placeholder:text-[#5A3080] text-[#3D1A5C]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-bold text-[#3D1A5C]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-[#3D1A5C]"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-base text-[#4A2066]">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-[#3D1A5C] font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
