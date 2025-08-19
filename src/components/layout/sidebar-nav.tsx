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
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { customerApi, adminApi } from "@/lib/api";
import type { NavItem } from "./app-layout";

interface UserData {
  name: string;
  email: string;
  tier?: string;
  businessName?: string;
}

export function SidebarNav({ navItems, userType }: { navItems: NavItem[], userType: 'customer' | 'admin' }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        if (userType === 'customer') {
          const profile = await customerApi.getProfile();
          setUserData({
            name: profile.full_name || 'Customer',
            email: profile.user?.email || user.email || 'customer@example.com',
            tier: profile.loyalty_tier,
          });
        } else {
          const profile = await adminApi.getBusinessProfile();
          setUserData({
            name: profile.business_name || 'Business',
            email: profile.user?.email || user.email || 'business@example.com',
            businessName: profile.business_name,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to basic user data
        setUserData({
          name: userType === 'customer' ? 'Customer' : 'Business',
          email: user.email || 'user@example.com',
        });
      }
    };

    fetchUserData();
  }, [user, userType]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home page
    window.location.href = '/';
  };

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
                <AvatarImage src={userData?.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}` : `https://placehold.co/100x100.png`} alt="User avatar" />
                <AvatarFallback>
                  {userData?.name ? userData.name.split(' ').map(n => n[0]).join('') : (userType === 'customer' ? 'CU' : 'BU')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{userData?.name || (userType === 'customer' ? 'Customer' : 'Business')}</span>
                <span className="text-xs text-muted-foreground">
                  {userType === 'customer' 
                    ? (userData?.tier ? `Tier: ${userData.tier}` : 'Bronze Tier')
                    : (userData?.businessName || 'Business Account')
                  }
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.name || (userType === 'customer' ? 'Customer' : 'Business')}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={userType === 'customer' ? '/customer/profile' : '/admin/profile'}>
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </Link>
            <Link href={userType === 'customer' ? '/customer/settings' : '/admin/settings'}>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
