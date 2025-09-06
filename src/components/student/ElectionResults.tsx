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
    if (maxVotes === 0) return []; // No winner if no votes
    return candidates.filter(c => c.voteCount === maxVotes);
  };
  
  const winners = getWinners();
  const winnerText = winners.length > 1 ? 'It\'s a tie!' : winners.length === 1 ? `Congratulations to ${winners[0].name}!` : 'The election has ended.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <main className="container mx-auto max-w-2xl text-center">
        <div className="flex justify-center mb-6">
            <Logo />
        </div>
        
        <Card className="text-left shadow-2xl">
           <CardHeader className="text-center pb-0">
             <div className="flex justify-center mb-4 text-amber-500">
                <Award className="h-16 w-16" strokeWidth={1.5}/>
             </div>
             <CardTitle className="text-3xl font-bold tracking-tight">{winnerText}</CardTitle>
             <CardDescription className="text-lg">
                {winners.length > 0 ? 'Here are the final results of the election.' : 'No votes were cast in this election.'}
             </CardDescription>
           </CardHeader>
           <CardContent className="px-4 sm:px-6 pt-6">
             {winners.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-secondary/50 p-6 rounded-lg my-6">
                    {winners.map(winner => (
                       <div key={winner.id} className="flex flex-col items-center gap-2">
                         <Image
                           src={winner.imageUrl}
                           alt={winner.name}
                           width={100}
                           height={100}
                           className="rounded-full border-4 border-amber-400 object-cover"
                         />
                         <p className="font-bold text-lg">{winner.name}</p>
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
