export type PostType =
  | "offer"
  | "need"
  | "mentorship-offer"
  | "mentorship-need";

export interface Post {
  _id?: string;
  userId: string;
  type: PostType;
  title: string;
  description: string;
  category: string;
  department: string;
  location?: string;
  createdAt: string;
  acceptedBy?: string; // userId who accepted/expressed interest
  status?: "open" | "accepted" | "completed";
}

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  universityEmailVerified: boolean;
  name: string;
  status: "freshman" | "sophomore" | "junior" | "senior" | "grad" | "other";
  major: string;
  department: string;
  bio?: string;
  reputationScore: number;
  badges: string[];
  createdAt: string;
}

export interface Connection {
  id: string;
  postId: string;
  postOwnerId: string;
  acceptedById: string;
  createdAt: string;
  status: "active" | "completed";
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string; // for 1-on-1 messages
  groupId?: string; // for group messages
  content: string;
  createdAt: string;
  read: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  description: string;
  creatorId: string;
  members: string[]; // array of userIds
  createdAt: string;
}
