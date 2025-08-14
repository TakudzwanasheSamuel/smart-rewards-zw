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
  Store,
  QrCode,
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
  { href: "/customer/businesses", label: "Businesses", icon: Store },
  { href: "/customer/scan", label: "Scan", icon: QrCode },
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

  // For mobile view, we need to adjust the main content's padding if the bottom nav is present.
  const mainContentClass = isMobile ? "pb-16" : "";

  return (
    <div className="flex min-h-screen">
      <SidebarNav navItems={navItems} userType={userType} />
      <main className={`flex-1 ${mainContentClass}`}>
        {children}
      </main>
      {isMobile && <BottomNav navItems={navItems} />}
    </div>
  );
}
