import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { Candidate } from '@/lib/types';
import Image from 'next/image';

interface CandidatesTableProps {
  candidates: Candidate[];
}

export default function CandidatesTable({ candidates }: CandidatesTableProps) {
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const sortedCandidates = [...candidates].sort((a,b) => b.voteCount - a.voteCount);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Votes</TableHead>
          <TableHead className="w-[150px] text-right">% of Vote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCandidates.map(candidate => {
          const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
          return (
            <TableRow key={candidate.id}>
              <TableCell>
                <Image
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  width={40}
                  height={40}
                  data-ai-hint={candidate.dataAiHint}
                  className="rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.voteCount}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className='w-10 text-sm text-muted-foreground'>{percentage.toFixed(1)}%</span>
                  <Progress value={percentage} className="w-24 h-2"/>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {candidates.length === 0 && (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No candidates have been added yet.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
