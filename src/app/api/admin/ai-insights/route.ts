import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import { generateBusinessInsights } from '@/ai/flows/business-insights';
import { BusinessMetricsCalculator } from '@/lib/ai-analytics/business-metrics';
import { RecommendationsEngine } from '@/lib/ai-analytics/recommendations-engine';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Verify user is a business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true }
    });

    if (!user || user.user_type !== 'business' || !user.business) {
      return NextResponse.json({ error: 'Access denied. Business account required.' }, { status: 403 });
    }

    const businessId = user.business.user_id;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const analysisType = searchParams.get('type') || 'comprehensive';
    const focusArea = searchParams.get('focus') || 'all';
    const includeRawMetrics = searchParams.get('includeMetrics') === 'true';

    // Calculate business metrics
    const metricsCalculator = new BusinessMetricsCalculator(businessId);
    const metrics = await metricsCalculator.calculateMetrics();
    const segments = await metricsCalculator.generateCustomerSegments();

    // Generate recommendations
    const recommendationsEngine = new RecommendationsEngine(businessId, metrics, segments);
    const businessInsights = await recommendationsEngine.generateComprehensiveInsights();

    // Generate AI-powered insights
    let aiInsights = null;
    try {
      aiInsights = await generateBusinessInsights({
        businessId,
        analysisType: analysisType as any,
        focusArea: focusArea as any
      });
    } catch (error) {
      console.error('AI insights generation failed:', error);
      // Continue without AI insights if the service fails
    }

    // Store insights in database for future reference
    try {
      await prisma.aiInsight.create({
        data: {
          business_id: businessId,
          insight_type: 'comprehensive_analysis',
          insight_json: {
            metrics: includeRawMetrics ? metrics : null,
            segments,
            opportunities: businessInsights.opportunities,
            alerts: businessInsights.alerts,
            aiInsights,
            generatedAt: new Date().toISOString(),
            analysisType,
            focusArea
          }
        }
      });
    } catch (error) {
      console.error('Failed to store insights:', error);
      // Continue even if storage fails
    }

    const response = {
      success: true,
      data: {
        businessId,
        generatedAt: new Date().toISOString(),
        summary: {
          totalCustomers: metrics.totalCustomers,
          growthRate: metrics.customerGrowthRate,
          retentionRate: metrics.retentionRate,
          churnRate: metrics.churnRate,
          engagementScore: Math.round((metrics.monthlyActiveUsers / Math.max(metrics.totalCustomers, 1)) * 100),
          mukandoEngagement: metrics.mukandoEngagementRate,
          performanceScore: aiInsights?.performanceScore || calculateQuickScore(metrics)
        },
        metrics: includeRawMetrics ? metrics : {
          totalCustomers: metrics.totalCustomers,
          newCustomersThisMonth: metrics.newCustomersThisMonth,
          activeCustomersThisMonth: metrics.activeCustomersThisMonth,
          customerGrowthRate: metrics.customerGrowthRate,
          totalTransactions: metrics.totalTransactions,
          totalPointsEarned: metrics.totalPointsEarned,
          totalPointsRedeemed: metrics.totalPointsRedeemed,
          averageTransactionValue: metrics.averageTransactionValue,
          retentionRate: metrics.retentionRate,
          churnRate: metrics.churnRate,
          redemptionRate: metrics.redemptionRate,
          mukandoEngagementRate: metrics.mukandoEngagementRate,
          activeMukandoGroups: metrics.activeMukandoGroups,
          tierDistribution: metrics.tierDistribution,
          mostPopularOffers: metrics.mostPopularOffers.slice(0, 5),
          topCustomersByPoints: metrics.topCustomersByPoints.slice(0, 10)
        },
        segments,
        insights: businessInsights,
        aiAnalysis: aiInsights,
        recommendations: {
          programs: await recommendationsEngine.generateProgramRecommendations(),
          offers: await recommendationsEngine.generateOfferRecommendations(),
          rules: await recommendationsEngine.generateRuleRecommendations()
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI Insights API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Verify user is a business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true }
    });

    if (!user || user.user_type !== 'business' || !user.business) {
      return NextResponse.json({ error: 'Access denied. Business account required.' }, { status: 403 });
    }

    const businessId = user.business.user_id;
    const body = await req.json();
    const { action, recommendationId, feedback } = body;

    if (action === 'implement_recommendation') {
      // Track recommendation implementation
      await prisma.aiInsight.create({
        data: {
          business_id: businessId,
          insight_type: 'recommendation_action',
          insight_json: {
            action: 'implemented',
            recommendationId,
            implementedAt: new Date().toISOString(),
            feedback
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Recommendation implementation tracked' 
      });
    }

    if (action === 'provide_feedback') {
      // Store feedback on insights quality
      await prisma.aiInsight.create({
        data: {
          business_id: businessId,
          insight_type: 'insights_feedback',
          insight_json: {
            feedback,
            providedAt: new Date().toISOString()
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Feedback recorded' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('AI Insights action error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process action',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

function calculateQuickScore(metrics: any): number {
  let score = 50;
  
  if (metrics.customerGrowthRate > 10) score += 20;
  else if (metrics.customerGrowthRate > 5) score += 10;
  
  if (metrics.retentionRate > 70) score += 15;
  else if (metrics.retentionRate < 40) score -= 15;
  
  if (metrics.mukandoEngagementRate > 20) score += 10;
  
  const engagementRatio = metrics.monthlyActiveUsers / Math.max(metrics.totalCustomers, 1);
  if (engagementRatio > 0.5) score += 10;
  
  return Math.max(0, Math.min(100, score));
}
