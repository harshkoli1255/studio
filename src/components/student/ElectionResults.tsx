import type { Candidate } from '@/lib/types';
import { Award } from 'lucide-react';
import Logo from '../Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import ResultsChart from './ResultsChart';
import Image from 'next/image';

interface ElectionResultsProps {
  candidates: Candidate[];
  totalVotes: number;
}

export default function ElectionResults({ candidates, totalVotes }: ElectionResultsProps) {
  const getWinners = () => {
    if (candidates.length === 0) return [];
    const maxVotes = Math.max(...candidates.map(c => c.voteCount));
    // If maxVotes is 0, there is no winner yet.
    if (maxVotes === 0 && totalVotes === 0) return [];
    return candidates.filter(c => c.voteCount === maxVotes);
  };
  
  const winners = getWinners();
  
  const getWinnerText = () => {
    if (totalVotes === 0) {
        return "The Election Has Ended";
    }
    if (winners.length > 1) {
        return "It's a Tie!";
    }
    if (winners.length === 1) {
        return `Congratulations, ${winners[0].name}!`;
    }
    return "The Election Has Ended"; // Fallback
  }

  const winnerText = getWinnerText();

  const getDescriptionText = () => {
    if (totalVotes === 0) {
        return "No votes were cast in this election.";
    }
     if (winners.length > 1) {
        return `A tie has occurred between ${winners.map(w => w.name).join(' and ')}.`;
    }
    if (winners.length === 1) {
       return `${winners[0].name} has won the election.`;
    }
    return "Here are the final results of the election.";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <main className="container mx-auto max-w-2xl text-center">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        
        <Card className="text-left shadow-2xl rounded-2xl overflow-hidden bg-background">
           <CardHeader className="text-center p-8 bg-card">
             <div className="flex justify-center mb-4 text-amber-500">
                <Award className="h-20 w-20" strokeWidth={1.5}/>
             </div>
             <CardTitle className="text-4xl font-bold tracking-tight">{winnerText}</CardTitle>
             <CardDescription className="text-lg mt-2 text-muted-foreground">
                {getDescriptionText()}
             </CardDescription>
           </CardHeader>
           <CardContent className="p-6 md:p-8">
             {winners.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-8">
                    {winners.map(winner => (
                       <div key={winner.id} className="flex flex-col items-center gap-3">
                         <Image
                           src={winner.imageUrl}
                           alt={winner.name}
                           width={120}
                           height={120}
                           data-ai-hint={winner.dataAiHint}
                           className="rounded-full border-4 border-primary/50 object-cover shadow-lg aspect-square"
                         />
                         <p className="font-bold text-xl">{winner.name}</p>
                       </div>
                    ))}
                </div>
             )}
            <ResultsChart candidates={candidates} totalVotes={totalVotes} />
           </CardContent>
        </Card>

      </main>
    </div>
  );
}
