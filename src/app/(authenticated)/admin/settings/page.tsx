"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail,
  FileText,
  Building2,
  CreditCard,
  Users,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_category: string;
  user: {
    email: string;
  };
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export default function BusinessSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    analytics: true,
    customer_activity: true,
  });

  const [businessSettings, setBusinessSettings] = useState({
    auto_approve_mukando: false,
    allow_customer_reviews: true,
    public_business_stats: false,
    loyalty_program_active: true,
  });

  // Support form states
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });

  // Mock support tickets for business
  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Integration with POS system',
      status: 'resolved',
      created_at: '2024-01-10T09:30:00Z',
      priority: 'high',
      category: 'technical'
    },
    {
      id: '2',
      subject: 'Bulk customer import feature',
      status: 'in_progress',
      created_at: '2024-01-18T11:45:00Z',
      priority: 'medium',
      category: 'feature_request'
    }
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await adminApi.getBusinessProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch business profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleBusinessSettingChange = (key: string, value: boolean) => {
    setBusinessSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Business Settings Updated",
      description: "Your business preferences have been saved.",
    });
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would submit to API
    console.log('Business support ticket:', supportForm);
    
    toast({
      title: "Support Ticket Created",
      description: "Our business support team will contact you within 4 hours.",
    });

    // Reset form
    setSupportForm({
      subject: '',
      category: 'general',
      priority: 'medium',
      message: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Business Settings & Support</h1>
          <p className="text-muted-foreground">Manage your business preferences and get enterprise support.</p>
        </div>
      </div>

      {/* Business Info Card */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm font-medium">Business Name</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.business_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.business_category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive business notifications and updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Account updates and important announcements
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Customer Activity Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        New customers, transactions, and reviews
                      </p>
                    </div>
                    <Switch
                      checked={notifications.customer_activity}
                      onCheckedChange={(checked) => handleNotificationChange('customer_activity', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly and monthly business insights
                      </p>
                    </div>
                    <Switch
                      checked={notifications.analytics}
                      onCheckedChange={(checked) => handleNotificationChange('analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical alerts and urgent notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Platform updates and promotional opportunities
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Business Preferences
                </CardTitle>
                <CardDescription>
                  Configure your loyalty program and customer interaction settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Loyalty Program</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable point earning and rewards for customers
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.loyalty_program_active}
                      onCheckedChange={(checked) => handleBusinessSettingChange('loyalty_program_active', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Mukando Groups</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new savings group requests
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.auto_approve_mukando}
                      onCheckedChange={(checked) => handleBusinessSettingChange('auto_approve_mukando', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Customer Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Let customers rate and review your business
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.allow_customer_reviews}
                      onCheckedChange={(checked) => handleBusinessSettingChange('allow_customer_reviews', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Business Statistics</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your business stats publicly to customers
                      </p>
                    </div>
                    <Switch
                      checked={businessSettings.public_business_stats}
                      onCheckedChange={(checked) => handleBusinessSettingChange('public_business_stats', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account & Security
              </CardTitle>
              <CardDescription>
                Manage your account security and data settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Team Management
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Business Support
                </CardTitle>
                <CardDescription>
                  Get priority support for your business needs and technical issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                      placeholder="Brief description of your business need"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={supportForm.category}
                        onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="general">General Business Inquiry</option>
                        <option value="technical">Technical Integration</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="analytics">Analytics & Reporting</option>
                        <option value="api">API & Development</option>
                        <option value="loyalty">Loyalty Program Setup</option>
                        <option value="mukando">Mukando Group Management</option>
                        <option value="feature_request">Feature Request</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={supportForm.priority}
                        onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High - Business Impact</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Detailed Description</Label>
                    <Textarea
                      id="message"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      placeholder="Please provide detailed information about your business need or technical issue..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Business Support Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Business Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Popular Topics</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Setting up loyalty program rules</li>
                      <li>• Integrating with POS systems</li>
                      <li>• Managing Mukando groups</li>
                      <li>• Understanding analytics reports</li>
                      <li>• Customer engagement strategies</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Business Documentation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      API Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Support Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Business Hotline</p>
                      <p className="text-sm text-muted-foreground">+263 4 123 4567 (Ext. 2)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Business Support</p>
                      <p className="text-sm text-muted-foreground">business@smartrewards.co.zw</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Priority Hours:</strong> 24/7 for High Priority</p>
                    <p><strong>Standard Hours:</strong> Mon-Fri, 7:00 AM - 8:00 PM</p>
                    <p><strong>Response Time:</strong> Within 4 hours for business accounts</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Support Tickets</CardTitle>
              <CardDescription>
                Track your business support requests and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supportTickets.length > 0 ? (
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            Category: {ticket.category.replace('_', ' ')} • Created {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">No Support Tickets</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't submitted any business support tickets yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
