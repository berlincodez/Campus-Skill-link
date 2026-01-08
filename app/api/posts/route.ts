import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { Post } from "@/types/db";

export async function GET(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const params = req.nextUrl.searchParams;

  const type = params.get("type") || undefined;
  const category = params.get("category") || undefined;
  const department = params.get("department") || undefined;
  const q = params.get("q") || undefined;
  const userId = params.get("userId") || undefined;

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (userId) filter.userId = userId;
  if (q) {
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: re }, { description: re }, { location: re }];
  }

  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const posts = await db
    .collection<Post>("posts")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(60)
    .toArray();

  const userIds = [...new Set(posts.map((post) => post.userId))];

  const users = await db
    .collection("users")
    .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
    .project({ name: 1, email: 1 })
    .toArray();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const postsWithAuthors = posts.map((post) => ({
    ...post,
    author: userMap.get(post.userId),
  }));

  return NextResponse.json(postsWithAuthors);
}

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const db = await getDb();
  const body = (await req.json()) as Partial<Post>;

  if (!body.title || !body.description || !body.type || !body.category) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const doc: Post = {
    userId: body.userId || "anon",
    type: body.type as Post["type"],
    title: body.title,
    description: body.description,
    category: body.category,
    department: body.department || "",
    location: body.location || "",
    createdAt: new Date().toISOString(),
  };

  const res = await db.collection<Post>("posts").insertOne(doc);
  return NextResponse.json({ _id: res.insertedId, ...doc }, { status: 201 });
}
