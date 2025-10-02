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
}

export default function StudyGroupDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState<StudyGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinRequested, setJoinRequested] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`/api/study-groups/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setGroup(data.group)
          setIsMember(data.group.members.includes(user?.id))
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
    setJoinRequested(true)
    // In a real app, send a join request and notify the creator for approval
    alert("Join request sent. Waiting for approval from the group creator.")
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
            <strong>Creator:</strong> {group.creatorId}
          </div>
          <div className="mb-4">
            <strong>Members:</strong>
            <ul className="ml-4 list-disc">
              {group.members.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          {!isMember && !joinRequested && (
            <Button onClick={handleJoinRequest}>Request to Join</Button>
          )}
          {joinRequested && <div className="mt-2 text-sm text-muted-foreground">Request sent. Awaiting approval.</div>}
          {isMember && <div className="mt-2 text-green-600">You are a member of this group.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
