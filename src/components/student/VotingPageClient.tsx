'use client';

import type { User, Candidate } from '@/lib/types';
import { useState } from 'react';
import { castVote } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CandidateCard from './CandidateCard';
import ResultsChart from './ResultsChart';

interface VotingPageClientProps {
  user: User;
  initialCandidates: Candidate[];
  initialTotalVotes: number;
}

export default function VotingPageClient({
  user,
  initialCandidates,
  initialTotalVotes,
}: VotingPageClientProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(user.hasVoted);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const { toast } = useToast();

  const handleVote = async () => {
    if (selectedCandidate === null) {
      toast({
        title: 'No candidate selected',
        description: 'Please select a candidate before casting your vote.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await castVote(selectedCandidate);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Vote Cast!',
        description: result.message,
      });
      setHasVoted(true);
      // Optimistically update vote counts
      const newCandidates = candidates.map(c =>
        c.id === selectedCandidate ? { ...c, voteCount: c.voteCount + 1 } : c
      );
      setCandidates(newCandidates);
      setTotalVotes(prev => prev + 1);
    } else {
      toast({
        title: 'Vote Failed',
        description: result.message,
        variant: 'destructive',
      });
       if(result.message?.includes("already")){
        setHasVoted(true);
      }
    }
  };

  if (hasVoted) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-center">Thank You for Voting!</h1>
        <p className="text-muted-foreground text-center mt-2 mb-8">
          Your vote has been recorded. Here are the current results.
        </p>
        <Card>
          <CardContent className="pt-6">
            <ResultsChart candidates={candidates} totalVotes={totalVotes} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-center">Cast Your Vote</h1>
      <p className="text-muted-foreground text-center mt-2 mb-8">
        Select your preferred candidate for Class Representative.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidate === candidate.id}
            onSelect={() => setSelectedCandidate(candidate.id)}
          />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Button
          size="lg"
          onClick={handleVote}
          disabled={selectedCandidate === null || isSubmitting}
          className="w-full max-w-xs"
        >
          {isSubmitting ? 'Casting Vote...' : 'Cast My Vote'}
        </Button>
      </div>
    </div>
  );
}