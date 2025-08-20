"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log('🔐 Attempting login for:', email);
      const user = await login(email, password);
      
      console.log('✅ Login successful, user type:', user.userType);
      
      const welcomeMessage = user.userType === 'business' 
        ? `Welcome back to your business dashboard, ${user.businessName || 'Admin'}!`
        : `Welcome back, ${user.fullName || 'Customer'}!`;
      
      toast({
        title: "Login successful!",
        description: welcomeMessage,
      });

      // Automatic redirect based on user type from backend
      const redirectUrl = user.userType === 'customer' ? '/customer/dashboard' : '/admin/dashboard';
      console.log('🚀 Redirecting to:', redirectUrl);
      
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/smart-rewards-zw.png?v=2" 
              alt="Smart Rewards ZW Logo" 
              width={80} 
              height={80} 
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-headline">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials below - you'll be automatically redirected to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Get Started
              </Link>
            </div>
            <div>
              <Link
                href="#"
                className="text-sm underline hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
