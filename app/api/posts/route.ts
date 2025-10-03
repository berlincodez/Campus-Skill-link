import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { listPosts, createPost } from "@/lib/mock-data";
import type { Post } from "@/types/db";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const type = params.get("type") || undefined;
  const category = params.get("category") || undefined;
  const department = params.get("department") || undefined;
  const q = params.get("q") || undefined;
  const userId = params.get("userId") || undefined;

  const filter: any = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (department) filter.department = department;
  if (userId) filter.userId = userId;
  if (q) {
    // Use a case-insensitive regex search on common fields so we don't
    // rely on a MongoDB text index. Escape the query to avoid regex injection.
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: re }, { description: re }, { location: re }];
  }

  if (!process.env.MONGODB_URI) {
    const posts = listPosts({ type, category, department, q });
    return NextResponse.json(posts);
  }

  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const posts = await db
    .collection<Post>("posts")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(60)
    .toArray();

  // Get unique user IDs from posts
  const userIds = [...new Set(posts.map((post) => post.userId))];

  // Fetch user details
  const users = await db
    .collection("users")
    .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
    .project({ name: 1, email: 1 })
    .toArray();

  // Map users to their IDs for easy lookup
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  // Attach author information to posts
  const postsWithAuthors = posts.map((post) => ({
    ...post,
    author: userMap.get(post.userId),
  }));

  return NextResponse.json(postsWithAuthors);
}

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    const body = (await req.json()) as Partial<Post>;
    if (!body.title || !body.description || !body.type || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    const created = createPost({
      userId: body.userId || "anon",
      type: body.type as Post["type"],
      title: body.title,
      description: body.description,
      category: body.category,
      department: body.department || "",
      location: body.location || "",
    });
    return NextResponse.json(created, { status: 201 });
  }

  const db = await getDb();
  const body = (await req.json()) as Partial<Post>;

  // basic validation
  if (!body.title || !body.description || !body.type || !body.category) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const doc: Post = {
    userId: body.userId || "anon", // TODO: replace with real auth user id
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
