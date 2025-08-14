import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, TrendingUp } from "lucide-react";
import AiInsights from "@/components/admin/ai-insights";

const mukandoGroups = [
  { name: "Harare Techies Round", members: 12, contributions: "$1200 / $2400", nextPayout: "2024-07-30", status: "Active" },
  { name: "Bulawayo Entrepreneurs", members: 8, contributions: "$800 / $1600", nextPayout: "2024-08-15", status: "Active" },
  { name: "Mutare Retailers", members: 15, contributions: "$3000 / $3000", nextPayout: "2024-07-25", status: "Payout Ready" },
];

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+180 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+540</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mukando/maRound Management</CardTitle>
              <CardDescription>Overview of all active savings groups.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Next Payout</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mukandoGroups.map((group) => (
                    <TableRow key={group.name}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.members}</TableCell>
                      <TableCell>{group.contributions}</TableCell>
                      <TableCell>{group.nextPayout}</TableCell>
                      <TableCell>
                        <Badge variant={group.status === 'Active' ? 'secondary' : 'default'}>{group.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
            <AiInsights />
        </div>
      </div>
    </div>
  );
}
