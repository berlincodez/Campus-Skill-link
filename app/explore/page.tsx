"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React, { useMemo } from "react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/types/models";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ExplorePage() {
  const [params, setParams] = React.useState({
    type: "all",
    category: "all",
    department: "all",
    q: "",
  });
  
  // Always fetch all posts for client-side accepted filtering
  const { data } = useSWR<Post[]>("/api/posts", fetcher);
  const allPosts: Post[] = Array.isArray(data) ? data : (data as any)?.data || [];

  // Filter posts based on params
  const posts = useMemo(() => {
    let filtered = allPosts;

    // Handle accepted filtering
    if (params.type === "accepted") {
      // Show only accepted posts
      filtered = filtered.filter(
        (p) => p.status === "accepted" || p.status === "completed" || p.acceptedBy
      );
    } else {
      // Hide accepted posts for all other types
      filtered = filtered.filter(
        (p) => p.status !== "accepted" && p.status !== "completed" && !p.acceptedBy
      );
      
      // Apply type filter if not "all"
      if (params.type !== "all") {
        filtered = filtered.filter((p) => p.type === params.type);
      }
    }

    // Apply category filter
    if (params.category !== "all") {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    // Apply department filter
    if (params.department !== "all") {
      filtered = filtered.filter((p) => p.department === params.department);
    }

    // Apply search query
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allPosts, params]);

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
      <aside className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Filters</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select
              value={params.type}
              onValueChange={(v) => setParams((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="need">Need</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={params.category}
              onValueChange={(v) => setParams((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Technology", "Design", "Languages", "General"].map(
                  (c) => (
                    <SelectItem
                      key={c}
                      value={c}
                    >
                      {c}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={params.department}
              onValueChange={(v) => setParams((p) => ({ ...p, department: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "all",
                  "Computer Science",
                  "Art & Design",
                  "Humanities",
                  "General",
                ].map((d) => (
                  <SelectItem
                    key={d}
                    value={d}
                  >
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      <section>
        <div className="mb-4">
          <Input
            placeholder="Search for skills, courses, or projects"
            value={params.q}
            onChange={(e) => setParams((p) => ({ ...p, q: e.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
            />
          ))}
          {posts.length === 0 && (
            <Card className="col-span-full bg-background">
              <CardContent className="py-10 text-center text-muted-foreground">
                {params.type === "accepted" ? "No accepted posts yet." : "No results"}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
