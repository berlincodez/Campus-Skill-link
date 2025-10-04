"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-guard";

export function useReputation(userId?: string) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function compute() {
      if (!userId) return setScore(0);
      try {
        // fetch posts created by user
        const postsRes = await fetch(`/api/posts?userId=${userId}`);
        const posts = postsRes.ok ? await postsRes.json() : [];
        const postsCount = Array.isArray(posts)
          ? posts.length
          : posts?.length || 0;

        // count accepted posts where user is owner or acceptedBy
        const acceptedCount = Array.isArray(posts)
          ? posts.filter(
              (p: any) => p.status === "accepted" || p.acceptedBy === userId
            ).length
          : 0;

        // fetch study groups where creator or member
        const groupsRes = await fetch(`/api/study-groups?userId=${userId}`);
        const groupsData = groupsRes.ok
          ? await groupsRes.json()
          : { groups: [] };
        const groups = groupsData.groups || groupsData;
        const groupsCreated = Array.isArray(groups)
          ? groups.filter((g: any) => g.creatorId === userId).length
          : 0;
        const groupsJoined = Array.isArray(groups)
          ? groups.length - groupsCreated
          : 0;

        // simple scoring formula
        const computed =
          10 +
          postsCount * 5 +
          acceptedCount * 8 +
          groupsCreated * 7 +
          groupsJoined * 3;
        if (mounted) setScore(computed);
      } catch (err) {
        console.error("Error computing reputation", err);
        if (mounted) setScore(0);
      }
    }
    compute();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return score;
}

export default function Reputation({ userId }: { userId?: string }) {
  const score = useReputation(userId);
  return <>{score ?? "..."}</>;
}
