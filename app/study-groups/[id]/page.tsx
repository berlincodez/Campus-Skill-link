"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-guard"

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
  chatId?: string
}

export default function StudyGroupDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState<StudyGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinRequested, setJoinRequested] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [userCache, setUserCache] = useState<Record<string, { id: string; name?: string; email?: string }>>({})

  // helper to bulk fetch user profiles for a list of ids
  async function fetchUsersByIds(ids: string[]) {
    const toFetch = ids.filter((id) => !userCache[id])
    if (toFetch.length === 0) return

    const results = await Promise.all(
      toFetch.map(async (id) => {
        try {
          const res = await fetch(`/api/users/${id}`)
          if (res.ok) return await res.json()
        } catch {}
        return { id }
      }),
    )

    const next = { ...userCache }
    for (const u of results) {
      if (u && u.id) next[u.id] = { id: u.id, name: u.name, email: u.email }
    }
    setUserCache(next)
  }

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`/api/study-groups/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setGroup(data.group)
          setIsMember(data.group.members.includes(user?.id))
          setJoinRequested(data.group.pendingRequests?.includes(user?.id))
          // fetch user profiles for members and pending reqs
          const idsToFetch = [...(data.group.members || []), ...(data.group.pendingRequests || [])]
          if (idsToFetch.length > 0) await fetchUsersByIds(idsToFetch)
        }
      } catch (error) {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchGroup()
  }, [params.id, user])

  const handleJoinRequest = async () => {
    try {
      const res = await fetch(`/api/study-groups/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", userId: user?.id }),
      })
      if (res.ok) {
        setJoinRequested(true)
      } else {
        const data = await res.json()
        alert(data.error || "Failed to request to join")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to request to join")
    }
  }

  const handleApprove = async (applicantId: string) => {
    try {
      const res = await fetch(`/api/study-groups/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", userId: applicantId, approverId: user?.id }),
      })
      if (res.ok) {
        // refresh
        const data = await res.json()
        // If the API returned a chatId, navigate to the group chat
        if (data.chatId) {
          window.location.href = `/messages?connectionId=${data.chatId}`
          return
        }

        const updated = await fetch(`/api/study-groups/${params.id}`)
        const updatedData = await updated.json()
        setGroup(updatedData.group)
        setIsMember(updatedData.group.members.includes(user?.id))
      } else {
        const data = await res.json()
        alert(data.error || "Failed to approve")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to approve")
    }
  }

  const handleReject = async (applicantId: string) => {
    try {
      const res = await fetch(`/api/study-groups/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", userId: applicantId, approverId: user?.id }),
      })
      if (res.ok) {
        const updated = await fetch(`/api/study-groups/${params.id}`)
        const data = await updated.json()
        setGroup(data.group)
      } else {
        const data = await res.json()
        alert(data.error || "Failed to reject")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to reject")
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!group) return <div className="p-8">Study group not found.</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{group.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">{group.description}</div>
          <div className="mb-4">
            <strong>Creator:</strong> {userCache[group.creatorId]?.name ?? group.creatorId}
          </div>
          <div className="mb-4">
            <strong>Members:</strong>
            <ul className="ml-4 list-disc">
              {group.members.map((m) => (
                <li key={m} className="flex items-center justify-between">
                  <span>{userCache[m]?.name ?? m}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const target = group.chatId ? `/messages?connectionId=${group.chatId}` : `/messages?connectionId=${params.id}&userId=${user?.id}`
                    window.location.href = target
                  }}>
                    Message
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          {!isMember && !joinRequested && (
            <Button onClick={handleJoinRequest}>Request to Join</Button>
          )}
          {joinRequested && <div className="mt-2 text-sm text-muted-foreground">Request sent. Awaiting approval.</div>}
          {isMember && <div className="mt-2 text-green-600">You are a member of this group.</div>}

          {/* Show pending requests to creator */}
          {user?.id === group.creatorId && group.pendingRequests && group.pendingRequests.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Pending Requests</h3>
              <ul className="mt-2 space-y-2">
                {group.pendingRequests.map((applicant: string) => (
                  <li key={applicant} className="flex items-center justify-between">
                    <span>{userCache[applicant]?.name ?? applicant}</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(applicant)}>Approve</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(applicant)}>Reject</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
