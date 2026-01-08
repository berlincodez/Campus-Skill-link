"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "./ui/drawer";
import { Menu, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Reputation from "./reputation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/create-post", label: "Create Post" },
  { href: "/messages", label: "Messages" },
  { href: "/study-groups", label: "Study Groups" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/conversations?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const sum = (data.conversations || []).reduce(
          (s: number, c: { unreadCount?: number }) => s + (c.unreadCount || 0),
          0
        );
        if (pathname === "/messages") {
          setTotalUnread(0);
        } else {
          setTotalUnread(sum);
        }
      } catch {
        // ignore
      }
    }

    if (pathname === "/messages") {
      setTotalUnread(0);
    }

    fetchUnread();
    const iv = setInterval(fetchUnread, 7000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Wynk"
                width={150}
                height={40}
                className="h-14 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Wynk"
              width={150}
              height={40}
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-base">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                pathname === link.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="inline-flex items-center gap-2">
                {link.label}
                {link.href === "/messages" && totalUnread > 0 && (
                  <span className="inline-flex h-5 items-center justify-center rounded-full bg-accent px-2 text-[11px] font-medium text-accent-foreground ring-1 ring-accent/50">
                    {totalUnread}
                  </span>
                )}
              </span>
            </Link>
          ))}
          <DropdownMenu>
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  <Reputation userId={user?.id} />
                </span>
              </Link>

              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open user menu">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/my-posts")}>
                My Posts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        {/* Burger menu at top-left, drawer from left */}
        <div className="absolute left-4 top-4 z-40 md:hidden">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0 w-64 h-full flex flex-col">
              <div className="flex flex-col gap-2 p-6 flex-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                      "py-2 px-2 rounded hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/my-posts"
                  className="py-2 px-2 rounded hover:bg-muted text-primary font-medium"
                >
                  My Posts
                </Link>
                <Link
                  href="/my-groups"
                  className="py-2 px-2 rounded hover:bg-muted text-primary font-medium"
                >
                  My Groups
                </Link>
              </div>
              <div className="flex flex-col gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => router.push("/profile")}>
                  Profile
                </Button>
                <Button variant="outline" onClick={() => router.push("/messages")}>
                  Messages
                </Button>
                <Button variant="destructive" onClick={logout}>
                  Logout
                </Button>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
