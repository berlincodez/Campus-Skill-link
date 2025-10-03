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
      // Request to join: add to pendingRequests if not already requested
      if (group.members.includes(userId)) {
        return NextResponse.json({ error: "Already a member" }, { status: 400 })
      }

      if (group.pendingRequests && group.pendingRequests.includes(userId)) {
        return NextResponse.json({ error: "Request already pending" }, { status: 400 })
      }

      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $push: { pendingRequests: userId } })
    } else if (action === "leave") {
      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $pull: { members: userId } })
    } else if (action === "approve") {
      // Approve a pending request: move from pendingRequests to members and create a connection for messaging
      const { approverId } = body
      if (!approverId) return NextResponse.json({ error: "approverId required" }, { status: 400 })
      if (group.creatorId !== approverId) return NextResponse.json({ error: "Only creator can approve" }, { status: 403 })

      if (!group.pendingRequests || !group.pendingRequests.includes(userId)) {
        return NextResponse.json({ error: "No pending request from this user" }, { status: 400 })
      }

      // Add member
      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $push: { members: userId }, $pull: { pendingRequests: userId } })

      // Ensure a group chat exists (chatId stored on group)
      const connections = db.collection("connections")
      let chatId = group.chatId
      if (!chatId) {
        const connection = {
          postId: params.id,
          postOwnerId: group.creatorId,
          acceptedById: null,
          isGroup: true,
          members: [group.creatorId, userId],
          createdAt: new Date().toISOString(),
          status: "active",
        }
        const r = await connections.insertOne(connection)
        chatId = r.insertedId.toString()
        await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $set: { chatId } })
      } else {
        // add new member to group chat members
        await connections.updateOne({ _id: new ObjectId(chatId) }, { $addToSet: { members: userId } })
      }

      // record activity for the approved user
      const activities = db.collection("activities")
      await activities.insertOne({
        userId: userId,
        type: "joined_group",
        groupId: params.id,
        groupName: group.name,
        createdAt: new Date().toISOString(),
      })

      return NextResponse.json({ success: true, chatId })
    } else if (action === "reject") {
      // Reject removes from pendingRequests
      const { approverId } = body
      if (!approverId) return NextResponse.json({ error: "approverId required" }, { status: 400 })
      if (group.creatorId !== approverId) return NextResponse.json({ error: "Only creator can reject" }, { status: 403 })

      await studyGroups.updateOne({ _id: new ObjectId(params.id) }, { $pull: { pendingRequests: userId } })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update study group error:", error)
    return NextResponse.json({ error: "Failed to update study group" }, { status: 500 })
  }
}
