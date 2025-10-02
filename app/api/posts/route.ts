import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { listPosts, createPost } from "@/lib/mock-data"
import type { Post } from "@/types/db"

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams


  const type = params.get("type") || undefined
  const category = params.get("category") || undefined
  const department = params.get("department") || undefined
  const q = params.get("q") || undefined
  const userId = params.get("userId") || undefined

  const filter: any = {}
  if (type) filter.type = type
  if (category) filter.category = category
  if (department) filter.department = department
  if (userId) filter.userId = userId
  if (q) filter.$text = { $search: q }

  if (!process.env.MONGODB_URI) {
    const posts = listPosts({ type, category, department, q })
    return NextResponse.json(posts)
  }

  const db = await getDb()
  const posts = await db.collection<Post>("posts").find(filter).sort({ createdAt: -1 }).limit(60).toArray()

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    const body = (await req.json()) as Partial<Post>
    if (!body.title || !body.description || !body.type || !body.category) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }
    const created = createPost({
      userId: body.userId || "anon",
      type: body.type as Post["type"],
      title: body.title,
      description: body.description,
      category: body.category,
      department: body.department || "",
      location: body.location || "",
    })
    return NextResponse.json(created, { status: 201 })
  }

  const db = await getDb()
  const body = (await req.json()) as Partial<Post>

  // basic validation
  if (!body.title || !body.description || !body.type || !body.category) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
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
  }

  const res = await db.collection<Post>("posts").insertOne(doc)
  return NextResponse.json({ _id: res.insertedId, ...doc }, { status: 201 })
}
