"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-guard";
import type { Post } from "@/types/models";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [postOwner, setPostOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          const postData = data.data || data;
          setPost(postData);
          if (postData.userId) {
            const ownerRes = await fetch(`/api/users/${postData.userId}`);
            if (ownerRes.ok) {
              const ownerData = await ownerRes.json();
              setPostOwner(ownerData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.id]);

  const handleAccept = async () => {
    if (!user || !post) return;
    setAccepting(true);
    try {
      // derive ids defensively
      const derivedPostId = (post as any)._id
        ? String((post as any)._id)
        : (post as any).id || params.id;
      const derivedAcceptedById =
        (user as any).id ||
        (user as any)._id ||
        (() => {
          try {
            const raw = localStorage.getItem("user");
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed.id || parsed._id || null;
          } catch {
            return null;
          }
        })();

      const payload = {
        postId: derivedPostId,
        acceptedById: derivedAcceptedById,
      };

      if (!payload.postId || !payload.acceptedById) {
        alert(
          "Cannot accept post: missing postId or user id. Please login and try again."
        );
        setAccepting(false);
        return;
      }

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const connectionId = data.connectionId || data.connectionId?.toString();

        // Send a message to the offerer (post owner) using the created connectionId
        if (post.userId && post.userId !== user.id) {
          try {
            await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                connectionId:
                  connectionId || (post as any).id || (post as any)._id,
                senderId: user.id,
                text: `Hi! I have accepted your offer: ${post.title}`,
              }),
            });
          } catch (e) {
            // ignore messaging failure; connection was created
          }
        }

        // Redirect to the new conversation using actual connectionId when available
        const targetId =
          connectionId || (post as any).id || String((post as any)._id);
        router.push(`/messages?connectionId=${targetId}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to accept post");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    alert("Decline functionality not yet implemented.");
    // TODO: Implement decline logic (API and UI)
  };

  const handleDelete = async () => {
    if (!isOwner || !post) return;
    const ok = confirm(
      "Are you sure you want to delete this post? This cannot be undone."
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const derivedPostId = (post as any)._id
        ? String((post as any)._id)
        : (post as any).id || params.id;

      const res = await fetch(`/api/posts/${derivedPostId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(user?.id ? { "x-user-id": String(user.id) } : {}),
        },
      });

      if (res.ok) {
        // redirect to my-posts
        router.push("/my-posts");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete post");
      }
    } catch {
      alert("An error occurred while deleting the post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const isOwner = user?.id === post.userId;
  const isAccepted = post.status === "accepted";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      <Card className="mt-4 bg-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="capitalize"
                >
                  {post.type}
                </Badge>
                {isAccepted && <Badge variant="outline">Accepted</Badge>}
              </div>
              <CardTitle className="text-3xl font-bold text-[#3D1A5C]">{post.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-bold text-[#3D1A5C]">Description</h3>
            <p className="text-base text-[#4A2066]">{post.description}</p>
          </div>

          <div className="flex flex-wrap gap-6 text-base">
            <div>
              <span className="font-bold text-[#3D1A5C]">Category:</span>{" "}
              <span className="text-[#4A2066]">{post.category}</span>
            </div>
            <div>
              <span className="font-bold text-[#3D1A5C]">Department:</span>{" "}
              <span className="text-[#4A2066]">{post.department}</span>
            </div>
          </div>

          {postOwner && (
            <div className="border-t border-border pt-6">
              <h3 className="mb-3 text-lg font-bold text-[#3D1A5C]">Posted by</h3>
              <Link
                href={`/profile?id=${postOwner._id}`}
                className="flex items-center gap-3 hover:underline"
              >
                <Avatar>
                  <AvatarFallback>
                    {postOwner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-bold text-[#3D1A5C]">{postOwner.name}</p>
                  <p className="text-base text-[#4A2066]">
                    {postOwner.status} • {postOwner.major}
                  </p>
                  {postOwner.reputationScore > 0 && (
                    <p className="text-sm text-[#5A3080]">
                      Reputation: {postOwner.reputationScore}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {!isOwner && !isAccepted && (
            <div className="border-t pt-6 flex gap-4">
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? "Accepting..." : "Accept & Start Messaging"}
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                className="w-full"
              >
                Decline
              </Button>
            </div>
          )}

          {isAccepted && (
            <div className="border-t pt-6">
              <Link
                href={`/messages?postId=${
                  (post as any).id || (post as any)._id
                }`}
              >
                <Button className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Go to Messages
                </Button>
              </Link>
            </div>
          )}

          {isOwner && (
            <div className="border-t pt-6">
              <p className="text-sm text-card-foreground/80">
                This is your post. You'll be notified when someone accepts it.
              </p>
              <div className="mt-4">
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
