"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-guard"

export default function MyGroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchGroups() {
      setLoading(true)
      try {
        const res = await fetch(`/api/study-groups?userId=${user.id}`)
        const data = await res.json()
        setGroups(data.groups || [])
      } catch {
        setGroups([])
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [user])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">My Groups</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : groups.length === 0 ? (
        <Card><CardContent className="py-10 text-muted-foreground">No groups found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group._id}>
              <CardHeader>
                <CardTitle className="text-base">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {group.description}
                {/* Add more group info/actions as needed */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
