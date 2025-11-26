"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LifeBuoy, LogOut, Settings, User } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/connexion">Connexion</Link>
        </Button>
        <Button asChild>
          <Link href="/inscription">Inscription</Link>
        </Button>
      </div>
    );
  }

  const userName = user.username || "User";
  const userEmail = user.email || "";
  const avatarChar = userName.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={userName} />
            <AvatarFallback className="font-semibold text-sm bg-blue-500 text-white">
              {avatarChar}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={userName} />
            <AvatarFallback className="font-semibold text-sm bg-blue-500 text-white">
              {avatarChar}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{userName}</p>
            {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contact">
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
