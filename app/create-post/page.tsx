"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-guard"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type PostType = "offer" | "need" | "mentorship" // simplified to match mock API

const categories = ["Technology", "Design", "Languages", "General"]
const departments = ["Computer Science", "Art & Design", "Humanities", "General"]

  const router = useRouter()
  const { user } = useAuth()
  const [type, setType] = useState<PostType>("offer")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    location: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...form,
          userId: user?.id,
        }),
      })
      if (!res.ok) throw new Error("Failed to create post")
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("[v0] Create post error:", err)
      alert("Could not create the post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function SegBtn({ value, label }: { value: PostType; label: string }) {
    const active = type === value
    return (
      <button
        type="button"
        onClick={() => setType(value)}
        className={cn(
          "rounded-full border px-4 py-1 text-sm",
          active ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-semibold">Create a Post</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <SegBtn value="offer" label="Offer" />
            <SegBtn value="need" label="Need" />
            <SegBtn value="mentorship" label="Mentorship" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Tutoring in Math"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">A clear and concise title will attract more attention.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide more details about your offer, need, or mentorship."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Be specific! The more details you provide, the better.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem value={c} key={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem value={d} key={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Campus library, online, etc."
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
