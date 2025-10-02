"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/auth-guard";

const FeedClient = dynamic(() => import("./feed-client"), { ssr: false });

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 px-4 py-8">
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h1 className="text-balance text-3xl font-semibold">
              Skill Exchange Feed
            </h1>
            <Link href="/create-post">
              <Button>New Post</Button>
            </Link>
          </div>
          <FeedClient />
        </section>
        <aside className="space-y-6">
          <div className="rounded-lg border bg-card p-6 flex flex-col items-center">
            <span className="text-muted-foreground text-sm mb-2">
              Reputation Score
            </span>
            <span className="text-4xl font-bold text-primary">92</span>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold text-base mb-4">Quick Links</h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/my-posts"
                className="flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                  />
                  <path d="M8 2v4M16 2v4M4 10h16" />
                </svg>
                My Posts
              </Link>
              <Link
                href="/my-groups"
                className="flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                  <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                </svg>
                My Groups
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </AuthGuard>
  );
}
