"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-guard";
import { Send } from "lucide-react";

interface Message {
  _id: string;
  connectionId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  connectionId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: string;
  } | null;
  post: {
    id: string;
    title: string;
  } | null;
  // optional group info for group chats
  group?: {
    id: string;
    name: string;
  } | null;
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    searchParams.get("connectionId")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch conversations
  // Centralized loader for conversations so we can call it from multiple places
  async function loadConversations(markFirstRead = false) {
    const uid = user?.id;
    if (!uid) return;

    try {
      const res = await fetch(`/api/conversations?userId=${uid}`);
      if (!res.ok) {
        console.error("[v0] Failed to fetch conversations", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Enrich group info when needed
      const enriched = await Promise.all(
        data.conversations.map(async (c: any) => {
          if (!c.otherUser && c.group == null) {
            if (c.post && c.post.id) {
              try {
                const g = await fetch(`/api/study-groups/${c.post.id}`);
                if (g.ok) {
                  const gd = await g.json();
                  return {
                    ...c,
                    group: {
                      id: gd.group._id || gd.group.id,
                      name: gd.group.name,
                    },
                  };
                }
              } catch (e) {
                // ignore
              }
            }
          }
          return c;
        })
      );

      // Client-side sort by last message timestamp descending
      enriched.sort((a: Conversation, b: Conversation) => {
        const ta = a.lastMessage
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const tb = b.lastMessage
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return tb - ta;
      });

      setConversations(enriched as Conversation[]);

      if (!activeConversation && enriched.length > 0) {
        const firstId = enriched[0].connectionId;
        setActiveConversation(firstId);
        if (markFirstRead) {
          try {
            fetch("/api/messages", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ connectionId: firstId, userId: uid }),
            });
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  // initial load and periodic refresh of conversations
  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    loadConversations(true);
    const interval = setInterval(() => loadConversations(false), 5000);
    return () => clearInterval(interval);
  }, [user]);
  // Fetch messages for active conversation
  useEffect(() => {
    const uid = user?.id;
    if (!uid || !activeConversation) return;

    async function fetchMessages() {
      try {
        const res = await fetch(
          `/api/messages?connectionId=${activeConversation}&userId=${uid}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("[v0] Error fetching messages:", error);
      }
    }

    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, activeConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user?.id || !activeConversation) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: activeConversation,
          senderId: user.id,
          text: messageText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setMessageText("");
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(
    (c) => c.connectionId === activeConversation
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">
          No conversations yet. Accept a post to start messaging!
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto grid h-[calc(100dvh-64px)] max-w-6xl grid-cols-1 px-4 py-6 md:grid-cols-[320px_1fr]">
      <aside className="flex flex-col gap-3 border-r pr-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.connectionId}
              onClick={async () => {
                setActiveConversation(conv.connectionId);
                // mark messages as read for this conversation (if we have a user id)
                const uid = user?.id;
                if (!uid) return;
                try {
                  const res = await fetch("/api/messages", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      connectionId: conv.connectionId,
                      userId: uid,
                    }),
                  });
                  if (res.ok) {
                    // update local conversations state to clear unreadCount
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.connectionId === conv.connectionId
                          ? { ...c, unreadCount: 0 }
                          : c
                      )
                    );
                  }
                } catch (e) {
                  // ignore
                }
              }}
              className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                activeConversation === conv.connectionId ? "bg-muted" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {(
                    (conv.otherUser && conv.otherUser.name) ||
                    (conv.group && conv.group.name) ||
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="truncate text-sm font-medium">
                    {conv.group?.name || conv.otherUser?.name || "Unknown"}
                  </div>
                  {conv.lastMessage && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  )}
                </div>
                {conv.post && (
                  <div className="truncate text-xs text-muted-foreground">
                    Re: {conv.post.title}
                  </div>
                )}
                {conv.lastMessage && (
                  <div className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage.text}
                  </div>
                )}
                {(conv.unreadCount ?? 0) > 0 && (
                  <div className="ml-auto flex items-center">
                    <span className="inline-flex h-6 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground px-2">
                      {conv.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="grid grid-rows-[auto_1fr_auto]">
        {activeConv && (
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {(
                    (activeConv.group && activeConv.group.name) ||
                    (activeConv.otherUser && activeConv.otherUser.name) ||
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {activeConv.group?.name ||
                    activeConv.otherUser?.name ||
                    "Unknown"}
                </div>
                {activeConv.post && (
                  <div className="text-xs text-muted-foreground">
                    Re: {activeConv.post.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => {
            const isFromMe = msg.senderId === user?.id;
            return (
              <div
                key={msg._id}
                className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                    isFromMe ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-pretty">{msg.text}</p>
                  <div className="mt-1 text-right text-[10px] opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t p-4"
        >
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !messageText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </main>
  );
}
