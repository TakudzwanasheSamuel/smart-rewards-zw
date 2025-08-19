import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import { customerAdvisorChat } from '@/ai/flows/customer-advisor';
import { CustomerAnalytics } from '@/lib/ai-analytics/customer-analytics';

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

    // Verify user is a customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true }
    });

    if (!user || user.user_type !== 'customer' || !user.customer) {
      return NextResponse.json({ error: 'Access denied. Customer account required.' }, { status: 403 });
    }

    const customerId = user.customer.user_id;
    const body = await req.json();
    const { message, conversationContext, requestType } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate AI advisor response
    const advisorResponse = await customerAdvisorChat({
      customerId,
      message,
      conversationContext: conversationContext || [],
      requestType
    });

    // Store conversation for analytics (optional)
    try {
      await prisma.aiInsight.create({
        data: {
          business_id: customerId, // Using customer_id in place of business_id for customer insights
          insight_type: 'customer_conversation',
          insight_json: {
            message,
            response: advisorResponse.response,
            requestType,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.warn('Failed to store conversation:', error);
      // Continue without storing if it fails
    }

    return NextResponse.json({
      success: true,
      data: advisorResponse
    });

  } catch (error) {
    console.error('Customer advisor error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

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

    // Verify user is a customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true }
    });

    if (!user || user.user_type !== 'customer' || !user.customer) {
      return NextResponse.json({ error: 'Access denied. Customer account required.' }, { status: 403 });
    }

    const customerId = user.customer.user_id;
    const { searchParams } = new URL(req.url);
    const dataType = searchParams.get('data') || 'insights';

    const customerAnalytics = new CustomerAnalytics(customerId);

    let responseData = {};

    switch (dataType) {
      case 'insights':
        responseData = await customerAnalytics.generatePersonalizedInsights();
        break;
      case 'offers':
        responseData = await customerAnalytics.getAvailableOffers();
        break;
      case 'profile':
        responseData = await customerAnalytics.getCustomerProfile();
        break;
      case 'spending':
        responseData = await customerAnalytics.analyzeSpendingPattern();
        break;
      case 'engagement':
        responseData = await customerAnalytics.analyzeEngagement();
        break;
      default:
        responseData = await customerAnalytics.generatePersonalizedInsights();
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Customer data error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customer data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
