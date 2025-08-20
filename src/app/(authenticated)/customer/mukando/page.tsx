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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mukandoApi, customerApi } from '@/lib/api';
import { formatPointsAsCurrency } from '@/lib/currency';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Coins, 
  Plus, 
  UserPlus,
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/error-boundary';

interface MukandoGroup {
  id: string;
  goal_name: string;
  goal_points_required: number;
  contribution_interval: string;
  term_length: number;
  status: string;
  discount_rate: number;
  total_mukando_points: number;
  total_loyalty_points_earned: number;
  created_at: string;
  creator: {
    user_id: string;
    full_name: string;
  };
  business: {
    user_id: string;
    business_name: string;
  };
  members: Array<{
    customer: {
      user_id: string;
      full_name: string;
    };
    payout_order: number;
    points_contributed: number;
    joined_at: string;
  }>;
  progressPercentage: number;
  memberCount: number;
  isCreator: boolean;
  isMember: boolean;
  customerContribution: number;
  payoutOrder: number | null;
}

interface AvailableGroup {
  id: string;
  goal_name: string;
  goal_points_required: number;
  contribution_interval: string;
  term_length: number;
  discount_rate: number;
  total_mukando_points: number;
  max_members: number;
  creator: {
    user_id: string;
    full_name: string;
  };
  business: {
    user_id: string;
    business_name: string;
    business_category: string;
  };
  memberCount: number;
  spotsRemaining: number | null;
  progressPercentage: number;
  members: Array<{
    customer: {
      user_id: string;
      full_name: string;
    };
    payout_order: number;
    points_contributed: number;
    joined_at: string;
  }>;
}

