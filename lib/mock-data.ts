import type { Post } from "@/types/db"

// simple id generator for preview
function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const seedNow = () => new Date().toISOString()

const posts: Post[] = [
  {
    _id: genId(),
    userId: "seed-1",
    type: "offer",
    title: "Web Development Tutoring",
    description: "Experienced in React and Node.js. Offering weekly tutoring sessions for beginners.",
    category: "Programming",
    department: "Computer Science",
    location: "Library Study Room A",
    createdAt: seedNow(),
  },
  {
    _id: genId(),
    userId: "seed-2",
    type: "need",
    title: "Need: Spanish Language Partner",
    description: "Looking for a native Spanish speaker for conversation practice. All levels welcome.",
    category: "Languages",
    department: "Arts",
    location: "Student Center Cafe",
    createdAt: seedNow(),
  },
  {
    _id: genId(),
    userId: "seed-3",
    type: "offer",
    title: "Graphic Design Collaboration",
    description: "Seeking collaborators for a branding project. Figma and Adobe skills preferred.",
    category: "Design",
    department: "Arts",
    location: "Design Lab",
    createdAt: seedNow(),
  },
  {
    _id: genId(),
    userId: "seed-4",
    type: "offer",
    title: "Data Analysis Workshop",
    description: "Intro workshop on Python + Pandas. Bring your laptop!",
    category: "Academics",
    department: "Business",
    location: "Room 204",
    createdAt: seedNow(),
  },
  {
    _id: genId(),
    userId: "seed-5",
    type: "mentorship-offer",
    title: "Mentorship: Interview Prep",
    description: "Helping juniors prepare for tech interviews. Mock interviews and feedback.",
    category: "Programming",
    department: "Computer Science",
    location: "Online",
    createdAt: seedNow(),
  },
]

type Filters = {
  type?: string
  category?: string
  department?: string
  q?: string
}

export function listPosts(filters: Filters): Post[] {
  let out = [...posts]
  if (filters.type) out = out.filter((p) => p.type === filters.type)
  if (filters.category) out = out.filter((p) => p.category === filters.category)
  if (filters.department) out = out.filter((p) => p.department === filters.department)
  if (filters.q) {
    const q = filters.q.toLowerCase()
    out = out.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q),
    )
  }
  return out.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)).slice(0, 60)
}

export function getPostById(id: string) {
  return posts.find((p) => p._id === id)
}

export function createPost(doc: Omit<Post, "_id" | "createdAt">) {
  const newPost: Post = {
    _id: genId(),
    createdAt: new Date().toISOString(),
    ...doc,
  }
  posts.unshift(newPost)
  return newPost
}
