"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from "@/shared/ui";

import {
  RiLogoutCircleLine,
  RiDashboardLine,
  RiUserLine,
  RiSettings4Line,
  RiQuestionLine,
} from "@remixicon/react";

import { useCurrentUser } from "@/entities/user";
import { useLogout } from "@/features/auth";
import Link from "next/link";

export function UserDropdown() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (isLoading) {
    return <Skeleton className="size-10 rounded-xl" />;
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
        <Button
          variant="ghost"
          className="h-auto p-1 hover:bg-primary/10 rounded-xl"
        >
          <Avatar className="size-9 rounded-xl">
            <AvatarImage src="" width={36} height={36} alt="Profile image" />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-2 rounded-xl"
        align="end"
        sideOffset={8}
      >
        {/* User info header */}
        <div className="px-2 py-3 mb-1">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 rounded-xl">
              <AvatarImage src="" width={48} height={48} alt="Profile image" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">
                {user.display_name || "Пользователь"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="gap-3 px-3 py-2.5 rounded-lg" asChild>
          <Link href="/dashboard">
            <RiDashboardLine
              size={18}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <span>Дашборд</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-3 py-2.5 rounded-lg" asChild>
          <Link href="/profile">
            <RiUserLine
              size={18}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <span>Профиль</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 px-3 py-2.5 rounded-lg" asChild>
          <Link href="/profile">
            <RiSettings4Line
              size={18}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <span>Настройки</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="gap-3 px-3 py-2.5 rounded-lg">
          <RiQuestionLine
            size={18}
            className="text-muted-foreground"
            aria-hidden="true"
          />
          <span>Помощь</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="gap-3 px-3 py-2.5 rounded-lg text-destructive focus:text-destructive"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <RiLogoutCircleLine size={18} aria-hidden="true" />
          <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
