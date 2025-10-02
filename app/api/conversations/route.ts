import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

// Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const db = await getDb()
    const connections = db.collection("connections")
    const messages = db.collection("messages")
    const users = db.collection("users")
    const posts = db.collection("posts")

    // Get all connections for this user
    const userConnections = await connections
      .find({
        $or: [{ postOwnerId: userId }, { acceptedById: userId }],
      })
      .toArray()

    // For each connection, get the last message and other user info
    const conversations = await Promise.all(
      userConnections.map(async (conn) => {
        const otherUserId = conn.postOwnerId === userId ? conn.acceptedById : conn.postOwnerId

        // Get other user details
        const otherUser = await users.findOne({ _id: otherUserId })

        // Get last message
        const lastMessage = await messages.findOne({ connectionId: conn._id.toString() }).sort({ createdAt: -1 })

        // Get post details
        const post = await posts.findOne({ _id: conn.postId })

        return {
          connectionId: conn._id.toString(),
          otherUser: otherUser
            ? {
                id: otherUser._id.toString(),
                name: otherUser.name,
                email: otherUser.email,
              }
            : null,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          post: post
            ? {
                id: post._id.toString(),
                title: post.title,
              }
            : null,
        }
      }),
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("[v0] Get conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
