"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { mukandoApi } from '@/lib/api';
import { formatPointsAsCurrency } from '@/lib/currency';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Coins, 
  CheckCircle, 
  XCircle,
  Clock,
  Gift,
  AlertCircle,
  Eye,
  UserCheck,
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BusinessMukandoGroup {
  id: string;
  goal_name: string;
  goal_points_required: number;
  contribution_interval: string;
  term_length: number;
  status: string;
  max_members: number;
  discount_rate: number;
  total_mukando_points: number;
  total_loyalty_points_earned: number;
  current_payout_turn: number;
  created_at: string;
  approved_at?: string;
  creator: {
    user_id: string;
    full_name: string;
  };
  members: Array<{
    id: string;
    customer_id: string;
    points_contributed: number;
    payout_order: number;
    joined_at: string;
    customer: {
      user_id: string;
      full_name: string;
    };
  }>;
  contributions: Array<{
    id: string;
    customer_id: string;
    points_amount: number;
    loyalty_points_awarded: number;
    created_at: string;
    customer: {
      user_id: string;
      full_name: string;
    };
  }>;
  business: {
    business_name: string;
  };
  progressPercentage: number;
  memberCount: number;
  contributionCount: number;
}

export default function AdminMukandoPage() {
  const [groups, setGroups] = useState<BusinessMukandoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<BusinessMukandoGroup | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    maxMembers: '',
    discountRate: ''
  });
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await mukandoApi.getBusinessGroups();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching Mukando groups:', error);
      toast({
        title: "Error",
        description: "Failed to load Mukando groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleApproveGroup = async () => {
    if (!selectedGroup || !approvalForm.maxMembers || !approvalForm.discountRate) {
      toast({
        title: "Error",
        description: "Please fill in all approval details",
        variant: "destructive",
      });
      return;
    }

    try {
      await mukandoApi.approveGroup(
        selectedGroup.id,
        parseInt(approvalForm.maxMembers),
        parseFloat(approvalForm.discountRate)
      );

      toast({
        title: "Success",
        description: "Mukando group approved successfully!",
      });

      setShowApprovalDialog(false);
      setSelectedGroup(null);
      setApprovalForm({ maxMembers: '', discountRate: '' });
      fetchGroups();
    } catch (error) {
      console.error('Error approving group:', error);
      toast({
        title: "Error",
        description: "Failed to approve group",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600"><Gift className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGroupsByStatus = (status: string) => {
    return groups.filter(group => group.status === status);
  };

  const pendingGroups = getGroupsByStatus('pending_approval');
  const activeGroups = getGroupsByStatus('approved');
  const completedGroups = getGroupsByStatus('completed');

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Mukando Management</h1>
          <p className="text-muted-foreground">Manage customer savings groups for your business</p>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{pendingGroups.length}</p>
            <p className="text-sm text-orange-600">Pending</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{activeGroups.length}</p>
            <p className="text-sm text-green-600">Active</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{completedGroups.length}</p>
            <p className="text-sm text-blue-600">Completed</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approval ({pendingGroups.length})</TabsTrigger>
          <TabsTrigger value="active">Active Groups ({activeGroups.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGroups.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No pending group requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {group.goal_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(group.status)}
                        <Badge variant="secondary">
                          {group.goal_points_required} points target
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Created by</p>
                      <p className="font-medium">{group.creator.full_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Goal Amount</p>
                      <p className="font-semibold">{formatPointsAsCurrency(group.goal_points_required)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term Length</p>
                      <p className="font-semibold">{group.term_length} months</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contribution</p>
                      <p className="font-semibold">{group.contribution_interval}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requested</p>
                      <p className="font-semibold">{new Date(group.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowApprovalDialog(true);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {activeGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No active groups yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {group.goal_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(group.status)}
                        <Badge variant="secondary">
                          {group.discount_rate}% discount
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-bold text-2xl">{group.progressPercentage}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Progress value={group.progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.total_mukando_points} / {group.goal_points_required} points
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-semibold">{group.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Members</p>
                      <p className="font-semibold">{group.max_members}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contributions</p>
                      <p className="font-semibold">{group.contributionCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loyalty Points</p>
                      <p className="font-semibold">{group.total_loyalty_points_earned}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowDetailsDialog(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No completed groups yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    {group.goal_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(group.status)}
                    <Badge variant="secondary">
                      {group.memberCount} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Saved</p>
                      <p className="font-semibold">{formatPointsAsCurrency(group.total_mukando_points)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Discount Given</p>
                      <p className="font-semibold">{group.discount_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-semibold">{new Date(group.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Mukando Group: {selectedGroup?.goal_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p><strong>Goal:</strong> {selectedGroup?.goal_name}</p>
              <p><strong>Target:</strong> {formatPointsAsCurrency(selectedGroup?.goal_points_required || 0)}</p>
              <p><strong>Term:</strong> {selectedGroup?.term_length} months</p>
              <p><strong>Created by:</strong> {selectedGroup?.creator.full_name}</p>
            </div>
            
            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={approvalForm.maxMembers}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, maxMembers: e.target.value }))}
                placeholder="e.g., 10"
              />
            </div>
            
            <div>
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <Input
                id="discountRate"
                type="number"
                value={approvalForm.discountRate}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, discountRate: e.target.value }))}
                placeholder="e.g., 15"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleApproveGroup} className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Group
              </Button>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.goal_name} - Group Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Group Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Progress</p>
                <Progress value={selectedGroup?.progressPercentage} className="h-2 mt-1" />
                <p className="text-xs mt-1">{selectedGroup?.progressPercentage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Discount Rate</p>
                <p className="font-semibold text-green-600">{selectedGroup?.discount_rate}%</p>
              </div>
            </div>

            {/* Members Table */}
            <div>
              <h4 className="font-semibold mb-2">Members ({selectedGroup?.memberCount})</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Payout Order</TableHead>
                    <TableHead>Contributed</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroup?.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.customer.full_name}</TableCell>
                      <TableCell>#{member.payout_order}</TableCell>
                      <TableCell>{member.points_contributed} pts</TableCell>
                      <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Recent Contributions */}
            {selectedGroup?.contributions && selectedGroup.contributions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Contributions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Loyalty Points</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGroup.contributions.slice(0, 5).map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell>{contribution.customer.full_name}</TableCell>
                        <TableCell>{contribution.points_amount} pts</TableCell>
                        <TableCell>{contribution.loyalty_points_awarded} pts</TableCell>
                        <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
