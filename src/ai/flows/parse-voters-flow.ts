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
  prompt: `You are an expert data processor. Your task is to parse the provided CSV data which contains a list of names and extract them into a JSON object.

The final JSON object must have a single key "voters" which contains an array of voter objects, where each object has a "name" key.

Example:
CSV Input:
John Doe
Jane Smith

JSON Output:
{
  "voters": [
    { "name": "John Doe" },
    { "name": "Jane Smith" }
  ]
}

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
    return output;
  }
);
