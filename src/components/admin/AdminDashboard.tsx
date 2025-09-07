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
  const [activeTab, setActiveTab] = useState('overview');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setCandidates(initialCandidates);
    setTotalVotes(initialTotalVotes);
    setVoters(initialVoters);
  }, [initialCandidates, initialTotalVotes, initialVoters]);
  
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsSheetOpen(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
             onClick={(e) => { e.preventDefault(); handleTabChange('overview'); }}
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">CR Vote</span>
          </Link>
          <button onClick={() => handleTabChange('overview')} className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeTab === 'overview' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}>
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
          </button>
           <button onClick={() => handleTabChange('voters')} className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeTab === 'voters' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}>
              <Users className="h-5 w-5" />
              <span className="sr-only">Voters</span>
          </button>
            <Link href="/results" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8" target="_blank">
              <Trophy className="h-5 w-5" />
              <span className="sr-only">Results</span>
          </Link>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
           <button onClick={() => handleTabChange('settings')} className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeTab === 'settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors hover:text-foreground md:h-8 md:w-8`}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
          </button>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <button
                  onClick={() => handleTabChange('overview')}
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">CR Vote</span>
                </button>
                <button
                  onClick={() => handleTabChange('overview')}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleTabChange('candidates')}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <Users className="h-5 w-5" />
                   Candidates
                </button>
                <button
                  onClick={() => handleTabChange('voters')}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <UserCheck className="h-5 w-5" />
                  Voters
                </button>
                 <button
                  onClick={() => handleTabChange('history')}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <History className="h-5 w-5" />
                  History
                </button>
                 <Link
                  href="/results"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                   target="_blank"
                >
                  <Trophy className="h-5 w-5" />
                  Results
                </Link>
                 <button
                  onClick={() => handleTabChange('settings')}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => setActiveTab('overview')}>Dashboard</button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
               <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{activeTab}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                 <UserCheck className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                  <Link href="/">Student View</Link>
              </DropdownMenuItem>
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="sm:block hidden">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="overview">
                    <Home className="mr-2 h-4 w-4"/>
                    <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="candidates">
                    <Users className="mr-2 h-4 w-4"/>
                    <span>Candidates</span>
                </TabsTrigger>
                <TabsTrigger value="voters">
                    <UserCheck className="mr-2 h-4 w-4"/>
                    <span>Voters</span>
                </TabsTrigger>
                <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4"/>
                    <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4"/>
                    <span>Settings</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
             <div className={activeTab === 'overview' ? 'block' : 'hidden sm:block'}>
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
                            </Header>
                            <CardContent>
                              <div className="text-2xl font-bold">{votedCount}</div>
                              <p className="text-xs text-muted-foreground">Have cast their ballot</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                              <CardTitle className="text-sm font-medium">Turnout</CardTitle>
                               <BarChart3 className="text-muted-foreground h-4 w-4"/>
                            </Header>
                            <CardContent>
                              <div className="text-2xl font-bold">{turnout.toFixed(1)}%</div>
                              <p className="text-xs text-muted-foreground">Voter participation</p>
                            </CardContent>
                        </Card>
                     </div>
                     <Summary />
                  </div>
              </div>
               <div className={activeTab === 'candidates' ? 'block' : 'hidden sm:block'}>
                  <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
                  <Card className="h-fit">
                      <CardHeader>
                      <CardTitle>Live Vote Count</CardTitle>
                      </CardHeader>
                      <CardContent>
                      <CandidatesTable 
                          candidates={candidates} 
                          totalVotes={totalVotes}
                          onCandidateDeleted={onCandidateDeleted}
                      />
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
              </div>
               <div className={activeTab === 'voters' ? 'block' : 'hidden sm:block'}>
                  <VoterManagement 
                      voters={voters}
                      onVoterAdded={onVoterAdded}
                      onVoterDeleted={onVoterDeleted}
                  />
              </div>
               <div className={activeTab === 'history' ? 'block' : 'hidden sm:block'}>
                  <PastWinnersList pastWinners={initialPastWinners} />
              </div>
              <div className={activeTab === 'settings' ? 'block' : 'hidden sm:block'}>
                  <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
                  <ElectionTimer initialStatus={initialElectionStatus}/>
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle>Reset Election</CardTitle>
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
                                  <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </CardContent>
                      </Card>
                  </div>
              </div>
        </main>
      </div>
    </div>
  );
}

    