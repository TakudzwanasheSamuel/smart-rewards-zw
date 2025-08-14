'use server';
/**
 * @fileOverview Personalized offer recommendations based on user preferences and location.
 *
 * - getPersonalizedOffers - A function that retrieves personalized offers for a customer.
 * - PersonalizedOffersInput - The input type for the getPersonalizedOffers function.
 * - PersonalizedOffersOutput - The return type for the getPersonalizedOffers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedOffersInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer.'),
  location: z
    .string()
    .describe(
      'The current location of the customer (e.g., a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\').'
    ),
  preferences: z.array(z.string()).describe('The customer\s preferences (e.g., fast food, salons, hardware, retail).'),
});
export type PersonalizedOffersInput = z.infer<typeof PersonalizedOffersInputSchema>;

const PersonalizedOffersOutputSchema = z.object({
  offers: z.array(
    z.object({
      offerId: z.string().describe('The ID of the offer.'),
      businessName: z.string().describe('The name of the business offering the deal.'),
      description: z.string().describe('A description of the offer.'),
      location: z.string().describe('The location of the business offering the offer.'),
      discount: z.string().describe('The discount provided by the offer'),
    })
  ).describe('A list of personalized offers for the customer.'),
});
export type PersonalizedOffersOutput = z.infer<typeof PersonalizedOffersOutputSchema>;

export async function getPersonalizedOffers(input: PersonalizedOffersInput): Promise<PersonalizedOffersOutput> {
  return personalizedOffersFlow(input);
}

const offerRecommendationPrompt = ai.definePrompt({
  name: 'offerRecommendationPrompt',
  input: {schema: PersonalizedOffersInputSchema},
  output: {schema: PersonalizedOffersOutputSchema},
  prompt: `You are a recommendation engine that suggests offers to customers based on their preferences and location.\n\n  Provide a list of personalized offers based on the customer's preferences and location. Include the offer ID, business name, description, and location for each offer.  Make sure the offers are relevant to their preferences.
  Customer ID: {{{customerId}}}\n  Location: {{{location}}}\n  Preferences: {{#each preferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n`,
});

const personalizedOffersFlow = ai.defineFlow(
  {
    name: 'personalizedOffersFlow',
    inputSchema: PersonalizedOffersInputSchema,
    outputSchema: PersonalizedOffersOutputSchema,
  },
  async input => {
    const {output} = await offerRecommendationPrompt(input);
    return output!;
  }
);
