import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Leaf, Banknote, Sparkles } from 'lucide-react';
import TextType from '@/components/ui/text-type';
import DecryptedText from '@/components/ui/decrypted-text';
import Aurora from '@/components/ui/aurora';
import RotatingText from '@/components/ui/rotating-text';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Aurora
          colorStops={["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--primary))"]}
          blend={0.3}
          amplitude={0.8}
          speed={0.3}
        />
      </div>
      
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 pointer-events-none z-1" />
      
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Sparkles className="h-8 w-auto text-primary animate-pulse" />
            <span className="font-bold text-xl ml-2 font-headline">Smart Rewards ZW</span>
          </div>
          <nav>
            <Link href="/login" passHref>
              <Button variant="ghost" className="hover:bg-primary/10 backdrop-blur-sm">Sign In</Button>
            </Link>
            <Link href="/register" passHref>
              <Button className="ml-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow relative z-20">
        <section className="text-center py-20 lg:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline text-primary min-h-[1.2em]">
              <TextType 
                text={["One Platform.", "Every Business.", "Every Customer.", "One Platform. Every Business. Every Customer."]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-primary"
                loop={true}
                startOnVisible={true}
                textColors={["hsl(var(--primary))", "hsl(var(--primary))", "hsl(var(--primary))", "hsl(var(--primary))"]}
              />
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-foreground font-semibold animate-fade-in-up leading-relaxed">
              <DecryptedText
                text="Join the unified loyalty ecosystem designed for Zimbabwean businesses and customers. Earn points everywhere, enjoy exclusive rewards, and participate in community savings with Mukando integration."
                animateOn="view"
                speed={30}
                maxIterations={15}
                sequential={true}
                revealDirection="start"
                encryptedClassName="text-foreground/50"
                className="text-foreground font-semibold"
              />
            </p>
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link href="/register" passHref>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  Join the Movement
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-background/30 backdrop-blur-md border-t border-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Why Smart Rewards?</h2>
                    <p className="text-muted-foreground mb-8">We are building more than a loyalty program; we are creating a connected economic ecosystem for Zimbabwe. Our platform empowers both businesses and customers with cutting-edge tools and shared value.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Card className="bg-background/70 backdrop-blur-md border border-primary/20 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Users className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                          <CardTitle className="text-base font-semibold">Mukando Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Join community savings groups (maRound) and earn bonus points.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/70 backdrop-blur-md border border-primary/20 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <Leaf className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                          <CardTitle className="text-base font-semibold">Eco-Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Get rewarded for making sustainable, eco-friendly choices.
                          </p>
                        </CardContent>
                      </Card>
                       <Card className="bg-background/70 backdrop-blur-md border border-primary/20 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Banknote className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                          <CardTitle className="text-base font-semibold">Smart Wallet</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            A unified wallet for points, bonds, and even skill-swaps.
                          </p>
                        </CardContent>
                      </Card>
                       <Card className="bg-background/70 backdrop-blur-md border border-primary/20 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Sparkles className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300 animate-pulse" />
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
                <div className="aspect-square relative rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md border border-primary/30 p-8 flex items-center justify-center">
                    <Image src="/smart-rewards-zw.png?v=2" alt="Smart Rewards ZW Logo" width={400} height={400} className="object-contain drop-shadow-lg filter brightness-110" />
                </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background/20 backdrop-blur-sm border-t border-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
              <RotatingText
                texts={[
                  "Loyalty Reimagined: Rewarding Trust with AI and Location Intelligence",
                  "Smart Rewards: Where Technology Meets Community",
                  "AI-Powered Loyalty for the Digital Age",
                  "Building Trust Through Intelligent Rewards"
                ]}
                rotationInterval={3000}
                className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              />
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of loyalty programs where artificial intelligence meets location-based insights to create personalized, meaningful rewards for every interaction.
            </p>
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
