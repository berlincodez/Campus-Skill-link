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
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

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

  console.log("Navbar auth state:", { user: !!user, loading, pathname });

  // During initial load or when logged out, show minimal header
  if (loading || !user) {
    return (
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder-logo.svg"
              width={24}
              height={24}
              alt="Logo"
            />
            <span className="font-medium">Campus Skill Link</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              asChild
            >
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

  if (!user) {
    return (
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder-logo.svg"
              width={24}
              height={24}
              alt="SkillLink"
            />
            <span className="font-semibold">Campus SkillLink</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Image
            src="/placeholder-logo.svg"
            width={24}
            height={24}
            alt="SkillLink"
          />
          <span className="font-semibold">Campus SkillLink</span>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
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
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
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
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
              >
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
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/messages")}
                >
                  Messages
                </Button>
                <Button
                  variant="destructive"
                  onClick={logout}
                >
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
