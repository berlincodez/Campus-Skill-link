import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Mark connection as completed
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["active", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = await getDb()
    const connections = db.collection("connections")

    const result = await connections.updateOne({ _id: new ObjectId(params.id) }, { $set: { status } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update connection error:", error)
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 })
  }
}
