"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Users,
  TrendingUp,
  Star,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_category: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo_url: string;
  website_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    created_at: string;
  };
}

interface BusinessStats {
  totalCustomers: number;
  totalTransactions: number;
  totalPointsAwarded: number;
  totalOffersCreated: number;
  mukandoGroupsHosted: number;
  averageRating: number;
}

export default function BusinessProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<BusinessProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await adminApi.getBusinessProfile();
        setProfile(profileData);
        setEditedProfile(profileData);
        
        // Mock stats for now - can be implemented with real API calls
        setStats({
          totalCustomers: Math.floor(Math.random() * 500) + 100,
          totalTransactions: Math.floor(Math.random() * 2000) + 500,
          totalPointsAwarded: Math.floor(Math.random() * 50000) + 10000,
          totalOffersCreated: Math.floor(Math.random() * 20) + 5,
          mukandoGroupsHosted: Math.floor(Math.random() * 10) + 2,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
        });
      } catch (error) {
        console.error('Failed to fetch business profile:', error);
        toast({
          title: "Error",
          description: "Failed to load business profile",
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
    if (!profile || !editedProfile) return;

    try {
      const updatedProfile = await adminApi.updateBusinessProfile(editedProfile);
      setProfile(updatedProfile.business);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update business profile:', error);
      toast({
        title: "Error",
        description: "Failed to update business profile",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Loading business profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Business profile not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Business Profile</h1>
          <p className="text-muted-foreground">Manage your business information and settings.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Business Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Your business details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Logo and Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.business_name}`} />
                <AvatarFallback className="text-lg">
                  {profile.business_name?.split(' ').map(n => n[0]).join('') || 'BU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={editedProfile.business_name || ''}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business_category">Category</Label>
                      <Input
                        id="business_category"
                        value={editedProfile.business_category || ''}
                        onChange={(e) => handleInputChange('business_category', e.target.value)}
                        placeholder="e.g., Restaurant, Retail, Technology"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{profile.business_name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {profile.business_category}
                    </Badge>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Mail className="h-4 w-4" />
                      {profile.user?.email || 'Email not available'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <Label className="text-sm font-medium">Business Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedProfile.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell customers about your business..."
                  className="mt-2"
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.description || 'No description provided'}
                </p>
              )}
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Contact Email</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.contact_email || ''}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contact@business.com"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.contact_email || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">Contact Phone</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.contact_phone || ''}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+263 4 123 4567"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.contact_phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Website</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.website_url || ''}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://www.business.com"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.website_url ? (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website_url}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Account Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.user?.email || 'Email not available'}</p>
              </div>
            </div>

            {/* Address */}
            <div>
              <Label className="text-sm font-medium">Business Address</Label>
              {isEditing ? (
                <Textarea
                  value={editedProfile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your business address..."
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.address || 'Not provided'}
                </p>
              )}
            </div>

            {/* Location Coordinates */}
            {(profile.latitude && profile.longitude) && (
              <div>
                <Label className="text-sm font-medium">Location Coordinates</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Lat: {profile.latitude.toFixed(6)}, Lng: {profile.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <Separator />

            {/* Registration Date */}
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
          </CardContent>
        </Card>

        {/* Business Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Customers</span>
                    <span className="font-medium">{stats.totalCustomers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transactions</span>
                    <span className="font-medium">{stats.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Points Awarded</span>
                    <span className="font-medium">{stats.totalPointsAwarded.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Offers Created</span>
                    <span className="font-medium">{stats.totalOffersCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mukando Groups</span>
                    <span className="font-medium">{stats.mukandoGroupsHosted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{stats.averageRating}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className="bg-yellow-100 text-yellow-800">
                  Top Rated Business
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Active Community Member
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Mukando Partner
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Customers
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}