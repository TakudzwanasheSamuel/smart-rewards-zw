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

export function SidebarNav({ navItems, userType }: { navItems: NavItem[], userType: 'customer' | 'admin' }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r">
      <div className="flex-grow">
        <div className="flex items-center h-16 px-6 border-b">
           <svg
              className="h-8 w-auto text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          <span className="font-bold text-lg ml-2 font-headline">Smart Rewards</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: pathname.startsWith(item.href) ? "default" : "ghost" }),
                "justify-start gap-2"
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
                <AvatarImage src={`https://placehold.co/100x100.png`} alt="User avatar" />
                <AvatarFallback>{userType === 'customer' ? 'CU' : 'AD'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{userType === 'customer' ? 'Customer' : 'Admin'}</span>
                  <span className="text-xs text-muted-foreground">{userType === 'customer' ? 'Tier: Gold' : 'Acme Inc.'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userType === 'customer' ? 'Customer User' : 'Admin User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userType === 'customer' ? 'customer@example.com' : 'admin@acme.com'}
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
