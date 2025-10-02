import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Post } from "@/types/db"
import { getPostById } from "@/lib/mock-data"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.MONGODB_URI) {
    const post = getPostById(params.id)
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(post)
  }

  const db = await getDb()
  const post = await db.collection<Post>("posts").findOne({ _id: new ObjectId(params.id) })

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}
