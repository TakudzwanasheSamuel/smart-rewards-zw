"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LocationPicker from '@/components/admin/location-picker';

interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_category?: string;
  business_description?: string;
  contact_email?: string;
  contact_phone?: string;
  business_address?: string;
  logo_url?: string;
  website_url?: string;
  latitude?: number;
  longitude?: number;
  shared_loyalty_id?: string;
}

export default function LocationPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { toast } = useToast();

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getBusinessProfile();
        console.log('🏢 Business profile:', data);
        setBusiness(data);
      } catch (error) {
        console.error('❌ Error fetching business profile:', error);
        toast({
          title: "Error",
          description: "Failed to load business profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [toast]);

  const handleLocationSaved = (location: { latitude: number; longitude: number }) => {
    setBusiness(prev => prev ? { ...prev, ...location } : null);
    setShowLocationPicker(false);
    toast({
      title: "Success",
      description: "Business location updated successfully",
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Business Location</h1>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Business profile not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showLocationPicker) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <LocationPicker
          businessName={business.business_name}
          currentLocation={
            business.latitude && business.longitude
              ? { latitude: business.latitude, longitude: business.longitude }
              : undefined
          }
          onLocationSaved={handleLocationSaved}
          onClose={() => setShowLocationPicker(false)}
        />
      </div>
    );
  }

  const hasLocation = business.latitude && business.longitude;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Business Location</h1>
          <Button
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {hasLocation ? 'Update Location' : 'Set Location'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                <p className="mt-1 font-medium">{business.business_name}</p>
              </div>
              {business.business_category && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="mt-1">{business.business_category}</p>
                </div>
              )}
              {business.business_description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{business.business_description}</p>
                </div>
              )}
              {business.contact_email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <p className="mt-1">{business.contact_email}</p>
                </div>
              )}
              {business.contact_phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                  <p className="mt-1">{business.contact_phone}</p>
                </div>
              )}
              {business.business_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Address</label>
                  <p className="mt-1">{business.business_address}</p>
                </div>
              )}
              {business.website_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p className="mt-1">
                    <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {business.website_url}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Location Set</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Latitude:</span> {business.latitude?.toFixed(6)}</p>
                    <p><span className="font-medium">Longitude:</span> {business.longitude?.toFixed(6)}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      Your business is visible to customers on the map and can be found when they search for nearby offers.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">No Location Set</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      Set your business location to help customers find you on the map and discover your offers.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Set Business Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits of Setting Location */}
        <Card>
          <CardHeader>
            <CardTitle>Why Set Your Location?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Customer Discovery</h4>
                <p className="text-sm text-muted-foreground">
                  Customers can find your business on the map when looking for nearby offers
                </p>
              </div>
              <div className="text-center p-4">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Increased Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Your offers will appear in location-based searches and recommendations
                </p>
              </div>
              <div className="text-center p-4">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Better Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Track customer engagement based on proximity to your location
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
