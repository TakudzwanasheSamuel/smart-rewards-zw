'use server';

/**
 * @fileOverview AI-powered customer advisor chatbot for Smart Rewards platform guidance.
 *
 * - customerAdvisorChat - Intelligent customer support and recommendations
 * - CustomerAdvisorInput - Input schema for customer queries
 * - CustomerAdvisorOutput - Structured advisor response
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CustomerAnalytics } from '@/lib/ai-analytics/customer-analytics';

const CustomerAdvisorInputSchema = z.object({
  customerId: z.string().describe('The unique identifier of the customer'),
  message: z.string().describe('Customer message or question'),
  conversationContext: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('Previous conversation messages for context'),
  requestType: z.enum(['general', 'offers', 'businesses', 'mukando', 'financial', 'tier']).optional().describe('Specific type of help requested')
});
export type CustomerAdvisorInput = z.infer<typeof CustomerAdvisorInputSchema>;

const CustomerAdvisorOutputSchema = z.object({
  response: z.string().describe('Main response to the customer query'),
  responseType: z.enum(['informational', 'recommendation', 'action', 'clarification']).describe('Type of response provided'),
  recommendations: z.array(z.object({
    type: z.string().describe('Type of recommendation'),
    title: z.string().describe('Recommendation title'),
    description: z.string().describe('Detailed description'),
    action: z.string().describe('Suggested action'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level')
  })).describe('Specific actionable recommendations'),
  quickActions: z.array(z.object({
    label: z.string().describe('Action button label'),
    action: z.string().describe('Action to perform'),
    data: z.any().optional().describe('Additional data for the action')
  })).describe('Quick action buttons for the customer'),
  followUpQuestions: z.array(z.string()).describe('Suggested follow-up questions'),
  helpfulTips: z.array(z.string()).describe('Additional tips related to the query'),
  dataInsights: z.object({
    currentPoints: z.number().optional(),
    tier: z.string().optional(),
    potentialSavings: z.string().optional(),
    nextMilestone: z.string().optional()
  }).optional().describe('Relevant data insights to share')
});
export type CustomerAdvisorOutput = z.infer<typeof CustomerAdvisorOutputSchema>;

export async function customerAdvisorChat(input: CustomerAdvisorInput): Promise<CustomerAdvisorOutput> {
  return customerAdvisorFlow(input);
}

const customerAdvisorPrompt = ai.definePrompt({
  name: 'customerAdvisorPrompt',
  input: { schema: CustomerAdvisorInputSchema },
  output: { schema: CustomerAdvisorOutputSchema },
  prompt: `You are Takudzwanashe, an AI-powered customer advisor for the Smart Rewards loyalty platform. You're friendly, knowledgeable, and focused on helping customers maximize their benefits and manage their finances effectively.

## Platform Features You Can Help With:
- **Loyalty Points**: Earning, spending, and optimizing point accumulation
- **Tier System**: Bronze, Silver, Gold, Platinum progression and benefits
- **Offers & Discounts**: Finding and redeeming the best deals
- **Mukando Groups**: Community savings programs for shared goals
- **Business Discovery**: Finding relevant businesses and services
- **Financial Planning**: Smart spending and saving strategies
- **Account Management**: Profile optimization and preferences

## Your Personality:
- Friendly and conversational, but professional
- Data-driven but explain insights in simple terms
- Proactive in suggesting improvements and opportunities
- Focused on customer financial wellness and platform benefits
- Use emojis sparingly and appropriately

## Customer Context:
Customer ID: {{{customerId}}}
Message: "{{{message}}}"
{{#if requestType}}Request Type: {{{requestType}}}{{/if}}

{{#if conversationContext}}
Previous Conversation:
{{#each conversationContext}}
{{role}}: {{content}}
{{/each}}
{{/if}}

## Instructions:
1. Provide helpful, actionable advice based on the customer's specific situation
2. Always include practical next steps or recommendations
3. Suggest relevant quick actions the customer can take
4. Share data insights when relevant (points, tier status, potential savings)
5. Ask follow-up questions to better understand their needs
6. Focus on maximizing their platform benefits and financial wellness

Remember: Base your recommendations on real platform features and be specific about the benefits and steps involved.`,
});

const customerAdvisorFlow = ai.defineFlow(
  {
    name: 'customerAdvisorFlow',
    inputSchema: CustomerAdvisorInputSchema,
    outputSchema: CustomerAdvisorOutputSchema,
  },
  async (input) => {
    try {
      // Get customer analytics for personalized responses
      const customerAnalytics = new CustomerAnalytics(input.customerId);
      const [profile, insights, offers] = await Promise.all([
        customerAnalytics.getCustomerProfile(),
        customerAnalytics.generatePersonalizedInsights(),
        customerAnalytics.getAvailableOffers()
      ]);

      // Create enhanced prompt with customer data
      const enhancedPromptData = `
CUSTOMER PROFILE DATA:
- Name: ${profile.fullName}
- Current Points: ${profile.loyaltyPoints}
- Tier: ${profile.loyaltyTier}
- Eco Points: ${profile.ecoPoints}
- Interests: ${profile.interests.join(', ') || 'Not specified'}
- Member Since: ${profile.joinedDate.toLocaleDateString()}
- Last Active: ${profile.lastActiveDate.toLocaleDateString()}

SPENDING INSIGHTS:
- Total Transactions: ${insights.spendingPattern.totalTransactions}
- Average Transaction: $${insights.spendingPattern.averageTransactionValue.toFixed(2)}
- Preferred Categories: ${insights.spendingPattern.frequentBusinessCategories.map(c => c.category).join(', ')}
- Favorite Businesses: ${insights.spendingPattern.preferredBusinesses.map(b => b.businessName).join(', ')}

ENGAGEMENT ANALYSIS:
- Engagement Score: ${insights.engagement.engagementScore}/100
- Days Since Last Transaction: ${insights.engagement.daysSinceLastTransaction}
- Mukando Participation: ${insights.engagement.mukandoParticipation.isActive ? 'Active' : 'Not participating'}
- Groups Joined: ${insights.engagement.mukandoParticipation.groupsJoined}

AVAILABLE OPPORTUNITIES:
- Active Offers: ${offers.activeOffers.length} offers available
- Recommended Offers: ${offers.activeOffers.filter(o => o.isRecommended).length}
- New Businesses to Try: ${offers.compatibleBusinesses.length}

CURRENT RECOMMENDATIONS:
${insights.recommendations.map(r => `- ${r.title}: ${r.description}`).join('\n')}

Based on this customer data, provide personalized advice and recommendations.
`;

      // Generate AI response with real customer context
      const { output } = await customerAdvisorPrompt({
        ...input,
        customerId: input.customerId + '\n\nCUSTOMER DATA:\n' + enhancedPromptData
      });

      // Enhance the AI output with real data insights
      const enhancedOutput = {
        ...output!,
        dataInsights: {
          currentPoints: profile.loyaltyPoints,
          tier: profile.loyaltyTier,
          potentialSavings: offers.activeOffers.length > 0 
            ? `Up to ${Math.max(...offers.activeOffers.map(o => o.pointsRequired))} points in savings available`
            : 'Check back for new offers',
          nextMilestone: insights.achievementOpportunities.length > 0
            ? insights.achievementOpportunities[0].title
            : 'Keep earning points!'
        },
        recommendations: [
          ...output!.recommendations,
          ...insights.recommendations.slice(0, 2).map(r => ({
            type: r.type,
            title: r.title,
            description: r.description,
            action: r.actionText,
            priority: r.priority
          }))
        ]
      };

      return enhancedOutput;

    } catch (error) {
      console.error('Error in customer advisor flow:', error);
      
      // Fallback response when customer data isn't available
      const { output } = await customerAdvisorPrompt(input);
      return output!;
    }
  }
);


