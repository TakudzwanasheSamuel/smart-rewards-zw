"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Map,
  Bell,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const customerNavItems: NavItem[] = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/wallet", label: "Wallet", icon: Wallet },
  { href: "/customer/map", label: "Map", icon: Map },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rules", label: "Loyalty Rules", icon: SlidersHorizontal },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavItems : customerNavItems;
  const userType = isAdmin ? 'admin' : 'customer';

  return (
    <div className="flex min-h-screen">
      <SidebarNav navItems={navItems} userType={userType} />
      <main className="flex-1">
        {children}
      </main>
      {isMobile && <div className="h-16 w-full" />}
      {isMobile && <BottomNav navItems={navItems} />}
    </div>
  );
}
