"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Gift, Clock, Bell } from "lucide-react";
import { customerApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface Notification {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: string;
  type: string;
  created_at: string;
}

const iconMap = {
  Award,
  Gift,
  Clock,
  Bell,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || user.userType !== 'customer') return;

      try {
        const notificationsData = await customerApi.getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Notifications</h1>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border-b last:border-b-0"
                >
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You'll see updates about offers, tier upgrades, and more here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || Bell;
                return (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 border-b last:border-b-0"
                  >
                    <div className="bg-primary/20 text-primary p-2 rounded-full">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
