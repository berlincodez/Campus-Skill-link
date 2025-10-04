"use client";

import Reputation from "@/components/reputation";
import { useAuth } from "@/components/auth-guard";

export default function ClientOnlyReputation() {
  const { user } = useAuth();
  return <Reputation userId={user?.id} />;
}
