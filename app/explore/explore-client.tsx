"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/post-card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORIES = ["All", "Technology", "Design", "Languages", "General"];
const DEPTS = [
  "All",
  "Computer Science",
  "Art & Design",
  "Humanities",
  "General",
];

export default function ExploreClient() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("type", type);
    params.set("category", category.toLowerCase());
    params.set("department", department.toLowerCase());
    return params.toString();
  }, [q, type, category, department]);

  const { data } = useSWR(`/api/posts?${query}`, fetcher);
  const posts = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <aside className="space-y-4 md:col-span-1">
        <h2 className="text-lg font-semibold">Filters</h2>

        <div className="space-y-2">
          <Label>Post Type</Label>
          <Select
            value={type}
            onValueChange={setType}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {["all", "offer", "need", "mentorship"].map((t) => (
                <SelectItem
                  key={t}
                  value={t}
                  className="capitalize"
                >
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={department}
            onValueChange={setDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {DEPTS.map((d) => (
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
      </aside>

      <section className="md:col-span-3 space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search for skills, courses, or projects"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: any) => (
            <div key={p.id}>
              <PostCard post={p} />
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No matching results.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
