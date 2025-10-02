import { getDb } from "./mongodb";
import type { User } from "@/types/models";
import { ObjectId } from "mongodb";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  // This is a placeholder - in production use bcrypt
  // Using a more consistent encoding method
  return Buffer.from(password).toString("base64").replace(/=/g, "");
}

function verifyPassword(password: string, hash: string): boolean {
  const hashedAttempt = hashPassword(password);
  console.log("Password verification:", {
    inputPassword: password,
    hashedAttempt,
    storedHash: hash,
    matches: hashedAttempt === hash,
  });
  return hashedAttempt === hash;
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  status: User["status"];
  major: string;
  department: string;
  bio?: string;
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const db = await getDb();
    const users = db.collection("users");

    // Check if email already exists
    const existing = await users.findOne({ email: userData.email });
    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    // Verify university email (basic check - ends with .edu)
    if (!userData.email.endsWith(".edu")) {
      return { success: false, error: "Must use university email (.edu)" };
    }

    const user = {
      email: userData.email,
      password: hashPassword(userData.password),
      universityEmailVerified: false, // Would send verification email in production
      name: userData.name,
      status: userData.status,
      major: userData.major,
      department: userData.department,
      bio: userData.bio || "",
      reputationScore: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(user);
    return { success: true, userId: result.insertedId.toString() };
  } catch (error) {
    console.error("[v0] Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!verifyPassword(password, user.password)) {
      return { success: false, error: "Invalid email or password" };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    // Format user data to match User type
    const formattedUser = {
      id: user._id.toString(),
      email: user.email,
      universityEmailVerified: user.universityEmailVerified || false,
      name: user.name,
      status: user.status,
      major: user.major,
      department: user.department,
      bio: user.bio || "",
      reputationScore: user.reputationScore || 0,
      badges: user.badges || [],
      createdAt: user.createdAt || new Date().toISOString(),
    };

    return {
      success: true,
      user: formattedUser,
    };
  } catch (error) {
    console.error("[v0] Error logging in:", error);
    return { success: false, error: "Login failed" };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, id: user._id.toString() } as User;
  } catch (error) {
    console.error("[v0] Error fetching user:", error);
    return null;
  }
}
