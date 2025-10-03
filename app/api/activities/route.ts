import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const db = await getDb()
    const activities = db.collection("activities")

    const rows = await activities.find({ userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ activities: rows })
  } catch (error) {
    console.error("[v0] Get activities error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
