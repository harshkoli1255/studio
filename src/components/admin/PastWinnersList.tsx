'use client';

import type { PastWinner } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
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
import { clearHistory } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface PastWinnersListProps {
    pastWinners: PastWinner[];
    onHistoryCleared: () => void;
}

export default function PastWinnersList({ pastWinners, onHistoryCleared }: PastWinnersListProps) {
    const { toast } = useToast();

    const handleClearHistory = async () => {
        const result = await clearHistory();
        if (result.success) {
            toast({ title: 'Success', description: 'Election history has been cleared.' });
            onHistoryCleared();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Election History</CardTitle>
                    <CardDescription>A record of past election winners and their results.</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={pastWinners.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear History
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all past election history records. This will not affect the current election.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete History
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Election Date</TableHead>
                                <TableHead>Winner(s)</TableHead>
                                <TableHead className="text-right">Total Votes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pastWinners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        No past election data is available.
                                    </TableCell>
                                </TableRow>
                            )}
                            {pastWinners.map((election, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {new Date(election.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                         {election.winners.map(winner => (
                                             <Badge key={winner.id} variant="secondary" className="font-normal">{winner.name} ({winner.voteCount} votes)</Badge>
                                         ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{election.totalVotes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
