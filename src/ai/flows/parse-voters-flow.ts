'use server';

/**
 * @fileOverview Parses a CSV file of voters and returns a structured array of user data.
 *
 * - parseVoters - A function that takes CSV data and returns parsed voter information.
 * - ParseVotersOutput - The Zod schema for the array of voters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoterDataSchema = z.object({
  name: z.string().describe('The full name of the voter.'),
  code: z.string().describe('The unique secret voting code for the voter.'),
});

const ParseVotersOutputSchema = z.object({
  voters: z.array(VoterDataSchema),
});
export type ParseVotersOutput = z.infer<typeof ParseVotersOutputSchema>;


export async function parseVoters(csvData: string): Promise<ParseVotersOutput> {
  return parseVotersFlow(csvData);
}

const prompt = ai.definePrompt({
  name: 'parseVotersPrompt',
  input: { schema: z.string() },
  output: { schema: ParseVotersOutputSchema },
  prompt: `You are an expert data processor. Your task is to parse the provided CSV data and extract voter information.

The CSV data will have two columns. One column is for the voter's full name, and the other is for their secret voting code. The columns might not be in a consistent order, and the headers might have different names (e.g., "Student Name", "Name", "Voter"; "Code", "Secret", "PIN").

Your job is to automatically identify which column corresponds to the name and which to the code, and then extract all the rows into a structured JSON array.

Here is the CSV data:
{{{input}}}
`,
});

const parseVotersFlow = ai.defineFlow(
  {
    name: 'parseVotersFlow',
    inputSchema: z.string(),
    outputSchema: ParseVotersOutputSchema,
  },
  async (csvData) => {
    const { output } = await prompt(csvData);
    if (!output || !output.voters) {
      return { voters: [] };
    }
    return { voters: output.voters };
  }
);
