'use server';
/**
 * @fileOverview An AI agent for processing receipt images using OCR.
 *
 * - processReceipt - A function that handles receipt image processing.
 * - ProcessReceiptInput - The input type for the processReceipt function.
 * - ProcessReceiptOutput - The return type for the processReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "An image of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessReceiptInput = z.infer<typeof ProcessReceiptInputSchema>;

const ProcessReceiptOutputSchema = z.object({
  businessName: z.string().describe('The name of the business found on the receipt.'),
  transactionAmount: z.number().describe('The total transaction amount found on the receipt.'),
  transactionDate: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  isVerified: z.boolean().describe('Whether the receipt details could be confidently extracted.'),
  verificationNotes: z.string().describe('Notes on the verification process, or reasons for failure.'),
});
export type ProcessReceiptOutput = z.infer<typeof ProcessReceiptOutputSchema>;

export async function processReceipt(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  return processReceiptFlow(input);
}

const receiptOcrPrompt = ai.definePrompt({
  name: 'receiptOcrPrompt',
  input: {schema: ProcessReceiptInputSchema},
  output: {schema: ProcessReceiptOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) and verification specialist.
Your task is to analyze the provided receipt image and extract the following details:
1.  Business Name
2.  Total Transaction Amount
3.  Transaction Date

If you can confidently extract all information, set 'isVerified' to true.
If any information is blurry, ambiguous, or missing, set 'isVerified' to false and explain why in the 'verificationNotes'.

Receipt Image: {{media url=receiptImage}}`,
});

const processReceiptFlow = ai.defineFlow(
  {
    name: 'processReceiptFlow',
    inputSchema: ProcessReceiptInputSchema,
    outputSchema: ProcessReceiptOutputSchema,
  },
  async input => {
    const {output} = await receiptOcrPrompt(input);
    return output!;
  }
);
