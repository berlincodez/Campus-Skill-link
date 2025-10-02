import { NextResponse } from "next/server"
import { createPost, listPosts } from "@/lib/mock-store"
import type { PostType } from "@/types/models"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || undefined
  const type = (searchParams.get("type") as PostType | "all" | null) || undefined
  const category = (searchParams.get("category") as string | "all" | null) || undefined
  const department = (searchParams.get("department") as string | "all" | null) || undefined
  const data = listPosts({ q, type, category, department })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, title, description, category, department } = body || {}
  if (!type || !title || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const created = createPost({
    type,
    title,
    description,
    category: category || "General",
    department: department || "General",
  })
  return NextResponse.json({ data: created }, { status: 201 })
}
