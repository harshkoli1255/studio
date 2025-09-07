'use client';

import { useRef, useState, useTransition } from 'react';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addVoter, deleteVoter } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Copy } from 'lucide-react';
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

function DeleteVoterButton({ voterId, onVoterDeleted }: { voterId: string, onVoterDeleted: (id: string) => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteVoter(voterId);
            if(result.success) {
                onVoterDeleted(voterId);
                toast({ title: "Success", description: "Voter has been deleted."})
            } else {
                 toast({ title: "Error", description: result.message, variant: 'destructive'})
            }
        });
    }

    return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button variant="ghost" size="icon" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="text-destructive h-4 w-4"/>}
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
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    )
}


export default function VoterManagement({ voters, onVoterAdded, onVoterDeleted }: VoterManagementProps) {
  const [isAdding, startAdding] = useTransition();
  const singleVoterFormRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleAddVoter = async (formData: FormData) => {
    startAdding(async () => {
        const result = await addVoter(formData);
        if(result.success && result.voters) {
            toast({ title: 'Success', description: result.message });
            singleVoterFormRef.current?.reset();
            onVoterAdded(result.voters);
        } else if (result.message) {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    });
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard!" });
  }
  
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-3 mt-4">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add Voter</CardTitle>
            <CardDescription>
              A unique 8-character voting code will be automatically generated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={singleVoterFormRef} action={handleAddVoter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voterName">Voter Name</Label>
                <Input id="voterName" name="voterName" placeholder="e.g., John Doe" required disabled={isAdding}/>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full sm:w-auto">
                 {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                 {isAdding ? 'Adding...' : 'Add Voter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Voter List</CardTitle>
            <CardDescription>
              List of all registered voters and their unique codes.
            </CardDescription>
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
                          <div className="flex items-center gap-2">
                            <pre className="text-sm font-mono bg-muted px-2 py-1 rounded-md inline-block">{voter.code}</pre>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(voter.code)}>
                                <Copy className="h-3.5 w-3.5"/>
                            </Button>
                          </div>
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
