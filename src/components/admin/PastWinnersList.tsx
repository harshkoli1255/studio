'use client';

import type { PastWinner } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

interface PastWinnersListProps {
    pastWinners: PastWinner[];
}

export default function PastWinnersList({ pastWinners }: PastWinnersListProps) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Election History</CardTitle>
                <CardDescription>A record of past election winners and their results.</CardDescription>
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
