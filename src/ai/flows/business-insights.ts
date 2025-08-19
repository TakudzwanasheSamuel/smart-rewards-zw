'use server';

/**
 * @fileOverview AI-powered business insights and recommendations generator.
 *
 * - generateBusinessInsights - Analyzes business data and provides actionable insights
 * - BusinessInsightsInput - Input type for business insights generation
 * - BusinessInsightsOutput - Comprehensive insights and recommendations output
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { BusinessMetricsCalculator } from '@/lib/ai-analytics/business-metrics';
import { RecommendationsEngine } from '@/lib/ai-analytics/recommendations-engine';

const BusinessInsightsInputSchema = z.object({
  businessId: z.string().describe('The unique identifier of the business'),
  analysisType: z.enum(['comprehensive', 'quick', 'specific']).describe('Type of analysis to perform'),
  focusArea: z.enum(['growth', 'retention', 'engagement', 'revenue', 'all']).optional().describe('Specific area to focus analysis on'),
});
export type BusinessInsightsInput = z.infer<typeof BusinessInsightsInputSchema>;

const BusinessInsightsOutputSchema = z.object({
  executiveSummary: z.string().describe('High-level summary of business performance and key insights'),
  keyFindings: z.array(z.string()).describe('Most important discoveries from the data analysis'),
  performanceScore: z.number().describe('Overall performance score from 0-100'),
  recommendations: z.array(z.object({
    category: z.string().describe('Category of recommendation (loyalty, marketing, operations, etc.)'),
    priority: z.enum(['high', 'medium', 'low']).describe('Implementation priority'),
    title: z.string().describe('Short title of the recommendation'),
    description: z.string().describe('Detailed description of what to do'),
    expectedImpact: z.string().describe('Expected business impact'),
    timeframe: z.string().describe('Recommended implementation timeframe'),
    effort: z.enum(['low', 'medium', 'high']).describe('Implementation effort required')
  })).describe('Prioritized list of actionable recommendations'),
  riskFactors: z.array(z.string()).describe('Potential risks or concerns identified in the business'),
  opportunities: z.array(z.string()).describe('Untapped opportunities for growth'),
  nextSteps: z.array(z.string()).describe('Immediate actions to take based on insights')
});
export type BusinessInsightsOutput = z.infer<typeof BusinessInsightsOutputSchema>;

export async function generateBusinessInsights(input: BusinessInsightsInput): Promise<BusinessInsightsOutput> {
  return businessInsightsFlow(input);
}

const businessInsightsPrompt = ai.definePrompt({
  name: 'businessInsightsPrompt',
  input: { schema: BusinessInsightsInputSchema },
  output: { schema: BusinessInsightsOutputSchema },
  prompt: `You are an expert business consultant and data analyst specializing in loyalty programs and customer engagement. 

  Analyze the provided business data for business ID: {{{businessId}}} and generate comprehensive insights.

  Focus your analysis on:
  - Customer loyalty program performance
  - Engagement patterns and trends
  - Revenue optimization opportunities
  - Retention and churn patterns
  - Mukando community savings program effectiveness
  - Competitive positioning

  Analysis Type: {{{analysisType}}}
  {{#if focusArea}}Focus Area: {{{focusArea}}}{{/if}}

  Provide actionable, data-driven recommendations that this business can implement to improve their loyalty program and overall performance. Consider the unique aspects of the Smart Rewards platform including:
  - Multi-tier loyalty system
  - Mukando community savings groups
  - Points-based economy
  - Location-based features
  - AI-powered personalization

  Make sure all recommendations are specific, measurable, and realistic for implementation.`,
});

const businessInsightsFlow = ai.defineFlow(
  {
    name: 'businessInsightsFlow',
    inputSchema: BusinessInsightsInputSchema,
    outputSchema: BusinessInsightsOutputSchema,
  },
  async (input) => {
    try {
      // Calculate real business metrics
      const metricsCalculator = new BusinessMetricsCalculator(input.businessId);
      const metrics = await metricsCalculator.calculateMetrics();
      const segments = await metricsCalculator.generateCustomerSegments();
      
      // Generate AI-powered recommendations
      const recommendationsEngine = new RecommendationsEngine(input.businessId, metrics, segments);
      const comprehensiveInsights = await recommendationsEngine.generateComprehensiveInsights();

      // Calculate performance score based on key metrics
      const performanceScore = calculatePerformanceScore(metrics);

      // Generate AI insights with real data context
      const aiPromptWithData = `
      BUSINESS METRICS DATA:
      - Total Customers: ${metrics.totalCustomers}
      - Customer Growth Rate: ${metrics.customerGrowthRate.toFixed(2)}%
      - Retention Rate: ${metrics.retentionRate.toFixed(2)}%
      - Churn Rate: ${metrics.churnRate.toFixed(2)}%
      - Average Transaction Value: $${metrics.averageTransactionValue.toFixed(2)}
      - Total Points Earned: ${metrics.totalPointsEarned}
      - Total Points Redeemed: ${metrics.totalPointsRedeemed}
      - Redemption Rate: ${metrics.redemptionRate.toFixed(2)}%
      - Mukando Engagement: ${metrics.mukandoEngagementRate.toFixed(2)}%
      - Active Mukando Groups: ${metrics.activeMukandoGroups}
      - Daily Active Users: ${metrics.dailyActiveUsers}
      - Monthly Active Users: ${metrics.monthlyActiveUsers}
      
      CUSTOMER SEGMENTS:
      ${segments.map(seg => `- ${seg.segmentName}: ${seg.customerCount} customers (${seg.engagementLevel} engagement)`).join('\n')}
      
      TIER DISTRIBUTION:
      ${Object.entries(metrics.tierDistribution).map(([tier, count]) => `- ${tier}: ${count} customers`).join('\n')}
      
      TOP PERFORMING OFFERS:
      ${metrics.mostPopularOffers.slice(0, 3).map(offer => `- ${offer.offerName}: ${offer.redemptions} redemptions`).join('\n')}
      
      TRANSACTION TRENDS:
      Recent 7-day average: ${metrics.transactionTrend.slice(-7).reduce((sum, day) => sum + day.transactions, 0) / 7} transactions/day
      
      Based on this real data, provide comprehensive insights and recommendations.
      `;

      const { output } = await businessInsightsPrompt({
        ...input,
        // Add real data context to the prompt
        businessId: input.businessId + '\n\nREAL BUSINESS DATA:\n' + aiPromptWithData
      });

      // Enhance AI output with calculated insights
      const enhancedOutput = {
        ...output!,
        performanceScore,
        recommendations: [
          ...output!.recommendations,
          ...comprehensiveInsights.opportunities.slice(0, 3).map(opp => ({
            category: opp.type,
            priority: opp.priority,
            title: opp.title,
            description: opp.description,
            expectedImpact: opp.estimatedImpact,
            timeframe: getTimeframeFromPriority(opp.priority),
            effort: getEffortFromPriority(opp.priority)
          }))
        ]
      };

      return enhancedOutput;
    } catch (error) {
      console.error('Error generating business insights:', error);
      // Fallback to basic AI analysis without real data
      const { output } = await businessInsightsPrompt(input);
      return output!;
    }
  }
);

function calculatePerformanceScore(metrics: any): number {
  let score = 50; // Base score

  // Customer growth (+/- 20 points)
  if (metrics.customerGrowthRate > 10) score += 20;
  else if (metrics.customerGrowthRate > 5) score += 10;
  else if (metrics.customerGrowthRate < 0) score -= 15;

  // Retention rate (+/- 15 points)
  if (metrics.retentionRate > 80) score += 15;
  else if (metrics.retentionRate > 60) score += 8;
  else if (metrics.retentionRate < 40) score -= 15;

  // Engagement (+/- 10 points)
  const engagementRatio = metrics.monthlyActiveUsers / Math.max(metrics.totalCustomers, 1);
  if (engagementRatio > 0.7) score += 10;
  else if (engagementRatio > 0.4) score += 5;
  else if (engagementRatio < 0.2) score -= 10;

  // Mukando engagement (+/- 10 points)
  if (metrics.mukandoEngagementRate > 25) score += 10;
  else if (metrics.mukandoEngagementRate > 15) score += 5;
  else if (metrics.mukandoEngagementRate < 5) score -= 5;

  // Redemption rate (+/- 5 points)
  if (metrics.redemptionRate > 30) score += 5;
  else if (metrics.redemptionRate < 10) score -= 5;

  return Math.max(0, Math.min(100, score));
}

function getTimeframeFromPriority(priority: string): string {
  switch (priority) {
    case 'high': return '1-2 weeks';
    case 'medium': return '1-2 months';
    case 'low': return '3-6 months';
    default: return '1-3 months';
  }
}

function getEffortFromPriority(priority: string): 'low' | 'medium' | 'high' {
  switch (priority) {
    case 'high': return 'medium';
    case 'medium': return 'low';
    case 'low': return 'high';
    default: return 'medium';
  }
}
