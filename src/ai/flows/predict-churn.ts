'use server';

/**
 * @fileOverview Predicts customer churn risk for proactive engagement.
 *
 * - predictChurn - A function to trigger churn prediction workflow.
 * - PredictChurnInput - The input type for the predictChurn function.
 * - PredictChurnOutput - The return type for the predictChurn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictChurnInputSchema = z.object({
  customerId: z.string().describe('The unique identifier of the customer.'),
});
export type PredictChurnInput = z.infer<typeof PredictChurnInputSchema>;

const PredictChurnOutputSchema = z.object({
  isAtRisk: z.boolean().describe('Whether the customer is predicted to be at risk of churn.'),
  riskScore: z
    .number()
    .describe('A numerical score representing the customer’s churn risk (0-1).'),
  reasons: z
    .array(z.string())
    .describe('Reasons contributing to the churn risk, such as inactivity or low engagement.'),
  suggestedActions: z
    .array(z.string())
    .describe('Suggested actions to mitigate churn risk, such as targeted offers.'),
});
export type PredictChurnOutput = z.infer<typeof PredictChurnOutputSchema>;

export async function predictChurn(input: PredictChurnInput): Promise<PredictChurnOutput> {
  return predictChurnFlow(input);
}

const predictChurnPrompt = ai.definePrompt({
  name: 'predictChurnPrompt',
  input: {schema: PredictChurnInputSchema},
  output: {schema: PredictChurnOutputSchema},
  prompt: `You are an expert customer retention analyst.
  Given the customer ID, you will predict whether the customer is at risk of churn.
  Provide a risk score between 0 and 1, where 1 indicates the highest risk.
  List the reasons contributing to the churn risk and suggest actions to mitigate it.

  Customer ID: {{{customerId}}}
`,
});

const predictChurnFlow = ai.defineFlow(
  {
    name: 'predictChurnFlow',
    inputSchema: PredictChurnInputSchema,
    outputSchema: PredictChurnOutputSchema,
  },
  async input => {
    const {output} = await predictChurnPrompt(input);
    return output!;
  }
);
