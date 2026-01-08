import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Post } from "@/types/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const db = await getDb();
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(params.id) });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const userIdHeader = req.headers.get("x-user-id");

  const db = await getDb();
  try {
    const filter = {
      _id: new ObjectId(params.id),
      ...(userIdHeader && { userId: userIdHeader }),
    };

    const res = await db.collection("posts").deleteOne(filter);
    if (res.deletedCount === 0) {
      return NextResponse.json(
        { error: "Not found or forbidden" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
