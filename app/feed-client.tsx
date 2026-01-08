"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import type { PostType, Post } from "@/types/models";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FilterType = PostType | "all" | "accepted";

export default function FeedClient() {
  const [active, setActive] = useState<FilterType>("all");
  
  // Always fetch all posts and filter client-side for proper accepted handling
  const { data: allPosts = [], isLoading } = useSWR<Post[]>("/api/posts", fetcher);

  // Filter posts based on active filter
  const filteredPosts = useMemo(() => {
    if (active === "accepted") {
      // Show only accepted posts
      return allPosts.filter(
        (p) => p.status === "accepted" || p.status === "completed" || p.acceptedBy
      );
    } else {
      // Hide accepted posts from all other filters
      const nonAccepted = allPosts.filter(
        (p) => p.status !== "accepted" && p.status !== "completed" && !p.acceptedBy
      );
      
      if (active === "all") {
        return nonAccepted;
      }
      // Filter by type
      return nonAccepted.filter((p) => p.type === active);
    }
  }, [allPosts, active]);

  const filters: FilterType[] = ["all", "offer", "need", "mentorship", "accepted"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((t) => (
          <Button
            key={t}
            variant={active === t ? "default" : "secondary"}
            onClick={() => setActive(t)}
            className={`capitalize text-base ${t === "accepted" ? "flex items-center gap-1" : ""}`}
          >
            {t === "accepted"}
            {t}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-base text-muted-foreground">Loading feed…</p>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((p) => (
            <PostCard
              key={p._id}
              post={p}
            />
          ))}
          {filteredPosts.length === 0 && (
            <p className="text-base text-muted-foreground">
              {active === "accepted"
                ? "No accepted posts yet."
                : "No posts match the current filter."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
