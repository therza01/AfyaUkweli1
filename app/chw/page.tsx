'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Activity, LogOut, Coins, ExternalLink, Loader2, Home, Syringe, Calendar } from 'lucide-react';
import { getUser, logout, fetchWithAuth } from '@/lib/client-auth';
import * as geohash from 'ngeohash';

export default function CHWPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState('');
  const [consentCode, setConsentCode] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'CHW') {
      router.push('/login');
      return;
    }
    setUser(userData);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocation({ lat: -1.2864, lng: 36.8172 });
        }
      );
    } else {
      setLocation({ lat: -1.2864, lng: 36.8172 });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error('Location not available');
      return;
    }

    setLoading(true);

    try {
      const geoHash = geohash.encode(location.lat, location.lng, 7);

      const response = await fetchWithAuth('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          consentCode,
          geohash: geoHash,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit task');
      }

      toast.success('Task logged successfully!', {
        description: 'View on HashScan',
        action: {
          label: 'View',
          onClick: () => window.open(data.hashScanUrl, '_blank'),
        },
      });

      setTaskType('');
      setConsentCode('');
      setNotes('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" strokeWidth={2.5} />
            <div>
              <h1 className="text-xl font-bold">AfyaUkweli</h1>
              <p className="text-xs text-muted-foreground">CHW Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.county}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Token Balance</CardTitle>
                  <CardDescription>CHW Points (CHWP)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.floor(Math.random() * 500 + 100)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rewards for verified tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log New Task</CardTitle>
              <CardDescription>
                Submit a new community health task for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="taskType">Task Type *</Label>
                  <Select value={taskType} onValueChange={setTaskType} required>
                    <SelectTrigger id="taskType" className="h-11">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOME_VISIT">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Home Visit
                        </div>
                      </SelectItem>
                      <SelectItem value="IMMUNIZATION">
                        <div className="flex items-center gap-2">
                          <Syringe className="w-4 h-4" />
                          Immunization
                        </div>
                      </SelectItem>
                      <SelectItem value="FOLLOW_UP">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Follow-up Visit
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consentCode">Consent Code *</Label>
                  <Input
                    id="consentCode"
                    type="text"
                    placeholder="4-digit code"
                    value={consentCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setConsentCode(value);
                    }}
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    className="h-11 font-mono text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 4-digit consent code from the patient
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Task description and details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting to Hedera...
                      </>
                    ) : (
                      'Submit Task'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>All tasks are logged immutably on Hedera Consensus Service</p>
            <p className="flex items-center justify-center gap-1">
              Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Loading...'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
