'use client';

import { useState, useEffect } from 'react';
import { LogOut, UserCheck, Home, Settings, Package2, PanelLeft, Search, Users, Trophy, BarChart3, ListChecks, History } from 'lucide-react';
import type { Candidate, User, PastWinner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CandidatesTable from './CandidatesTable';
import CandidateForm from './CandidateForm';
import { resetVotes, logout } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Summary from './Summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoterManagement from './VoterManagement';
import ElectionTimer from './ElectionTimer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import PastWinnersList from './PastWinnersList';


interface AdminDashboardProps {
  initialCandidates: Candidate[];
  initialTotalVotes: number;
  initialVoters: User[];
  initialPastWinners: PastWinner[];
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
  initialElectionStatus,
  initialPastWinners
}: AdminDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [voters, setVoters] = useState<User[]>(initialVoters);
  const [pastWinners, setPastWinners] = useState<PastWinner[]>(initialPastWinners);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setCandidates(initialCandidates);
    setTotalVotes(initialTotalVotes);
    setVoters(initialVoters);
    setPastWinners(initialPastWinners);
  }, [initialCandidates, initialTotalVotes, initialVoters, initialPastWinners]);
  
  const votedCount = voters.filter(v => v.hasVoted).length;
  const turnout = voters.length > 0 ? (votedCount / voters.length) * 100 : 0;
  
  const leadingCandidate = candidates.length > 0 ? [...candidates].sort((a,b) => b.voteCount - a.voteCount)[0]?.name || 'N/A' : 'N/A';

  const handleReset = async () => {
      const result = await resetVotes();
      if (result.success) {
        window.location.reload();
        toast({ title: 'Success', description: 'The election has been fully reset.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
  };

  const onCandidateAdded = (updatedCandidates: Candidate[]) => {
    setCandidates(updatedCandidates);
  };

  const onCandidateDeleted = (deletedCandidateId: number) => {
    const deletedCandidate = candidates.find(c => c.id === deletedCandidateId);
    if(deletedCandidate) {
      setTotalVotes(prev => prev - deletedCandidate.voteCount);
    }
    setCandidates(prev => prev.filter(c => c.id !== deletedCandidateId));
  }
  
  const onVoterAdded = (updatedVoters: User[]) => {
    setVoters(updatedVoters);
  }

  const onVoterDeleted = (deletedVoterId: string) => {
    const deletedVoter = voters.find(v => v.id === deletedVoterId);
    if (deletedVoter?.hasVoted) {
      // This is a simplification; in a real app, you'd need to invalidate the vote too.
      setTotalVotes(prev => prev -1);
    }
    setVoters(prev => prev.filter(v => v.id !== deletedVoterId));
  }

  const onHistoryCleared = () => {
    setPastWinners([]);
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsSheetOpen(false);
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">CR Vote Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <button onClick={() => handleTabChange('overview')} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeTab === 'overview' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                <Home className="h-4 w-4" />
                Overview
              </button>
              <button onClick={() => handleTabChange('candidates')} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeTab === 'candidates' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                <Users className="h-4 w-4" />
                Candidates
              </button>
              <button onClick={() => handleTabChange('voters')} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeTab === 'voters' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                <UserCheck className="h-4 w-4" />
                Voters
              </button>
              <button onClick={() => handleTabChange('history')} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeTab === 'history' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                <History className="h-4 w-4" />
                History
              </button>
              <Link href="/results" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" target="_blank">
                <Trophy className="h-4 w-4" />
                Live Results
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
             <button onClick={() => handleTabChange('settings')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeTab === 'settings' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                <Settings className="h-4 w-4" />
                Settings
              </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-base font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                  onClick={(e) => { e.preventDefault(); handleTabChange('overview'); }}
                >
                  <Package2 className="h-6 w-6" />
                  <span >CR Vote Admin</span>
                </Link>
                <button onClick={() => handleTabChange('overview')} className={`flex items-center gap-4 rounded-xl px-3 py-2 ${activeTab === 'overview' ? 'bg-muted text-primary' : 'text-muted-foreground'} hover:text-foreground`}>
                  <Home className="h-5 w-5" />
                  Overview
                </button>
                <button onClick={() => handleTabChange('candidates')} className={`flex items-center gap-4 rounded-xl px-3 py-2 ${activeTab === 'candidates' ? 'bg-muted text-primary' : 'text-muted-foreground'} hover:text-foreground`}>
                   <Users className="h-5 w-5" />
                   Candidates
                </button>
                <button onClick={() => handleTabChange('voters')} className={`flex items-center gap-4 rounded-xl px-3 py-2 ${activeTab === 'voters' ? 'bg-muted text-primary' : 'text-muted-foreground'} hover:text-foreground`}>
                  <UserCheck className="h-5 w-5" />
                  Voters
                </button>
                 <button onClick={() => handleTabChange('history')} className={`flex items-center gap-4 rounded-xl px-3 py-2 ${activeTab === 'history' ? 'bg-muted text-primary' : 'text-muted-foreground'} hover:text-foreground`}>
                  <History className="h-5 w-5" />
                  History
                </button>
                 <Link href="/results" className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground" target="_blank">
                  <Trophy className="h-5 w-5" />
                  Live Results
                </Link>
              </nav>
              <div className="mt-auto">
                 <button onClick={() => handleTabChange('settings')} className={`flex items-center gap-4 rounded-xl px-3 py-2 ${activeTab === 'settings' ? 'bg-muted text-primary' : 'text-muted-foreground'} hover:text-foreground`}>
                    <Settings className="h-5 w-5" />
                    Settings
                  </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserCheck className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>Settings</DropdownMenuItem>
               <DropdownMenuItem asChild>
                  <Link href="/">Student View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <form action={logout}>
                    <button type="submit" className="flex items-center w-full text-left">
                      <LogOut className="mr-2 h-4 w-4"/>
                      <span>Logout</span>
                    </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl capitalize">{activeTab}</h1>
          </div>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsContent value="overview">
                 <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 mt-4">
                     <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                              <ListChecks className="text-muted-foreground h-4 w-4"/>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{totalVotes}</div>
                              <p className="text-xs text-muted-foreground">Leading: {leadingCandidate}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
                               <Users className="text-muted-foreground h-4 w-4"/>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{voters.length}</div>
                              <p className="text-xs text-muted-foreground">Registered students</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium">Voted</CardTitle>
                               <UserCheck className="text-muted-foreground h-4 w-4"/>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{votedCount}</div>
                              <p className="text-xs text-muted-foreground">Have cast their ballot</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium">Turnout</CardTitle>
                               <BarChart3 className="text-muted-foreground h-4 w-4"/>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{turnout.toFixed(1)}%</div>
                              <p className="text-xs text-muted-foreground">Voter participation</p>
                            </CardContent>
                        </Card>
                     </div>
                     <Summary />
                  </div>
              </TabsContent>
               <TabsContent value="candidates">
                  <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
                    <div className="space-y-4">
                      <Card className="h-fit">
                        <CardHeader>
                          <CardTitle>Add New Candidate</CardTitle>
                           <CardDescription>Add a new candidate to the ballot.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <CandidateForm onCandidateAdded={onCandidateAdded} />
                        </CardContent>
                      </Card>
                    </div>
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle>Live Vote Count</CardTitle>
                         <CardDescription>Current standings of all candidates.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CandidatesTable 
                          candidates={candidates} 
                          totalVotes={totalVotes}
                          onCandidateDeleted={onCandidateDeleted}
                        />
                      </CardContent>
                    </Card>
                  </div>
              </TabsContent>
               <TabsContent value="voters">
                  <VoterManagement 
                      voters={voters}
                      onVoterAdded={onVoterAdded}
                      onVoterDeleted={onVoterDeleted}
                  />
              </TabsContent>
               <TabsContent value="history">
                  <PastWinnersList pastWinners={pastWinners} onHistoryCleared={onHistoryCleared} />
              </TabsContent>
              <TabsContent value="settings">
                  <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
                    <ElectionTimer initialStatus={initialElectionStatus}/>
                    <Card>
                      <CardHeader>
                          <CardTitle>Reset Election</CardTitle>
                          <CardDescription>Delete all votes and reset the election schedule.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">This will permanently delete all votes and reset the election schedule. Candidates and voters will not be deleted.</p>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full">
                                  Reset All Votes
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete all vote records and reset the election schedule. Candidates and voters will NOT be deleted.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </CardContent>
                      </Card>
                  </div>
              </TabsContent>
            </Tabs>
        </main>
      </div>
    </div>
  );
}
