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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  user_id: string;
  full_name: string;
  loyalty_points: number;
  eco_points: number;
  loyalty_tier: string;
  user?: {
    email: string;
  };
}

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [pointType, setPointType] = useState<"loyalty" | "eco">("loyalty");

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user || user.userType !== 'business') return;

      try {
        const customersData = await adminApi.getCustomers();
        setCustomers(customersData);
        setFilteredCustomers(customersData);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customers. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user, toast]);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleActionClick = (customer: Customer, type: string) => {
    setSelectedCustomer(customer);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handlePointsAdjustment = async () => {
    if (!selectedCustomer || adjustmentAmount === 0) return;

    try {
      if (pointType === "loyalty") {
        await adminApi.adjustPoints(selectedCustomer.user_id, adjustmentAmount);
      } else {
        await adminApi.adjustPoints(selectedCustomer.user_id, undefined, adjustmentAmount);
      }

      // Refresh customer data
      const customersData = await adminApi.getCustomers();
      setCustomers(customersData);
      setFilteredCustomers(customersData);

      toast({
        title: "Points adjusted successfully",
        description: `${adjustmentAmount > 0 ? 'Added' : 'Removed'} ${Math.abs(adjustmentAmount)} ${pointType} points`,
      });

      setIsModalOpen(false);
      setAdjustmentAmount(0);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to adjust points",
      });
    }
  };

  const getStatusBadge = (customer: Customer) => {
    // Simple status logic based on points and activity
    if (customer.loyalty_points > 10000) return { variant: "default" as const, text: "VIP" };
    if (customer.loyalty_points > 5000) return { variant: "secondary" as const, text: "Active" };
    if (customer.loyalty_points > 1000) return { variant: "outline" as const, text: "Regular" };
    return { variant: "destructive" as const, text: "New" };
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto ml-auto">
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm.trim() !== "" 
                        ? "No customers match your search criteria." 
                        : "No customers following your business yet."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const statusBadge = getStatusBadge(customer);
                  return (
                    <TableRow key={customer.user_id}>
                      <TableCell>
                        <div className="font-medium">{customer.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{customer.user?.email || 'No email'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.loyalty_tier}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{customer.loyalty_points.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{customer.eco_points.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.text}
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
                            <DropdownMenuItem onClick={() => handleActionClick(customer, 'view')}>View profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick(customer, 'points')}>Adjust points</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick(customer, 'offer')}>Send offer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {actionType === 'view' && selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCustomer.full_name || 'Customer'}'s Profile</DialogTitle>
                <DialogDescription>{selectedCustomer.user?.email || 'No email'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                 <div>
                    <Label>Loyalty Tier: {selectedCustomer.loyalty_tier}</Label>
                    <Progress value={60} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Progress to next tier</p>
                </div>
                <div>
                  <Label>Balances</Label>
                  <p className="font-bold text-lg">{selectedCustomer.loyalty_points.toLocaleString()} pts / {selectedCustomer.eco_points.toLocaleString()} eco-pts</p>
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
                <DialogTitle>Adjust Points for {selectedCustomer.full_name || 'Customer'}</DialogTitle>
                <DialogDescription>Current Balance: {selectedCustomer.loyalty_points.toLocaleString()} loyalty points, {selectedCustomer.eco_points.toLocaleString()} eco points</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="points-change" className="text-right">Amount</Label>
                  <Input 
                    id="points-change" 
                    type="number" 
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter positive or negative number"
                    className="col-span-3" 
                  />
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

           {actionType === 'eco-points' && selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Adjust Eco-Points for {selectedCustomer.name}</DialogTitle>
                <DialogDescription>Current Balance: {selectedCustomer.ecoPoints.toLocaleString()} eco-points</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="eco-points-change" className="text-right">Amount</Label>
                  <Input id="eco-points-change" type="number" defaultValue="50" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">Reason</Label>
                  <Input id="reason" placeholder="e.g., Sustainable action reward" className="col-span-3" />
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
