import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Building, User } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">Join Smart Rewards</h1>
        <p className="text-muted-foreground">First, tell us who you are.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
        <Link href="/register/customer" className="group">
          <Card className="h-full hover:border-primary transition-colors duration-200">
            <CardHeader>
              <User className="h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline">I&apos;m a Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sign up to earn points, join savings groups, and get personalized offers from your favorite local businesses.
              </CardDescription>
              <div className="flex items-center text-primary font-semibold mt-4">
                <span>Sign up as a Customer</span>
                <ArrowRight className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/register/business" className="group">
          <Card className="h-full hover:border-primary transition-colors duration-200">
            <CardHeader>
              <Building className="h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline">I&apos;m a Business</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create a business account to launch your loyalty program, manage customers, and gain AI-powered insights.
              </CardDescription>
               <div className="flex items-center text-primary font-semibold mt-4">
                <span>Sign up as a Business</span>
                <ArrowRight className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
       <div className="mt-8 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign In
            </Link>
        </div>
    </div>
  );
}
