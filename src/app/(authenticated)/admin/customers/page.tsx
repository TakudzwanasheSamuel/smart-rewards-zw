"use client";
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
import { MoreHorizontal, Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const customers = [
  { id: "CUST-001", name: "Tafadzwa Chihwa", email: "tafadzwa.c@example.com", tier: "Gold", points: 12530, ecoPoints: 500, status: "Active" },
  { id: "CUST-002", name: "Rudo Moyo", email: "rudo.moyo@example.com", tier: "Silver", points: 8200, ecoPoints: 320, status: "Active" },
  { id: "CUST-003", name: "Kudakwashe Banda", email: "k.banda@example.com", tier: "Bronze", points: 1500, ecoPoints: 50, status: "Inactive" },
  { id: "CUST-004", name: "Fadzai Shumba", email: "fadzaishumba@example.com", tier: "Platinum", points: 25000, ecoPoints: 1200, status: "Active" },
  { id: "CUST-005", name: "Tendai Mapuranga", email: "tendaim@example.com", tier: "Silver", points: 7800, ecoPoints: 280, status: "At Risk" },
];

const transactions = [
  { description: "Purchase at Store", amount: "+50 pts", date: "2024-07-20" },
  { description: "Redeemed Coffee", amount: "-25 pts", date: "2024-07-19" },
];

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  const handleActionClick = (customer: any, type: string) => {
    setSelectedCustomer(customer);
    setActionType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Customer Management</h1>
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 sm:w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter Segments
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>AI-Powered Segments</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>High-Spenders</DropdownMenuItem>
                <DropdownMenuItem>At-Risk</DropdownMenuItem>
                <DropdownMenuItem>New Customers</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Points</TableHead>
                 <TableHead className="text-right">Eco-Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.tier}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{customer.points.toLocaleString()}</TableCell>
                   <TableCell className="text-right font-medium">{customer.ecoPoints.toLocaleString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleActionClick(customer, 'profile')}>View profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActionClick(customer, 'points')}>Adjust points</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActionClick(customer, 'offer')}>Approve offer</DropdownMenuItem>
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
      
      {/* Modals for actions */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {actionType === 'profile' && selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCustomer.name}'s Profile</DialogTitle>
                <DialogDescription>{selectedCustomer.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                 <div>
                    <Label>Loyalty Tier: {selectedCustomer.tier}</Label>
                    <Progress value={60} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Progress to next tier</p>
                </div>
                <div>
                  <Label>Points Balance</Label>
                  <p className="font-bold text-lg">{selectedCustomer.points.toLocaleString()} pts / {selectedCustomer.ecoPoints} eco-pts</p>
                </div>
                <div>
                   <Label>Transaction History</Label>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, i) => (
                        <TableRow key={i}><TableCell>{tx.description}</TableCell><TableCell>{tx.amount}</TableCell><TableCell>{tx.date}</TableCell></TableRow>
                      ))}
                    </TableBody>
                   </Table>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}

          {actionType === 'points' && selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Adjust Points for {selectedCustomer.name}</DialogTitle>
                <DialogDescription>Current Balance: {selectedCustomer.points.toLocaleString()} points</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="points-change" className="text-right">Amount</Label>
                  <Input id="points-change" type="number" defaultValue="100" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">Reason</Label>
                  <Input id="reason" placeholder="e.g., Customer service gesture" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsModalOpen(false)}>Confirm Adjustment</Button>
              </DialogFooter>
            </>
          )}

          {actionType === 'offer' && selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Approve Offer for {selectedCustomer.name}</DialogTitle>
                <DialogDescription>Select an offer to manually grant to this customer.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an offer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer-1">Weekend Special: 2-for-1</SelectItem>
                    <SelectItem value="offer-2">Birthday Bonus: 100 Points</SelectItem>
                    <SelectItem value="offer-3">Exclusive: 20% Off Next Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsModalOpen(false)}>Approve & Notify Customer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
