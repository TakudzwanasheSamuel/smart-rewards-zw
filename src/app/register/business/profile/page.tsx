"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ui/image-upload';
import LocationMap from '@/components/ui/location-map';
import { Building, MapPin, Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LatLng {
  lat: number;
  lng: number;
}

interface BusinessProfileData {
  businessName: string;
  businessCategory: string;
  description: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  location: LatLng;
}

const BUSINESS_CATEGORIES = [
  'retail',
  'food', 
  'services',
  'hardware',
  'groceries',
  'entertainment',
  'other'
];

const getCategoryDisplayName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'retail': 'Retail',
    'food': 'Fast Food & Restaurant',
    'services': 'Services (Salon, etc.)',
    'hardware': 'Hardware',
    'groceries': 'Groceries',
    'entertainment': 'Entertainment',
    'other': 'Other'
  };
  return categoryMap[category] || category;
};

export default function BusinessProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessProfileData>({
    businessName: '',
    businessCategory: '',
    description: '',
    contactPhone: '',
    address: '',
    logoUrl: '',
    location: { lat: -19.015438, lng: 29.154857 } // Default to Zimbabwe
  });

  const [errors, setErrors] = useState<Partial<BusinessProfileData>>({});
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch existing business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to continue.",
            variant: "destructive",
          });
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/register/business/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const business = data.business;
          
          // Pre-populate form with existing data
          setFormData({
            businessName: business.business_name || '',
            businessCategory: business.business_category || '',
            description: business.description || '',
            contactPhone: business.contact_phone || '',
            address: business.address || '',
            logoUrl: business.logo_url || '',
            location: business.location ? {
              lat: business.location.coordinates[1],
              lng: business.location.coordinates[0]
            } : { lat: -19.015438, lng: 29.154857 } // Default to Zimbabwe
          });
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
        // Continue with empty form if fetch fails
      } finally {
        setInitialLoad(false);
      }
    };

    fetchBusinessData();
  }, [router, toast]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessProfileData> = {};

    // Business name and category are pre-filled from registration, so no validation needed
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BusinessProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (location: LatLng) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const handleLogoUpload = (logoUrl: string) => {
    setFormData(prev => ({ ...prev, logoUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      // Submit business profile
      const response = await fetch('/api/auth/register/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_name: formData.businessName,
          business_category: formData.businessCategory,
          description: formData.description,
          contact_phone: formData.contactPhone,
          address: formData.address,
          logo_url: formData.logoUrl,
          location: {
            type: 'Point',
            coordinates: [formData.location.lng, formData.location.lat] // GeoJSON format: [longitude, latitude]
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save business profile');
      }

      toast({
        title: "Success!",
        description: "Your business profile has been created successfully.",
      });

      // Redirect to loyalty setup
      router.push('/register/business/loyalty-setup');

    } catch (error) {
      console.error('Business profile creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create business profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile Setup</h1>
          <p className="text-gray-600">
            Complete your business profile to start building customer loyalty
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Account Created</span>
            </div>
            <div className="h-px w-12 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Business Profile</span>
            </div>
            <div className="h-px w-12 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Loyalty Setup</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {initialLoad ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600">Loading your business information...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This was set during account creation. <Link href="/register/business" className="text-blue-500 hover:underline">Go back to change</Link>
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="businessCategory">Business Category *</Label>
                      <Input
                        id="businessCategory"
                        value={getCategoryDisplayName(formData.businessCategory)}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This was set during account creation. <Link href="/register/business" className="text-blue-500 hover:underline">Go back to change</Link>
                      </p>
                    </div>
                  </div>
                </>
              )}

              {!initialLoad && (
                <>
                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your business and what makes it special..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+263 123 456 789"
                        className={errors.contactPhone ? 'border-red-500' : ''}
                      />
                      {errors.contactPhone && (
                        <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Business Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address, city, country"
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Business Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <ImageUpload
                  onImageUpload={handleLogoUpload}
                  currentImage={formData.logoUrl}
                  placeholder="Upload your business logo"
                  maxSizeMB={5}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Upload a logo that represents your business. This will be displayed to customers.
              </p>
            </CardContent>
          </Card>

          {/* Location Selection */}
          <div>
            <LocationMap
              onLocationSelect={handleLocationSelect}
              initialLocation={formData.location}
              height="400px"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Link href="/register/business">
              <Button variant="outline" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <Button type="submit" disabled={loading || initialLoad}>
              {loading ? (
                'Saving...'
              ) : initialLoad ? (
                'Loading...'
              ) : (
                <>
                  Continue to Loyalty Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}