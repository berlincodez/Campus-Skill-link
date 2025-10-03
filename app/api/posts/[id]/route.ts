import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Post } from "@/types/db";
import { getPostById } from "@/lib/mock-data";
import { deletePostById } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.MONGODB_URI) {
    const post = getPostById(params.id);
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  }

  const db = await getDb();
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(params.id) } as any);

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Basic ownership check: client should include user id in header 'x-user-id'
  const userIdHeader = req.headers.get("x-user-id");

  if (!process.env.MONGODB_URI) {
    const post = getPostById(params.id);
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    // if user id provided, enforce owner match
    if (userIdHeader && post.userId !== userIdHeader) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ok = deletePostById(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const db = await getDb();
  try {
    const filter: any = { _id: new ObjectId(params.id) } as any;
    // if user id provided, enforce owner match
    if (userIdHeader) filter.userId = userIdHeader;
    const res = await db.collection<Post>("posts").deleteOne(filter);
    if (res.deletedCount === 0)
      return NextResponse.json(
        { error: "Not found or forbidden" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
