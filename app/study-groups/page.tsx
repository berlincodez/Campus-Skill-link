"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-guard"
import { Users, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface StudyGroup {
  _id: string
  name: string
  description: string
  category: string
  subject: string
  creatorId: string
  members: string[]
  maxMembers: number
  createdAt: string
  status: string
  pendingRequests?: string[]
}

export default function StudyGroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ["Technology", "Science", "Mathematics", "Languages", "Business", "Arts"]

  useEffect(() => {
    fetchGroups()
  }, [selectedCategory])

  async function fetchGroups() {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)

      const res = await fetch(`/api/study-groups?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error("[v0] Error fetching study groups:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinGroup(groupId: string) {
    if (!user) return

    try {
      const res = await fetch(`/api/study-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          userId: user.id,
        }),
      })

      if (res.ok) {
        fetchGroups()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to join group")
      }
    } catch (error) {
      console.error("[v0] Error joining group:", error)
    }
  }

  async function handleLeaveGroup(groupId: string) {
    if (!user) return

    try {
      const res = await fetch(`/api/study-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          userId: user.id,
        }),
      })

      if (res.ok) {
        fetchGroups()
      }
    } catch (error) {
      console.error("[v0] Error leaving group:", error)
    }
  }

  const filteredGroups = groups.filter((group) =>
    searchQuery ? group.name.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold">Study Groups</h1>
          <p className="mt-1 text-base text-muted-foreground">Join or create study groups to collaborate with peers</p>
        </div>
        <Link href="/study-groups/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading study groups...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGroups.map((group) => {
            const isMember = user && group.members.includes(user.id)
            const isFull = group.members.length >= group.maxMembers

            return (
              <Card key={group._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-[#3D1A5C]">
                        <Link href={`/study-groups/${group._id}`} className="hover:underline">{group.name}</Link>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{group.category}</Badge>
                        {group.subject && <Badge variant="outline">{group.subject}</Badge>}
                      </div>
                    </div>
                    <div>
                      {user && user.id === group.creatorId && group.pendingRequests && group.pendingRequests.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/study-groups/${group._id}`)
                          }}
                          className="inline-block"
                          aria-label={`View ${group.pendingRequests.length} pending requests`}
                        >
                          <Badge variant="destructive" className="cursor-pointer">
                            {group.pendingRequests.length} pending
                          </Badge>
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base text-[#4A2066]">{group.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#5A3080]">
                      <Users className="h-4 w-4" />
                      <span>
                        {group.members.length} / {group.maxMembers} members
                      </span>
                    </div>

                    {isMember ? (
                      <Button variant="outline" size="sm" onClick={() => handleLeaveGroup(group._id)}>
                        Leave Group
                      </Button>
                    ) : (
                      <Button size="sm" disabled={isFull} onClick={() => handleJoinGroup(group._id)}>
                        {isFull ? "Full" : "Join Group"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredGroups.length === 0 && (
            <div className="col-span-2 py-12 text-center">
              <p className="text-muted-foreground">No study groups found. Create one to get started!</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
