import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, status, major, department, bio } = body

    if (!email || !password || !name || !status || !major || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await createUser({
      email,
      password,
      name,
      status,
      major,
      department,
      bio,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Fetch the full user object after creation
    const db = await (await import("@/lib/mongodb")).getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(result.userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found after creation" }, { status: 500 })
    }
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: { ...userWithoutPassword, id: user._id.toString() } })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
