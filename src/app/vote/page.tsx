import { cookies } from 'next/headers';
import { db } from '@/lib/data';
import VotingPageClient from '@/components/student/VotingPageClient';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/actions';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import ElectionResults from '@/components/student/ElectionResults';

export const dynamic = 'force-dynamic';

export default async function VotePage() {
  const cookieStore = cookies();
  const studentId = cookieStore.get('student-auth')?.value;
  const user = studentId ? db.getUserById(studentId) : null;
  const candidates = db.getCandidates();
  const totalVotes = db.getTotalVotes();
  const electionStatus = db.getElectionStatus();
  
  if (!user) {
    // This case should ideally be handled by middleware, but as a fallback:
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p>Authentication error. Please log in again.</p>
         <Link href="/">
            <Button variant="outline">Go to Login</Button>
         </Link>
      </div>
    );
  }

  if (electionStatus.status === 'ended' || (user.hasVoted && electionStatus.status !== 'active')) {
    return <ElectionResults candidates={candidates} totalVotes={totalVotes} />;
  }

  if (electionStatus.status !== 'active' && !user.hasVoted) {
     return (
       <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-4 text-center">
         <Logo/>
         <h1 className="text-2xl font-bold mt-4">The election is not currently active.</h1>
         <p className="text-muted-foreground">
            {electionStatus.status === 'upcoming' && `It is scheduled to start on ${electionStatus.start?.toLocaleString()}.`}
            {electionStatus.status === 'not_set' && 'The election dates have not been set by the administrator yet.'}
         </p>
         <p className="text-sm text-muted-foreground">Please check back later.</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name}
            </span>
             <form action={logout}>
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <VotingPageClient 
          user={user} 
          initialCandidates={candidates} 
          initialTotalVotes={totalVotes}
        />
      </main>
    </div>
  );
}
