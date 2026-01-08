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
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!user) return;

  // Immediately show auth-provided user data as a quick fallback while fetching
  setProfile((prev: any) => prev ?? user);

    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (!res.ok) {
          // Keep using the auth user as fallback
          setProfile(user);
        } else {
          const data = await res.json();
          // Some endpoints return { user }, some return user directly
          const profileData = data.user || data;
          setProfile(profileData || user);
        }

        // Fetch posts (best-effort)
        const postsRes = await fetch(`/api/posts?userId=${user.id}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || postsData || []);
        } else {
          setPosts([]);
        }

        // Fetch activity history
        try {
          const actRes = await fetch(`/api/activities?userId=${user.id}`)
          if (actRes.ok) {
            const actData = await actRes.json()
            setActivities(actData.activities || [])
          }
        } catch (e) {
          setActivities([])
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        // fallback to the auth-provided user information
        setProfile(user);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-foreground">Loading profile...</div>
  }

  if (!profile) {
    // if we reach here and there's no profile nor auth user, show not found
    return <div className="mx-auto max-w-5xl px-4 py-8 text-red-500">Profile not found.</div>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-6 flex items-center gap-6 rounded-xl border bg-card p-6">
        <Image src="/placeholder-user.jpg" alt="User" width={96} height={96} className="rounded-full" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#3D1A5C]">{profile.name}</h1>
          <p className="text-lg text-[#4A2066] font-medium">{profile.major ?? "-"}, {profile.department ?? "-"}</p>
          <p className="text-base text-[#4A2066]">{profile.email}</p>
          {profile.universityEmailVerified !== undefined && (
            <p className="text-base text-[#5A3080]">University email verified: {profile.universityEmailVerified ? "Yes" : "No"}</p>
          )}
          {profile.status && <p className="text-base text-[#5A3080]">Status: {profile.status}</p>}
          {profile.createdAt && (
            <p className="text-base text-[#5A3080]">Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
          )}
          <div className="flex gap-4 mt-2 text-base text-[#4A2066]">
            <span>Contribution Badges: <strong className="text-[#3D1A5C]">{Array.isArray(profile.badges) ? profile.badges.length : profile.badges ?? 0}</strong></span>
            <span>Reputation Score: <strong className="text-[#3D1A5C]">{profile.reputationScore ?? 0}</strong></span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </section>
      {profile.bio && (
        <section className="mb-6 rounded-xl border bg-card p-6">
          <h2 className="text-xl font-bold text-[#3D1A5C]">About</h2>
          <p className="mt-2 text-base text-[#4A2066]">{profile.bio}</p>
        </section>
      )}
      <Tabs defaultValue="myposts">
        <TabsList>
          <TabsTrigger value="myposts">My Posts</TabsTrigger>
          <TabsTrigger value="offered">Skills Offered</TabsTrigger>
          <TabsTrigger value="needed">Skills Needed</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>
        <TabsContent value="myposts" className="grid gap-4 pt-4">
          {posts.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-[#5A3080]">No posts found.</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 text-[#3D1A5C]">{post.title}</div>
                  <div className="text-base text-[#4A2066] mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="offered" className="grid gap-4 pt-4">
          {/* Optionally, filter posts by type: offer */}
          {posts.filter((p) => p.type === "offer").length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-[#5A3080]">No skills offered.</div>
          ) : (
            posts.filter((p) => p.type === "offer").map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 text-[#3D1A5C]">{post.title}</div>
                  <div className="text-base text-[#4A2066] mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="needed" className="grid gap-4 pt-4">
          {/* Optionally, filter posts by type: need */}
          {posts.filter((p) => p.type === "need").length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-[#5A3080]">No skills needed.</div>
          ) : (
            posts.filter((p) => p.type === "need").map((post) => (
              <div key={post._id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 text-[#3D1A5C]">{post.title}</div>
                  <div className="text-base text-[#4A2066] mb-2">{post.description}</div>
                  <Button size="sm" variant="secondary" onClick={() => window.location.href = `/posts/${post._id}`}>View Details</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="activity" className="pt-4">
          {activities.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-[#5A3080]">No recent activity.</div>
          ) : (
            <div className="space-y-4">
              {activities.map((a) => (
                <div key={a._id} className="rounded-lg border bg-card p-4">
                  <div className="text-base text-[#4A2066]">
                    {a.type === "joined_group" && (
                      <div>
                        Joined group <strong className="text-[#3D1A5C]">{a.groupName}</strong>
                        <div className="text-sm text-[#5A3080]">{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
