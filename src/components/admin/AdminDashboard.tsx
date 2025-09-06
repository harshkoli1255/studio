'use client';

import { useState, useEffect } from 'react';
import { BarChart, Users, Percent, Vote, Plus, RefreshCcw, LogOut } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import CandidatesTable from './CandidatesTable';
import CandidateForm from './CandidateForm';
import { resetVotes, logout } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Summary from './Summary';

interface AdminDashboardProps {
  initialCandidates: Candidate[];
  initialTotalVotes: number;
  initialTotalVoters: number;
}

export default function AdminDashboard({
  initialCandidates,
  initialTotalVotes,
  initialTotalVoters,
}: AdminDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setCandidates(initialCandidates);
    setTotalVotes(initialTotalVotes);
  }, [initialCandidates, initialTotalVotes]);

  const turnout = initialTotalVoters > 0 ? (totalVotes / initialTotalVoters) * 100 : 0;
  
  const leadingCandidate = candidates.length > 0 ? [...candidates].sort((a,b) => b.voteCount - a.voteCount)[0].name : 'N/A';

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all votes? This action cannot be undone.')) {
      await resetVotes();
      setCandidates(candidates.map(c => ({...c, voteCount: 0})));
      setTotalVotes(0);
      toast({ title: 'Success', description: 'All votes have been reset.' });
    }
  };

  const onCandidateAdded = (newCandidate: Candidate) => {
    setCandidates(prev => [...prev, newCandidate].sort((a,b) => a.id - b.id));
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 md:px-6 backdrop-blur-sm">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Logo />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          <form action={logout}>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{initialTotalVoters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{turnout.toFixed(1)}%</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leading Candidate</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 {leadingCandidate}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Summary />

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Live Vote Count</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidatesTable candidates={candidates} />
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Election</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CandidateForm onCandidateAdded={onCandidateAdded} />
                <Button variant="destructive" onClick={handleReset} className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Reset All Votes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
