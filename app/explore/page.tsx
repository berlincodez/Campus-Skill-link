"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import React from "react"
import { PostCard } from "@/components/post-card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ExplorePage() {
  const [params, setParams] = React.useState({
    type: "all",
    category: "all",
    department: "all",
    q: "",
  })
  const qs = new URLSearchParams(
    Object.entries(params).filter(([k, v]) => !(v === "all" || (k === "q" && !v))),
  ).toString()
  const { data } = useSWR(`/api/mock/posts${qs ? `?${qs}` : ""}`, fetcher)
  const posts = data?.data || []

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium">Filters</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select value={params.type} onValueChange={(v) => setParams((p) => ({ ...p, type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="need">Need</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={params.category} onValueChange={(v) => setParams((p) => ({ ...p, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Technology", "Design", "Languages", "General"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={params.department} onValueChange={(v) => setParams((p) => ({ ...p, department: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Computer Science", "Art & Design", "Humanities", "General"].map((d) => (
                  <SelectItem key={d} value={d}>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: any) => (
            <PostCard key={p.id} post={p} />
          ))}
          {posts.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No results</CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
