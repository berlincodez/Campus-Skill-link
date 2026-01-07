"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types/models";
import Link from "next/link";
import { useAuth } from "./auth-guard";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  // Quick synchronous check from localStorage to avoid waiting for auth provider
  const immediateUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.id || parsed._id || null;
    } catch {
      return null;
    }
  }, []);

  const [isOwner, setIsOwner] = useState<boolean>(() => {
    const uid = immediateUserId;
    if (!uid) return false;
    return (
      uid ===
      (post.userId ||
        (post as any).userId ||
        post.author?._id ||
        (post as any)._id)
    );
  });

  useEffect(() => {
    const uid = user?.id || immediateUserId;
    if (!uid) return setIsOwner(false);
    const ownerId =
      post.userId ||
      post.author?._id ||
      (post as any).userId ||
      (post as any).id ||
      (post as any)._id;
    setIsOwner(uid === ownerId);
  }, [user, immediateUserId, post]);

  return (
    <Card
      className={`overflow-hidden ${
        isOwner ? "border-2 border-primary/20 bg-primary/5" : ""
      }`}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="min-w-0 flex-1 text-base">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="mb-2 capitalize"
              >
                {post.type}
              </Badge>
              <div className="mt-1 font-semibold">{post.title}</div>
            </div>
            {post.author && (
              <div className="mt-1 text-sm text-muted-foreground">
                {isOwner ? "Posted by You" : `Posted by ${post.author.name}`}
              </div>
            )}
          </CardTitle>
          <div className="flex flex-shrink-0 flex-wrap gap-1">
            {isOwner && (
              <Badge
                variant="owner"
                className="text-xs whitespace-nowrap"
              >
                Your post
              </Badge>
            )}
            {(post.status === "accepted" || (post as any).acceptedBy) && (
              <Badge
                variant="info"
                className="text-xs whitespace-nowrap"
              >
                Accepted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-1">{post.category}</span>
          <span className="rounded-full border px-2 py-1">
            {post.department}
          </span>
        </div>
        <div className="flex justify-end">
          <Link href={`/posts/${post._id}`}>
            <Button
              size="sm"
              variant="secondary"
              className="shadow-sm hover:shadow-md focus-visible:scale-[0.98]"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
