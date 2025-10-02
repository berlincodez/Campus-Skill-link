import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Create a connection (accept/express interest in a post)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, acceptedById } = body

    // In production, get acceptedById from JWT token
    if (!postId || !acceptedById) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const posts = db.collection("posts")
    const connections = db.collection("connections")

    // Get the post
    const post = await posts.findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if connection already exists
    const existing = await connections.findOne({
      postId,
      acceptedById,
    })

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 })
    }

    // Create connection
    const connection = {
      postId,
      postOwnerId: post.userId,
      acceptedById,
      createdAt: new Date().toISOString(),
      status: "active",
    }

    const result = await connections.insertOne(connection)

    // Update post status
    await posts.updateOne({ _id: new ObjectId(postId) }, { $set: { acceptedBy: acceptedById, status: "accepted" } })

    return NextResponse.json({
      success: true,
      connectionId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("[v0] Connection creation error:", error)
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 })
  }
}

// Get user's connections
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const db = await getDb()
    const connections = db.collection("connections")

    // Get connections where user is either the post owner or the acceptor
    const userConnections = await connections
      .find({
        $or: [{ postOwnerId: userId }, { acceptedById: userId }],
      })
      .toArray()

    return NextResponse.json({ connections: userConnections })
  } catch (error) {
    console.error("[v0] Get connections error:", error)
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
  }
}
