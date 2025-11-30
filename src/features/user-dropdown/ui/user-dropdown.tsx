"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Skeleton,
} from "@/shared/ui";

import {
  RiLogoutCircleLine,
  RiTimer2Line,
  RiUserLine,
  RiFindReplaceLine,
  RiPulseLine,
} from "@remixicon/react";

import { useCurrentUser } from "@/entities/user";
import { useLogout } from "@/features/auth";
import Link from "next/link";

export function UserDropdown() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (isLoading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  const initials =
    user.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user.email?.slice(0, 2).toUpperCase() ||
    "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8">
            <AvatarImage src="" width={32} height={32} alt="Profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64 p-2" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col py-0 px-1 mb-2">
          <span className="truncate text-sm font-medium text-foreground mb-0.5">
            {user.display_name || "Пользователь"}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-3 px-1" asChild>
          <Link href="/dashboard">
            <RiTimer2Line
              size={20}
              className="text-muted-foreground/70"
              aria-hidden="true"
            />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <RiUserLine
            size={20}
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <RiPulseLine
            size={20}
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>Changelog</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-1">
          <RiFindReplaceLine
            size={20}
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>History</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-3 px-1"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <RiLogoutCircleLine
            size={20}
            className="text-muted-foreground/70"
            aria-hidden="true"
          />
          <span>{isLoggingOut ? "Выход..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
