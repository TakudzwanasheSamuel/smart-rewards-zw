import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Leaf, Banknote, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Sparkles className="h-8 w-auto text-primary" />
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
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline text-primary">
              One Platform. Every Business. Every Customer.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Join the unified loyalty ecosystem designed for Zimbabwean businesses and customers. Earn points everywhere, enjoy exclusive rewards, and participate in community savings with Mukando integration.
            </p>
            <div className="mt-8">
              <Link href="/register" passHref>
                <Button size="lg">Join the Movement</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold font-headline mb-4">Why Smart Rewards?</h2>
                    <p className="text-muted-foreground mb-8">We are building more than a loyalty program; we are creating a connected economic ecosystem for Zimbabwe. Our platform empowers both businesses and customers with cutting-edge tools and shared value.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Users className="h-8 w-8 text-secondary" />
                          <CardTitle className="text-base font-semibold">Mukando Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Join community savings groups (maRound) and earn bonus points.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <Leaf className="h-8 w-8 text-secondary" />
                          <CardTitle className="text-base font-semibold">Eco-Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Get rewarded for making sustainable, eco-friendly choices.
                          </p>
                        </CardContent>
                      </Card>
                       <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Banknote className="h-8 w-8 text-secondary" />
                          <CardTitle className="text-base font-semibold">Smart Wallet</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            A unified wallet for points, bonds, and even skill-swaps.
                          </p>
                        </CardContent>
                      </Card>
                       <Card className="bg-background/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Sparkles className="h-8 w-8 text-secondary" />
                          <CardTitle className="text-base font-semibold">AI Personalization</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Receive offers and insights tailored specifically to you.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                </div>
                <div className="aspect-square relative rounded-lg overflow-hidden shadow-2xl">
                    <Image src="https://placehold.co/600x600.png" alt="People in Zimbabwe using mobile phones" layout="fill" objectFit="cover" data-ai-hint="zimbabwean people community" />
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Smart Rewards ZW. All rights reserved. Built for Zimbabwe, by Zimbabweans.
        </div>
      </footer>
    </div>
  );
}
