"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthGuard, useAuth } from "@/components/auth-guard"

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthGuard>
        <ProfileContent />
      </AuthGuard>
    </div>
  )
}

function ProfileContent() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      setLoading(true);
      try {
        if (!user) return;
        const res = await fetch(`/api/users/${user.id}`);
        const data = await res.json();
        // Some endpoints return { user }, some return user directly
        const profileData = data.user || data;
        setProfile(profileData);
        // Fetch posts
        const postsRes = await fetch(`/api/posts?userId=${user.id}`);
        const postsData = await postsRes.json();
        setPosts(postsData.posts || postsData || []);
      } catch {
        setProfile(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-muted-foreground">Loading profile...</div>
  }

  if (!profile) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-red-500">Profile not found.</div>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-6 flex items-center gap-6 rounded-xl border bg-card p-6">
        <Image src="/placeholder-user.jpg" alt="User" width={96} height={96} className="rounded-full" />
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{profile.name}</h1>
          <p className="text-lg text-primary font-medium">{profile.major}, {profile.department}</p>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>Contribution Badges: <strong>{profile.badges ?? 0}</strong></span>
            <span>Reputation Score: <strong>{profile.reputationScore ?? 0}</strong></span>
          </div>
        </div>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </section>
      <Tabs defaultValue="myposts">
        <TabsList>
          <TabsTrigger value="myposts">My Posts</TabsTrigger>
          <TabsTrigger value="offered">Skills Offered</TabsTrigger>
          <TabsTrigger value="needed">Skills Needed</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>
        <TabsContent value="myposts" className="grid gap-4 pt-4">
          {posts.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-muted-foreground">No posts found.</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">{post.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="offered" className="grid gap-4 pt-4">
          {/* Optionally, filter posts by type: offer */}
          {posts.filter((p) => p.type === "offer").length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-muted-foreground">No skills offered.</div>
          ) : (
            posts.filter((p) => p.type === "offer").map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">{post.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="needed" className="grid gap-4 pt-4">
          {/* Optionally, filter posts by type: need */}
          {posts.filter((p) => p.type === "need").length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-muted-foreground">No skills needed.</div>
          ) : (
            posts.filter((p) => p.type === "need").map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-semibold text-base mb-1">{post.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="activity" className="pt-4">
          {/* Optionally, fetch and show activity history */}
          <div className="rounded-lg border bg-card p-6 text-muted-foreground">No recent activity.</div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
