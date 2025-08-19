"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { customerApi, loyaltyApi } from "@/lib/api";

export default function TestIntegrationPage() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCustomerProfile = async () => {
    try {
      const profile = await customerApi.getProfile();
      addResult(`✅ Customer profile loaded: ${profile.full_name || 'No name'}, Points: ${profile.loyalty_points}`);
    } catch (error: any) {
      addResult(`❌ Failed to load customer profile: ${error.message}`);
    }
  };

  const testBusinessList = async () => {
    try {
      const businesses = await customerApi.getBusinesses();
      addResult(`✅ Businesses loaded: ${businesses.length} found`);
    } catch (error: any) {
      addResult(`❌ Failed to load businesses: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      await login("test@example.com", "password123", "customer");
      addResult("✅ Login successful");
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Backend Integration Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </div>
            {user && (
              <div>
                <strong>User:</strong> {user.email} ({user.userType})
                <br />
                <strong>Name:</strong> {user.fullName || user.businessName || "Not set"}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={testLogin} variant="outline">
                Test Login
              </Button>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={testCustomerProfile} disabled={!isAuthenticated}>
                Test Customer Profile API
              </Button>
              <Button onClick={testBusinessList}>
                Test Business List API
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] font-mono text-sm">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No tests run yet. Click the buttons above to test the integration.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>1. Database Setup:</strong> Make sure PostgreSQL is running with PostGIS extension</p>
            <p><strong>2. Environment:</strong> Copy .env.example to .env and configure DATABASE_URL, JWT_SECRET</p>
            <p><strong>3. Database Migration:</strong> Run <code className="bg-gray-100 px-1">npx prisma db push</code></p>
            <p><strong>4. Test User:</strong> Register a customer account first, then test the APIs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
