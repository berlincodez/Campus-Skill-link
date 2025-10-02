"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import type { PostType } from "@/types/models"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FeedClient() {
  const [active, setActive] = useState<PostType | "all">("all")
  const { data, isLoading } = useSWR(`/api/mock/posts?type=${active}`, fetcher)
  const posts = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all", "offer", "need", "mentorship"] as const).map((t) => (
          <Button
            key={t}
            variant={active === t ? "default" : "secondary"}
            onClick={() => setActive(t)}
            className="capitalize"
            size="sm"
          >
            {t}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading feed…</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p: any) => (
            <PostCard key={p.id} post={p} />
          ))}
          {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts match the current filter.</p>}
        </div>
      )}
    </div>
  )
}
