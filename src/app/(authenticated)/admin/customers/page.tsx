import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";

const customers = [
  { id: "CUST-001", name: "Tafadzwa Chihwa", email: "tafadzwa.c@example.com", tier: "Gold", points: 12530, status: "Active" },
  { id: "CUST-002", name: "Rudo Moyo", email: "rudo.moyo@example.com", tier: "Silver", points: 8200, status: "Active" },
  { id: "CUST-003", name: "Kudakwashe Banda", email: "k.banda@example.com", tier: "Bronze", points: 1500, status: "Inactive" },
  { id: "CUST-004", name: "Fadzai Shumba", email: "fadzaishumba@example.com", tier: "Platinum", points: 25000, status: "Active" },
  { id: "CUST-005", name: "Tendai Mapuranga", email: "tendaim@example.com", tier: "Silver", points: 7800, status: "At Risk" },
];

export default function CustomersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Customer Management</h1>
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 sm:w-full"
            />
          </div>
          {/* Add filter dropdowns here if needed */}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-xs">{customer.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{customer.points.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "Active"
                          ? "secondary"
                          : customer.status === "At Risk"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Adjust points</DropdownMenuItem>
                        <DropdownMenuItem>Send offer</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Deactivate user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
