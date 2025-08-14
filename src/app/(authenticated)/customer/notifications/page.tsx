import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Gift, Clock } from "lucide-react";

const notifications = [
  {
    icon: Award,
    title: "Tier Upgrade!",
    description: "Congratulations! You've reached the Gold tier. Enjoy your new benefits.",
    time: "2 hours ago",
  },
  {
    icon: Gift,
    title: "New Offer from Chicken Inn",
    description: "Get a free side with any combo meal this weekend. Check it out!",
    time: "1 day ago",
  },
  {
    icon: Clock,
    title: "Points Expiring Soon",
    description: "You have 250 points expiring at the end of the month. Don't lose them!",
    time: "3 days ago",
  },
];

export default function NotificationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Notifications</h1>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 border-b last:border-b-0"
              >
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <notification.icon className="h-5 w-5" />
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
