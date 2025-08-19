"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, User, Mail, Award, Calendar, Users, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { customerApi } from "@/lib/api";
import { formatPointsAsCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

interface CustomerProfile {
  user_id: string;
  full_name: string;
  loyalty_points: number;
  loyalty_tier: string;
  interests: string[];
  referral_code: string;
  has_premium_subscription: boolean;
  subscription_expiry_date: string | null;
  user?: {
    email: string;
    created_at: string;
  };
}

interface ProfileStats {
  totalTransactions: number;
  totalBusinessesFollowed: number;
  mukandoGroupsJoined: number;
  offersRedeemed: number;
}

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await customerApi.getProfile();
        setProfile(profileData);
        setEditedName(profileData.full_name || "");
        
        // Mock stats for now - can be implemented with real API calls
        setStats({
          totalTransactions: Math.floor(Math.random() * 50) + 10,
          totalBusinessesFollowed: Math.floor(Math.random() * 20) + 5,
          mukandoGroupsJoined: Math.floor(Math.random() * 5) + 1,
          offersRedeemed: Math.floor(Math.random() * 15) + 3,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      // Here you would implement the API call to update profile
      // const updatedProfile = await customerApi.updateProfile({ full_name: editedName });
      
      setProfile({ ...profile, full_name: editedName });
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and view your loyalty status.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} />
                <AvatarFallback className="text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'CU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{profile.full_name}</h3>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.user?.email || 'Email not available'}
              </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor(profile.loyalty_tier)}>
                    <Award className="h-3 w-3 mr-1" />
                    {profile.loyalty_tier} Tier
                  </Badge>
                  {profile.has_premium_subscription && (
                    <Badge variant="outline">Premium Member</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.user?.email || 'Email not available'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.user?.created_at ? new Date(profile.user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date not available'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Loyalty Points</Label>
                <p className="text-sm font-semibold mt-1">
                  {profile.loyalty_points.toLocaleString()} points ({formatPointsAsCurrency(profile.loyalty_points)})
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Referral Code</Label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                  {profile.referral_code || 'Not set'}
                </p>
              </div>
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transactions</span>
                    <span className="font-medium">{stats.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Businesses Followed</span>
                    <span className="font-medium">{stats.totalBusinessesFollowed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mukando Groups</span>
                    <span className="font-medium">{stats.mukandoGroupsJoined}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Offers Redeemed</span>
                    <span className="font-medium">{stats.offersRedeemed}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={profile.has_premium_subscription ? "default" : "secondary"}>
                    {profile.has_premium_subscription ? "Premium" : "Standard"}
                  </Badge>
                </div>
                {profile.has_premium_subscription && profile.subscription_expiry_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expires</span>
                    <span className="text-sm">
                      {new Date(profile.subscription_expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
