import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const connectionId = request.nextUrl.searchParams.get("connectionId");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!connectionId || !userId) {
      return NextResponse.json(
        { error: "connectionId and userId required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const messages = db.collection("messages");

    // Get all messages for this connection
    const conversationMessages = await messages
      .find({ connectionId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ messages: conversationMessages });
  } catch (error) {
    console.error("[v0] Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, senderId, text } = body;

    if (!connectionId || !senderId || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const messages = db.collection("messages");

    const message = {
      connectionId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const result = await messages.insertOne(message);

    return NextResponse.json({
      success: true,
      message: { _id: result.insertedId, ...message },
    });
  } catch (error) {
    console.error("[v0] Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// Mark messages as read for a connection and user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, userId } = body;

    if (!connectionId || !userId) {
      return NextResponse.json(
        { error: "connectionId and userId required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const messages = db.collection("messages");

    const res = await messages.updateMany(
      { connectionId, read: false, senderId: { $ne: userId } },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: res.modifiedCount,
    });
  } catch (error) {
    console.error("[v0] Mark messages read error:", error);
    return NextResponse.json(
      { error: "Failed to mark messages" },
      { status: 500 }
    );
  }
}
