'use server';

/**
 * @fileOverview Summarizes vote results into key insights for the admin.
 *
 * - summarizeVoteResults - A function that summarizes the vote results.
 * - SummarizeVoteResultsInput - The input type for the summarizeVoteResults function.
 * - SummarizeVoteResultsOutput - The return type for the summarizeVoteResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVoteResultsInputSchema = z.object({
  candidateResults: z
    .array(
      z.object({
        candidateName: z.string(),
        voteCount: z.number(),
      })
    )
    .describe('An array of candidate names and their vote counts.'),
  totalVotes: z.number().describe('The total number of votes cast.'),
  totalVoters: z.number().describe('The total number of eligible voters.'),
});
export type SummarizeVoteResultsInput = z.infer<typeof SummarizeVoteResultsInputSchema>;

const SummarizeVoteResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the vote results.'),
});
export type SummarizeVoteResultsOutput = z.infer<typeof SummarizeVoteResultsOutputSchema>;

export async function summarizeVoteResults(
  input: SummarizeVoteResultsInput
): Promise<SummarizeVoteResultsOutput> {
  return summarizeVoteResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeVoteResultsPrompt',
  input: {schema: SummarizeVoteResultsInputSchema},
  output: {schema: SummarizeVoteResultsOutputSchema},
  prompt: `Summarize the vote results into key insights for the admin.

  Include the leading candidate and their percentage of votes.
  Include the voter turnout percentage.

  Candidate Results: {{{candidateResults}}}
  Total Votes: {{{totalVotes}}}
  Total Voters: {{{totalVoters}}}
  `,
});

const summarizeVoteResultsFlow = ai.defineFlow(
  {
    name: 'summarizeVoteResultsFlow',
    inputSchema: SummarizeVoteResultsInputSchema,
    outputSchema: SummarizeVoteResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
