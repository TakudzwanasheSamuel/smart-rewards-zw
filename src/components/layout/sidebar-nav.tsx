"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NavItem } from "./app-layout";
import { Sparkles } from "lucide-react";

export function SidebarNav({ navItems, userType }: { navItems: NavItem[], userType: 'customer' | 'admin' }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r">
      <div className="flex-grow">
        <div className="flex items-center h-16 px-6 border-b">
           <Sparkles
              className="h-8 w-auto text-primary"
            />
          <span className="font-bold text-lg ml-2 font-headline">Smart Rewards</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: pathname.startsWith(item.href) ? "secondary" : "ghost" }),
                "justify-start gap-2",
                 pathname.startsWith(item.href) && "font-bold"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="profile avatar" alt="User avatar" />
                <AvatarFallback>{userType === 'customer' ? 'CU' : 'AD'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{userType === 'customer' ? 'Tafadzwa Chihwa' : 'Admin'}</span>
                  <span className="text-xs text-muted-foreground">{userType === 'customer' ? 'Tier: Gold' : 'Acme Inc.'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userType === 'customer' ? 'Tafadzwa Chihwa' : 'Admin User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userType === 'customer' ? 'tafadzwa.c@example.com' : 'admin@acme.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href="/" passHref>
                <DropdownMenuItem>Logout</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
