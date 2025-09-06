'use client';

import { useState, useEffect } from 'react';
import { BarChart, Users, Percent, Vote, RefreshCcw, LogOut } from 'lucide-react';
import type { Candidate, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import CandidatesTable from './CandidatesTable';
import CandidateForm from './CandidateForm';
import { resetVotes, logout, addCandidate, addVoter, deleteVoter } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Summary from './Summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoterManagement from './VoterManagement';
import ElectionTimer from './ElectionTimer';

interface AdminDashboardProps {
  initialCandidates: Candidate[];
  initialTotalVotes: number;
  initialVoters: User[];
  initialElectionStatus: {
    status: 'upcoming' | 'active' | 'ended' | 'not_set';
    start: Date | null;
    end: Date | null;
  }
}

export default function AdminDashboard({
  initialCandidates,
  initialTotalVotes,
  initialVoters,
  initialElectionStatus
}: AdminDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [voters, setVoters] = useState<User[]>(initialVoters);
  const { toast } = useToast();
  
  useEffect(() => {
    setCandidates(initialCandidates);
    setTotalVotes(initialTotalVotes);
    setVoters(initialVoters);
  }, [initialCandidates, initialTotalVotes, initialVoters]);

  const turnout = voters.length > 0 ? (totalVotes / voters.length) * 100 : 0;
  
  const leadingCandidate = candidates.length > 0 ? [...candidates].sort((a,b) => b.voteCount - a.voteCount)[0]?.name || 'N/A' : 'N/A';

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all votes and election dates? This action cannot be undone.')) {
      await resetVotes();
      // Refetch or reset state after action
      window.location.reload();
      toast({ title: 'Success', description: 'The election has been fully reset.' });
    }
  };

  const onCandidateAdded = (updatedCandidates: Candidate[]) => {
    setCandidates(updatedCandidates);
  };
  
  const onVoterAdded = (updatedVoters: User[]) => {
    setVoters(updatedVoters);
  }

  const onVoterDeleted = (deletedVoterId: string) => {
    setVoters(prev => prev.filter(v => v.id !== deletedVoterId));
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
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
              <div className="text-2xl font-bold">{voters.length}</div>
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

        <Tabs defaultValue="results">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Results & Candidates</TabsTrigger>
            <TabsTrigger value="voters">Voter Management</TabsTrigger>
            <TabsTrigger value="settings">Election Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="results">
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
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
                    <CardTitle>Add New Candidate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CandidateForm onCandidateAdded={onCandidateAdded} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="voters">
             <VoterManagement 
                voters={voters}
                onVoterAdded={onVoterAdded}
                onVoterDeleted={onVoterDeleted}
              />
          </TabsContent>
          <TabsContent value="settings">
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
              <ElectionTimer initialStatus={initialElectionStatus}/>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Reset Election</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <p className="text-sm text-muted-foreground">This will permanently delete all votes and reset the election schedule. Candidates and voters will not be deleted.</p>
                    <Button variant="destructive" onClick={handleReset} className="w-full">
                      <RefreshCcw className="mr-2 h-4 w-4" /> Reset All Votes
                    </Button>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
