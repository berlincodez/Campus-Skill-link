import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

// Get all study groups
export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category")
    const search = request.nextUrl.searchParams.get("search")

    const db = await getDb()
    const studyGroups = db.collection("study_groups")

    const filter: any = {}
    if (category) filter.category = category
    if (search) filter.$text = { $search: search }

    const groups = await studyGroups.find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ groups })
  } catch (error) {
    console.error("[v0] Get study groups error:", error)
    return NextResponse.json({ error: "Failed to fetch study groups" }, { status: 500 })
  }
}

// Create a new study group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, subject, creatorId, maxMembers } = body

    if (!name || !description || !category || !creatorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const studyGroups = db.collection("study_groups")

    const group = {
      name,
      description,
      category,
      subject: subject || "",
      creatorId,
      members: [creatorId],
      maxMembers: maxMembers || 10,
      createdAt: new Date().toISOString(),
      status: "active",
    }

    const result = await studyGroups.insertOne(group)

    return NextResponse.json({
      success: true,
      group: { _id: result.insertedId, ...group },
    })
  } catch (error) {
    console.error("[v0] Create study group error:", error)
    return NextResponse.json({ error: "Failed to create study group" }, { status: 500 })
  }
}
