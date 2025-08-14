 'use server';

/**
 * @fileOverview An AI agent for summarizing customer feedback.
 *
 * - summarizeFeedback - A function that summarizes customer feedback.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInputSchema = z.object({
  feedback: z.string().describe('The customer feedback to summarize.'),
});
export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the customer feedback.'),
  sentiment: z
    .string()
    .describe(
      'The overall sentiment of the feedback (e.g., positive, negative, neutral).'
    ),
});
export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are an AI that specializes in summarizing customer feedback and determining its sentiment.

  Summarize the following customer feedback and determine its overall sentiment (positive, negative, or neutral).

  Feedback: {{{feedback}}}

  Summary:
  Sentiment: `,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
