import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const db = await getDb();
    const connections = db.collection("connections");
    const messages = db.collection("messages");
    const users = db.collection("users");
    const posts = db.collection("posts");

    // Get all connections for this user
    const userConnections = await connections
      .find({
        $or: [{ postOwnerId: userId }, { acceptedById: userId }],
      })
      .toArray();

    // Also include group chats for study groups where the user is a member
    const studyGroups = db.collection("study_groups");
    const memberGroups = await studyGroups.find({ members: userId }).toArray();

    // For each group, find the corresponding connection (chat) and include it
    for (const g of memberGroups) {
      try {
        const conn = await connections.findOne({
          postId: g._id.toString(),
          isGroup: true,
        });
        if (conn) {
          // make sure we don't duplicate connections already in userConnections
          const exists = userConnections.some(
            (c) => c._id && c._id.toString() === conn._id.toString()
          );
          if (!exists) userConnections.push(conn);
        }
      } catch (e) {
        // ignore per-group failures
      }
    }

    // For each connection, get the last message, unread count and other user info
    const conversations = await Promise.all(
      userConnections.map(async (conn) => {
        // If this connection is a group chat, fetch the study group metadata
        if (conn.isGroup) {
          let group = null;
          try {
            group = await studyGroups.findOne({
              _id: new ObjectId(conn.postId),
            });
          } catch (e) {
            group = await studyGroups.findOne({ _id: conn.postId });
          }

          const lastMessageArr = await messages
            .find({ connectionId: conn._id.toString() })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
          const lastMessage = lastMessageArr[0];

          // unread count: messages where recipient is the user and read is false
          const unreadCount = await messages.countDocuments({
            connectionId: conn._id.toString(),
            read: false,
            // sender is not the current user
            senderId: { $ne: userId },
          });

          return {
            connectionId: conn._id.toString(),
            otherUser: null,
            lastMessage: lastMessage
              ? {
                  text: lastMessage.text,
                  createdAt: lastMessage.createdAt,
                  senderId: lastMessage.senderId,
                }
              : null,
            unreadCount,
            post: null,
            group: group
              ? {
                  id: group._id ? group._id.toString() : group.id,
                  name: group.name,
                }
              : null,
          };
        }

        const otherUserId =
          conn.postOwnerId === userId ? conn.acceptedById : conn.postOwnerId;

        // Get other user details (try ObjectId then fallback)
        let otherUser = null;
        try {
          otherUser = await users.findOne({ _id: new ObjectId(otherUserId) });
        } catch (e) {
          otherUser = await users.findOne({ _id: otherUserId });
        }

        // Get last message
        const lastMessageArr = await messages
          .find({ connectionId: conn._id.toString() })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        const lastMessage = lastMessageArr[0];

        const unreadCount = await messages.countDocuments({
          connectionId: conn._id.toString(),
          read: false,
          senderId: { $ne: userId },
        });

        // Get post details (try ObjectId then fallback)
        let post = null;
        try {
          post = await posts.findOne({ _id: new ObjectId(conn.postId) });
        } catch (e) {
          post = await posts.findOne({ _id: conn.postId });
        }

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
          unreadCount,
          post: post
            ? {
                id: post._id.toString(),
                title: post.title,
              }
            : null,
          group: null,
        };
      })
    );

    // sort conversations by lastMessage.createdAt desc (nulls go last)
    conversations.sort((a, b) => {
      const ta = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const tb = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return tb - ta;
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[v0] Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
