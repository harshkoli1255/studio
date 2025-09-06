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
  const winnerText = winners.length > 1 ? 'It\'s a tie!' : winners.length === 1 ? `Congratulations to ${winners[0].name}!` : 'The Election Has Ended';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <main className="container mx-auto max-w-2xl text-center">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        
        <Card className="text-left shadow-2xl rounded-2xl overflow-hidden bg-background">
           <CardHeader className="text-center p-8 bg-background">
             <div className="flex justify-center mb-4 text-amber-500">
                <Award className="h-20 w-20" strokeWidth={1.5}/>
             </div>
             <CardTitle className="text-4xl font-bold tracking-tight">{winnerText}</CardTitle>
             <CardDescription className="text-lg mt-2 text-muted-foreground">
                {winners.length > 0 ? 'Here are the final results of the election.' : 'No votes were cast in this election.'}
             </CardDescription>
           </CardHeader>
           <CardContent className="p-8">
             {winners.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-8">
                    {winners.map(winner => (
                       <div key={winner.id} className="flex flex-col items-center gap-3">
                         <Image
                           src={winner.imageUrl}
                           alt={winner.name}
                           width={120}
                           height={120}
                           className="rounded-full border-4 border-amber-400 object-cover shadow-lg"
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
