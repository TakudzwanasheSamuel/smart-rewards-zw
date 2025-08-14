import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BusinessRegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Create your Business Account</CardTitle>
          <CardDescription>
            Enter your business details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="business-name">Business name</Label>
                <Input id="business-name" placeholder="Acme Inc." required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="business-category">Business Category</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="food">Fast Food & Restaurant</SelectItem>
                        <SelectItem value="services">Services (Salon, etc.)</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@acme.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Link href="/admin/dashboard" passHref>
                <Button type="submit" className="w-full">
                Create Business Account
                </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
