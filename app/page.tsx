'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Activity, Shield, Zap, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Immutable Records',
    description: 'Every task logged permanently on Hedera Consensus Service'
  },
  {
    icon: Zap,
    title: 'Instant Rewards',
    description: 'Automatic token distribution for verified community health work'
  },
  {
    icon: Globe,
    title: 'Transparent',
    description: 'Public audit trail on blockchain with full accountability'
  },
  {
    icon: CheckCircle,
    title: 'Verified Tasks',
    description: 'Multi-level approval system ensures quality and compliance'
  },
];

export default function Home() {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <span className="text-xl font-bold">AfyaUkweli</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <Activity className="w-24 h-24 text-primary relative z-10" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AfyaUkweli
            </h1>

            <p className="text-xl text-muted-foreground mb-2">
              Afya Yenye Ukweli
            </p>

            <p className="text-sm text-muted-foreground mb-8">
              Health Truth - Ukweli wa Kazi za CHW
            </p>

            <p className="text-2xl md:text-3xl text-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering Community Health Workers with blockchain-verified task tracking and instant rewards
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 gap-2">
                  Start Tracking Tasks
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Powered by Hedera Hashgraph
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all duration-500 ${
                  currentFeature === index
                    ? 'bg-primary/10 border-primary/50 scale-105 shadow-lg shadow-primary/20'
                    : 'bg-card/50 border-border/50 hover:border-primary/30'
                }`}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur border border-border/50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  How It Works
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Log Tasks</h4>
                      <p className="text-sm text-muted-foreground">
                        Community Health Workers submit tasks with consent codes and location data
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Blockchain Verified</h4>
                      <p className="text-sm text-muted-foreground">
                        Tasks are logged immutably on Hedera Consensus Service for transparency
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Supervisor Approval</h4>
                      <p className="text-sm text-muted-foreground">
                        Trained supervisors review and verify task authenticity and quality
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instant Rewards</h4>
                      <p className="text-sm text-muted-foreground">
                        Approved tasks trigger automatic token transfers via Hedera Token Service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                <div className="relative bg-card/80 backdrop-blur rounded-xl p-8 border border-primary/30 shadow-2xl">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {(88).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold mb-1">200+</div>
                      <p className="text-xs text-muted-foreground">Tasks Logged</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold mb-1">1200+</div>
                      <p className="text-xs text-muted-foreground">Points Awarded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p className="mb-2">Built for Community Health Programs in Kenya and Beyond</p>
            <p className="flex items-center justify-center gap-2">
              Secured by
              <span className="font-semibold text-foreground">Hedera Hashgraph</span>
              <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs">
                Carbon Negative
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
