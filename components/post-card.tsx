import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/types/models";
import Link from "next/link";

export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">
            <Badge
              variant="secondary"
              className="mb-2 capitalize"
            >
              {post.type}
            </Badge>
            <div className="mt-1 font-semibold">{post.title}</div>
            {post.author && (
              <div className="mt-1 text-sm text-muted-foreground">
                Posted by {post.author.name}
              </div>
            )}
          </CardTitle>
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
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
