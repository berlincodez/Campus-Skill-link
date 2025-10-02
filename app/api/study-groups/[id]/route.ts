import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get a specific study group
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const studyGroups = db.collection("study_groups")

    const group = await studyGroups.findOne({ _id: new ObjectId(params.id) })

    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error("[v0] Get study group error:", error)
    return NextResponse.json({ error: "Failed to fetch study group" }, { status: 500 })
  }
}

// Update study group (join/leave)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { action, userId } = body

    if (!action || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const studyGroups = db.collection("study_groups")

    const group = await studyGroups.findOne({ _id: new ObjectId(params.id) })

    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 })
    }

    if (action === "join") {
      // Check if already a member
      if (group.members.includes(userId)) {
        return NextResponse.json({ error: "Already a member" }, { status: 400 })
      }

      // Check if group is full
      if (group.members.length >= group.maxMembers) {
        return NextResponse.json({ error: "Group is full" }, { status: 400 })
      }

      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $push: { members: userId } })
    } else if (action === "leave") {
      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $pull: { members: userId } })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update study group error:", error)
    return NextResponse.json({ error: "Failed to update study group" }, { status: 500 })
  }
}
