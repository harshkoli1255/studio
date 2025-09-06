'use client';

import type { Candidate } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface ResultsChartProps {
  candidates: Candidate[];
  totalVotes: number;
}

export default function ResultsChart({ candidates, totalVotes }: ResultsChartProps) {
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center">Live Election Results</h3>
      {sortedCandidates.map(candidate => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
        return (
          <div key={candidate.id} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <p className="font-medium">{candidate.name}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{candidate.voteCount}</span> votes
                ({percentage.toFixed(1)}%)
              </p>
            </div>
            <Progress value={percentage} />
          </div>
        );
      })}
       <div className="text-center text-sm text-muted-foreground pt-4">
        Total votes cast: {totalVotes}
      </div>
    </div>
  );
}
