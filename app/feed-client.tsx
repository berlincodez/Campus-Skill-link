"use client";

import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import type { PostType } from "@/types/models";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeedClient() {
  const [active, setActive] = useState<PostType | "all">("all");
  const { data: posts = [], isLoading } = useSWR(
    `/api/posts${active !== "all" ? `?type=${active}` : ""}`,
    fetcher
  );

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
            <PostCard
              key={p._id}
              post={p}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No posts match the current filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
