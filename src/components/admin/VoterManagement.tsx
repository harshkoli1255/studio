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
import { ScrollArea } from '../ui/scroll-area';
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

interface VoterManagementProps {
  voters: User[];
  onVoterAdded: (voters: User[]) => void;
  onVoterDeleted: (voterId: string) => void;
}

function AddVoterSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      <Plus className="mr-2" />
      {pending ? 'Adding Voter...' : 'Add Voter'}
    </Button>
  );
}

function DeleteVoterButton({ voterId, onVoterDeleted }: { voterId: string, onVoterDeleted: (id: string) => void }) {
    const handleDelete = async () => {
        const result = await deleteVoter(voterId);
        if(result.success) {
            onVoterDeleted(voterId);
            toast({ title: "Success", description: "Voter has been deleted."})
        } else {
             toast({ title: "Error", description: result.message, variant: 'destructive'})
        }
    }
    const { toast } = useToast();

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
                This action cannot be undone. This will permanently delete the voter and their associated vote.
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


export default function VoterManagement({ voters, onVoterAdded, onVoterDeleted }: VoterManagementProps) {
  const [state, formAction] = useActionState(addVoter, { success: false, message: '', voters: null, actionId: '' });
  const [lastActionId, setLastActionId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.actionId && state.actionId !== lastActionId) {
      if (state.success && state.voters) {
        toast({ title: 'Success', description: state.message });
        formRef.current?.reset();
        onVoterAdded(state.voters);
      } else if (state.message) {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
      }
      setLastActionId(state.actionId);
    }
  }, [state, toast, onVoterAdded, lastActionId]);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-5 mt-4">
      <div className="lg:col-span-2">
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
      </div>
      <div className="lg:col-span-3">
      <Card>
        <CardHeader>
          <CardTitle>Voter List</CardTitle>
          <CardDescription>
            List of all registered voters and their unique codes.
          </Description>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
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
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                            No voters have been added yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
