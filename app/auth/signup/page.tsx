"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    status: "",
    major: "",
    department: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      if (!data.user.id && data.user._id) {
        data.user.id = data.user._id;
      }

      const userToStore = {
        ...data.user,
        reputationScore: data.user.reputationScore || 0,
        badges: data.user.badges || [],
        createdAt: data.user.createdAt || new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(userToStore));

      await new Promise((resolve) => setTimeout(resolve, 500));

      window.location.href = "/";
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#3D1A5C]">Join Campus SkillLink</CardTitle>
          <CardDescription className="text-base text-[#4A2066]">
            Create your account to start exchanging skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-bold text-[#3D1A5C]">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="text-[#3D1A5C]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-bold text-[#3D1A5C]">University Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="text-[#3D1A5C]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-bold text-[#3D1A5C]">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="text-[#3D1A5C]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-bold text-[#3D1A5C]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="text-[#3D1A5C]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-bold text-[#3D1A5C]">Student Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-year">First year</SelectItem>
                    <SelectItem value="second-year">Second year</SelectItem>
                    <SelectItem value="third-year">Third year</SelectItem>
                    <SelectItem value="fourth-year">Fourth year</SelectItem>
                    <SelectItem value="grad">Graduate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major" className="text-base font-bold text-[#3D1A5C]">Major</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  required
                  className="text-[#3D1A5C]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-base font-bold text-[#3D1A5C]">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
                className="text-[#3D1A5C]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-bold text-[#3D1A5C]">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your skills and interests..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="placeholder:text-[#5A3080] text-[#3D1A5C]"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-base text-[#4A2066]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#3D1A5C] font-semibold hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
