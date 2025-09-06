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
  prompt: `You are an election analyst. Your task is to provide a concise summary of the current election results based on the data provided.

Analyze the following data:
- Candidate Results: {{jsonStringify candidateResults}}
- Total Votes Cast: {{totalVotes}}
- Total Eligible Voters: {{totalVoters}}

Based on this data, generate a one-paragraph summary.
- If there are no votes, state that the election has just begun and no votes have been cast.
- Otherwise, calculate the voter turnout percentage (Total Votes Cast / Total Eligible Voters).
- Identify the leading candidate(s). If there's a tie, mention it.
- State the leading candidate's name and their percentage of the total vote.
- Keep the summary brief, professional, and to the point.

Example for a single leader: "Voter turnout is at 50.0%. The leading candidate is Jane Doe with 60.0% of the vote."
Example for a tie: "Voter turnout is at 75.0%. There is currently a tie between John Smith and Jane Doe, each with 50.0% of the vote."
Example for no votes: "The election is underway, but no votes have been cast yet."
  `,
});

const summarizeVoteResultsFlow = ai.defineFlow(
  {
    name: 'summarizeVoteResultsFlow',
    inputSchema: SummarizeVoteResultsInputSchema,
    outputSchema: SummarizeVoteResultsOutputSchema,
  },
  async input => {
    if (input.candidateResults.length === 0) {
      return { summary: "No candidates are in the race. Add candidates to see results." };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
