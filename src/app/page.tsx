import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Leaf, Banknote } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <svg
              className="h-8 w-auto text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <span className="font-bold text-xl ml-2 font-headline">Smart Rewards ZW</span>
          </div>
          <nav>
            <Link href="/login" passHref>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register" passHref>
              <Button className="ml-2">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline text-primary">
              Smart Rewards ZW
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              One Platform. Every Business. Every Customer.
            </p>
            <p className="mt-6 max-w-3xl mx-auto text-base">
              Join the unified loyalty ecosystem designed for Zimbabwean businesses and customers. Earn points everywhere, enjoy exclusive rewards, and participate in community savings with Mukando integration.
            </p>
            <div className="mt-8">
              <Link href="/register" passHref>
                <Button size="lg">Get Started Now</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Why Smart Rewards?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mukando Integration</CardTitle>
                  <Users className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly join community savings groups (maRound) and earn bonus points on your contributions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eco-Points</CardTitle>
                  <Leaf className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get rewarded for making sustainable choices. Your green actions translate into valuable Eco-Points.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Smart Wallet Payments</CardTitle>
                  <Banknote className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A unified wallet for all your points, bonds, and even skill-swaps. Pay, transfer, and manage your rewards with ease.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Smart Rewards ZW. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
