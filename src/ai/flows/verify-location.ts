'use server';
/**
 * @fileOverview Verifies a customer's location for a check-in.
 *
 * - verifyLocation - A function that verifies GPS coordinates against a business's geo-fence.
 * - VerifyLocationInput - The input type for the verifyLocation function.
 * - VerifyLocationOutput - The return type for the verifyLocation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyLocationInputSchema = z.object({
  latitude: z.number().describe("The customer's current latitude."),
  longitude: z.number().describe("The customer's current longitude."),
});
export type VerifyLocationInput = z.infer<typeof VerifyLocationInputSchema>;

const VerifyLocationOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the customer is within the business geo-fence.'),
  businessName: z.string().optional().describe('The name of the business if verification is successful.'),
  pointsAwarded: z.number().optional().describe('The number of points awarded for the check-in.'),
});
export type VerifyLocationOutput = z.infer<typeof VerifyLocationOutputSchema>;

export async function verifyLocation(input: VerifyLocationInput): Promise<VerifyLocationOutput> {
  return verifyLocationFlow(input);
}

// In a real application, this prompt would likely be a tool that queries a PostGIS database.
// For the prototype, we are using a prompt to simulate the verification logic.
const verifyLocationPrompt = ai.definePrompt({
  name: 'verifyLocationPrompt',
  input: { schema: VerifyLocationInputSchema },
  output: { schema: VerifyLocationOutputSchema },
  prompt: `You are a location verification system for a loyalty app.
  A customer is trying to check in at a business to earn points.
  Their current coordinates are: Latitude: {{{latitude}}}, Longitude: {{{longitude}}}.

  The business 'Chicken Inn' is located at Latitude -17.8252, Longitude 31.0335.
  Their check-in geo-fence is a 100-meter radius around this point.

  Based on the customer's coordinates, determine if they are inside the geo-fence.
  - If they are inside, respond with isVerified: true, businessName: 'Chicken Inn', and pointsAwarded: 10.
  - If they are outside, respond with isVerified: false.
  `,
});

const verifyLocationFlow = ai.defineFlow(
  {
    name: 'verifyLocationFlow',
    inputSchema: VerifyLocationInputSchema,
    outputSchema: VerifyLocationOutputSchema,
  },
  async (input) => {
    // Here you would typically query your database with PostGIS:
    // e.g., SELECT name, points_on_checkin FROM businesses WHERE ST_DWithin(location, ST_MakePoint(input.longitude, input.latitude)::geography, 100);
    // For the prototype, we call the LLM to simulate this check.
    const { output } = await verifyLocationPrompt(input);
    return output!;
  }
);
