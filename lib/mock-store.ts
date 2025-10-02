import type { Post, PostType } from "@/types/models"

let posts: Post[] = [
  {
    id: "p1",
    type: "offer",
    title: "Web Development Tutoring",
    description: "Experienced tutor available for front-end lessons. Flexible hours.",
    category: "Technology",
    department: "Computer Science",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    type: "need",
    title: "Spanish Language Partner",
    description: "Looking for a native Spanish speaker for conversation practice.",
    category: "Languages",
    department: "Humanities",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    type: "offer",
    title: "Graphic Design Assistance",
    description: "Logos and branding help for student orgs.",
    category: "Design",
    department: "Art & Design",
    createdAt: new Date().toISOString(),
  },
]

export function listPosts(filters?: {
  q?: string
  type?: PostType | "all"
  category?: string | "all"
  department?: string | "all"
}): Post[] {
  const { q, type, category, department } = filters || {}
  return posts.filter((p) => {
    const matchQ =
      !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())
    const matchType = !type || type === "all" || p.type === type
    const matchCat = !category || category === "all" || p.category === category
    const matchDept = !department || department === "all" || p.department === department
    return matchQ && matchType && matchCat && matchDept
  })
}

export function getPost(id: string): Post | undefined {
  return posts.find((p) => p.id === id)
}

export function createPost(input: {
  type: PostType
  title: string
  description: string
  category: string
  department: string
}): Post {
  const post: Post = {
    id: `p_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...input,
  }
  posts.unshift(post)
  return post
}

export function updatePost(
  id: string,
  patch: Partial<Pick<Post, "title" | "description" | "category" | "department" | "type">>,
): Post | undefined {
  const idx = posts.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  posts[idx] = { ...posts[idx], ...patch }
  return posts[idx]
}

export function deletePost(id: string): boolean {
  const before = posts.length
  posts = posts.filter((p) => p.id !== id)
  return posts.length < before
}