function MukandoPageContent() {
  const [myGroups, setMyGroups] = useState<MukandoGroup[]>([]);
  const [availableGroups, setAvailableGroups] = useState<AvailableGroup[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MukandoGroup | null>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const { toast } = useToast();

  // Form states
  const [createForm, setCreateForm] = useState({
    businessId: '',
    goalName: '',
    goalPointsRequired: '',
    contributionInterval: 'monthly',
    termLength: '12'
  });
  const [contributeAmount, setContributeAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with individual error handling
      const [myGroupsResult, availableGroupsResult, businessesResult, profileResult] = await Promise.allSettled([
        mukandoApi.getMyGroups().catch(err => {
          console.warn('Failed to fetch my groups:', err);
          return { groups: [] };
        }),
        mukandoApi.getAvailableGroups().catch(err => {
          console.warn('Failed to fetch available groups:', err);
          return { availableGroups: [] };
        }),
        customerApi.getBusinesses().catch(err => {
          console.warn('Failed to fetch businesses:', err);
          return [];
        }),
        customerApi.getProfile().catch(err => {
          console.warn('Failed to fetch profile:', err);
          return { loyalty_points: 0 };
        })
      ]);
      
      // Extract data from settled promises
      const myGroupsData = myGroupsResult.status === 'fulfilled' ? myGroupsResult.value : { groups: [] };
      const availableGroupsData = availableGroupsResult.status === 'fulfilled' ? availableGroupsResult.value : { availableGroups: [] };
      const businessesData = businessesResult.status === 'fulfilled' ? businessesResult.value : [];
      const profileData = profileResult.status === 'fulfilled' ? profileResult.value : { loyalty_points: 0 };
      
      setMyGroups(myGroupsData.groups || []);
      setAvailableGroups(availableGroupsData.availableGroups || []);
      setBusinesses(businessesData || []);
      setCustomerProfile(profileData);
      
      // Show a warning if any calls failed
      const failedCalls = [myGroupsResult, availableGroupsResult, businessesResult, profileResult]
        .filter(result => result.status === 'rejected').length;
      
      if (failedCalls > 0) {
        toast({
          title: "Partial Load",
          description: "Some Mukando data couldn't be loaded. The feature is currently being set up.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching Mukando data:', error);
      toast({
        title: "Information",
        description: "Mukando groups are being set up. Please check back later!",
        variant: "default",
      });
      
      // Set default empty state
      setMyGroups([]);
      setAvailableGroups([]);
      setBusinesses([]);
      setCustomerProfile({ loyalty_points: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async () => {
    try {
      if (!createForm.businessId || !createForm.goalName || !createForm.goalPointsRequired) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await mukandoApi.createGroupRequest({
        businessId: createForm.businessId,
        goalName: createForm.goalName,
        goalPointsRequired: parseInt(createForm.goalPointsRequired),
        contributionInterval: createForm.contributionInterval,
        termLength: parseInt(createForm.termLength)
      });

      toast({
        title: "Success",
        description: "Mukando group request created! Waiting for business approval.",
      });

      setShowCreateDialog(false);
      setCreateForm({
        businessId: '',
        goalName: '',
        goalPointsRequired: '',
        contributionInterval: 'monthly',
        termLength: '12'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating group:', error);
      
      // Handle specific error messages gracefully
      let errorMessage = "Unable to create group at this time. Please try again later.";
      
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = "A group with this name already exists for this business.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Business not found. Please refresh the page and try again.";
        } else if (error.message.includes('Invalid token')) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.message.includes('permission')) {
          errorMessage = "You don't have permission to create groups for this business.";
        }
      }
      
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await mukandoApi.joinGroup(groupId);
      toast({
        title: "Success",
        description: "Successfully joined the Mukando group!",
      });
      fetchData();
    } catch (error: any) {
      console.error('Error joining group:', error);
      
      // Handle specific error messages gracefully
      let errorMessage = "Unable to join this group at this time. Please try again later.";
      
      if (error.message) {
        if (error.message.includes('already a member')) {
          errorMessage = "You are already a member of this group.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Group not found. Please refresh the page and try again.";
        } else if (error.message.includes('full')) {
          errorMessage = "This group is already full. Please try another group.";
        } else if (error.message.includes('Invalid token')) {
          errorMessage = "Your session has expired. Please log in again.";
        }
      }
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleContribute = async () => {
    if (!selectedGroup || !contributeAmount) return;

    try {
      const amount = parseInt(contributeAmount);
      if (amount <= 0 || amount > (customerProfile?.loyalty_points || 0)) {
        toast({
          title: "Error",
          description: "Invalid contribution amount",
          variant: "destructive",
        });
        return;
      }

      const result = await mukandoApi.contributeToGroup(selectedGroup.id, amount);
      
      toast({
        title: "Contribution Successful!",
        description: `Contributed ${amount} points. Earned ${result.customerStatus.loyaltyPointsEarned} loyalty points!`,
      });

      setShowContributeDialog(false);
      setContributeAmount('');
      setSelectedGroup(null);
      fetchData();
    } catch (error: any) {
      console.error('Error contributing:', error);
      
      // Handle specific error messages gracefully
      let errorMessage = "Unable to contribute at this time. Please try again later.";
      
      if (error.message) {
        if (error.message.includes('not a member')) {
          errorMessage = "You need to join this group before contributing. Please join the group first.";
        } else if (error.message.includes('Insufficient')) {
          errorMessage = "You don't have enough loyalty points for this contribution.";
        } else if (error.message.includes('not approved')) {
          errorMessage = "This group is not yet approved for contributions.";
        } else if (error.message.includes('not found')) {
          errorMessage = "Group not found. Please refresh the page and try again.";
        } else if (error.message.includes('Invalid token')) {
          errorMessage = "Your session has expired. Please log in again.";
        }
      }
      
      toast({
        title: "Contribution Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
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

  // Error boundary - if something goes wrong, show a friendly error message
  if (!myGroups || !availableGroups || !businesses || !customerProfile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading your Mukando groups.</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Mukando Groups</h1>
          <p className="text-muted-foreground">Community savings for shared goals</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Mukando Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business">Business</Label>
                <Select value={createForm.businessId} onValueChange={(value) => 
                  setCreateForm(prev => ({ ...prev, businessId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.user_id} value={business.user_id}>
                        {business.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={createForm.goalName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, goalName: e.target.value }))}
                  placeholder="e.g., Gaming Console, Vacation Package"
                />
              </div>
              
              <div>
                <Label htmlFor="goalPoints">Goal Points Required</Label>
                <Input
                  id="goalPoints"
                  type="number"
                  value={createForm.goalPointsRequired}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, goalPointsRequired: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              
              <div>
                <Label htmlFor="interval">Contribution Interval</Label>
                <Select value={createForm.contributionInterval} onValueChange={(value) => 
                  setCreateForm(prev => ({ ...prev, contributionInterval: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="termLength">Term Length (months)</Label>
                <Input
                  id="termLength"
                  type="number"
                  value={createForm.termLength}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, termLength: e.target.value }))}
                  placeholder="12"
                />
              </div>
              
              <Button onClick={handleCreateGroup} className="w-full">
                Create Group Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="available">Available Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-groups" className="space-y-4">
                      {myGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  You're not part of any Mukando groups yet.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Mukando groups allow you to save together with others toward shared goals!
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Create a new group or join an existing one to start saving together.
                </p>
              </CardContent>
            </Card>
          ) : (
            myGroups.map((group) => (
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
                          <Building className="w-3 h-3 mr-1" />
                          {group.business.business_name}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Your Position</p>
                      <p className="font-bold">#{group.payoutOrder || 'N/A'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{group.progressPercentage}%</span>
                    </div>
                    <Progress value={group.progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.total_mukando_points} / {group.goal_points_required} points 
                      ({formatPointsAsCurrency(group.total_mukando_points)} / {formatPointsAsCurrency(group.goal_points_required)})
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your Contribution</p>
                      <p className="font-semibold">{group.customerContribution} points</p>
                      <p className="text-xs text-muted-foreground">{formatPointsAsCurrency(group.customerContribution)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-semibold">{group.memberCount} members</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Discount Rate</p>
                      <p className="font-semibold text-green-600">{group.discount_rate}% off</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-semibold">{group.term_length} months</p>
                    </div>
                  </div>
                  
                  {group.status === 'approved' && (
                    <Button 
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowContributeDialog(true);
                      }}
                      className="w-full"
                    >
                      <Coins className="mr-2 h-4 w-4" />
                      Contribute Points
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          {availableGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No groups available to join right now.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Mukando groups are community savings circles where members contribute points toward shared goals.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Check back later or create your own group to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            availableGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {group.goal_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <Building className="w-3 h-3 mr-1" />
                          {group.business.business_name}
                        </Badge>
                        <Badge variant="outline">
                          {group.business.business_category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Spots Left</p>
                      <p className="font-bold">{group.spotsRemaining || 'Unlimited'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{group.progressPercentage}%</span>
                    </div>
                    <Progress value={group.progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.total_mukando_points} / {group.goal_points_required} points
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-semibold">{group.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Discount</p>
                      <p className="font-semibold text-green-600">{group.discount_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-semibold">{group.term_length}mo</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Created by: {group.creator.full_name}</p>
                    <p>Contribution: {group.contribution_interval}</p>
                  </div>
                  
                  <Button 
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contribute to {selectedGroup?.goal_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Available Points: {customerProfile?.loyalty_points || 0} 
                ({formatPointsAsCurrency(customerProfile?.loyalty_points || 0)})
              </p>
              <Label htmlFor="contributeAmount">Points to Contribute</Label>
              <Input
                id="contributeAmount"
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                placeholder="Enter amount"
                max={Math.max(0, customerProfile?.loyalty_points || 0)}
              />
            </div>
            
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
              <p><strong>💡 Tip:</strong> You'll earn 10% of contributed points back as loyalty points!</p>
              {contributeAmount && (
                <p className="mt-1">
                  Contributing {contributeAmount} points = {Math.floor((parseInt(contributeAmount) || 0) * 0.1)} loyalty points earned
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleContribute} className="flex-1">
                Contribute
              </Button>
              <Button variant="outline" onClick={() => setShowContributeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MukandoPage() {
  return (
    <ErrorBoundary>
      <MukandoPageContent />
    </ErrorBoundary>
  );
}
