import { cookies } from 'next/headers';
import { db } from '@/lib/data';
import VotingPageClient from '@/components/student/VotingPageClient';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/actions';
import { LogOut } from 'lucide-react';

export default async function VotePage() {
  const studentId = cookies().get('student-auth')?.value;
  const user = studentId ? db.getUserById(studentId) : null;
  const candidates = db.getCandidates();
  const totalVotes = db.getTotalVotes();
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Error: User not found. Please log in again.
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
