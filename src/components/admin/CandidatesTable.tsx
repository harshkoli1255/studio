import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCandidate } from '@/lib/actions';
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

interface CandidatesTableProps {
  candidates: Candidate[];
  totalVotes: number;
  onCandidateDeleted: (id: number) => void;
}


function DeleteCandidateButton({ candidateId, onCandidateDeleted }: { candidateId: number, onCandidateDeleted: (id: number) => void }) {
    const handleDelete = async () => {
        const result = await deleteCandidate(candidateId);
        if(result.success) {
            onCandidateDeleted(candidateId);
        }
    }

    return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button variant="ghost" size="icon">
                <Trash2 className="text-destructive h-4 w-4"/>
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the candidate and all associated votes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    )
}

export default function CandidatesTable({ candidates, totalVotes, onCandidateDeleted }: CandidatesTableProps) {
  const sortedCandidates = [...candidates].sort((a,b) => b.voteCount - a.voteCount);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Votes</TableHead>
          <TableHead>% of Vote</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={percentage} className="w-24 h-2"/>
                  <span className='w-10 text-sm text-muted-foreground'>{percentage.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DeleteCandidateButton candidateId={candidate.id} onCandidateDeleted={onCandidateDeleted} />
              </TableCell>
            </TableRow>
          );
        })}
        {candidates.length === 0 && (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No candidates have been added yet.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
