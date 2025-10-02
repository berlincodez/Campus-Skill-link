import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
// Update user profile
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const db = await getDb()
    const users = db.collection("users")

    // Only allow certain fields to be updated
    const allowedFields = ["name", "major", "department", "bio", "status"]
    const update: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key]
    }

    await users.updateOne({ _id: new ObjectId(params.id) }, { $set: update })
    const updatedUser = await users.findOne({ _id: new ObjectId(params.id) })
    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ success: true, user: { ...userWithoutPassword, id: updatedUser._id.toString() } })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
