import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // In production, get userId from JWT cookie
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
