'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addVoter, deleteVoter } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface VoterManagementProps {
  voters: User[];
  onVoterAdded: (voter: User) => void;
  onVoterDeleted: (voterId: string) => void;
}

function AddVoterSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Plus className="mr-2" />
      {pending ? 'Adding Voter...' : 'Add Voter'}
    </Button>
  );
}

function DeleteVoterButton({ voterId, onVoterDeleted }: { voterId: string, onVoterDeleted: (id: string) => void }) {
    const { pending } = useFormStatus();
    
    const handleClick = async () => {
        if (confirm('Are you sure you want to delete this voter?')) {
           const result = await deleteVoter(voterId);
           if(result.success) {
                onVoterDeleted(voterId);
           }
        }
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleClick} disabled={pending}>
            <Trash2 className="text-destructive"/>
        </Button>
    )
}


export default function VoterManagement({ voters, onVoterAdded, onVoterDeleted }: VoterManagementProps) {
  const [state, formAction] = useActionState(addVoter, { success: false, message: '', voter: null });
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success && state.voter) {
      toast({ title: 'Success', description: state.message });
      formRef.current?.reset();
      onVoterAdded(state.voter);
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onVoterAdded]);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Voter</CardTitle>
          <CardDescription>
            A unique 8-character voting code will be automatically generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voterName">Voter Name</Label>
              <Input id="voterName" name="voterName" placeholder="e.g., John Doe" required />
            </div>
            <AddVoterSubmitButton />
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Voter List</CardTitle>
          <CardDescription>
            List of all registered voters and their unique codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Voting Code</TableHead>
                  <TableHead>Voted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map(voter => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium">{voter.name}</TableCell>
                    <TableCell>
                        <pre className="text-sm font-mono bg-muted px-2 py-1 rounded-md inline-block">{voter.code}</pre>
                    </TableCell>
                    <TableCell>{voter.hasVoted ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                       <DeleteVoterButton voterId={voter.id} onVoterDeleted={onVoterDeleted} />
                    </TableCell>
                  </TableRow>
                ))}
                 {voters.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No voters have been added yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
