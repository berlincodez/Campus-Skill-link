import { NextResponse } from "next/server"
import { deletePost, getPost, updatePost } from "@/lib/mock-store"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = getPost(params.id)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: post })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const patch = await request.json()
  const updated = updatePost(params.id, patch)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ok = deletePost(params.id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
