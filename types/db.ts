export type PostType =
  | "offer"
  | "need"
  | "mentorship-offer"
  | "mentorship-need";

export interface Post {
  _id?: string;
  userId: string; // TODO: replace with authenticated user id
  type: PostType;
  title: string;
  description: string;
  category: string;
  department?: string;
  location?: string;
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  email: string;
  universityEmailVerified: boolean;
  name: string;
  status:
    | "first-year"
    | "second-year"
    | "third-year"
    | "fourth-year"
    | "grad"
    | "other";
  major: string;
  bio?: string;
  reputationScore: number;
  badges: string[];
  createdAt: string;
}
