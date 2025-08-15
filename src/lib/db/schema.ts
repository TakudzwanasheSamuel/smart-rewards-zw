/**
 * @fileoverview This file defines the TypeScript types for the application's database schema.
 * These types are used to ensure type safety when interacting with data throughout the app.
 */

// 1. User & Business Management

export type User = {
  id: string; // UUID
  email: string;
  password_hash: string;
  user_type: 'customer' | 'business';
  created_at: Date;
  updated_at: Date;
};

export type Customer = {
  user_id: string; // UUID, Foreign Key to users(id)
  full_name: string;
  interests: string[];
  loyalty_points: number;
  eco_points: number;
  loyalty_tier: string;
  referral_code: string;
};

export type Business = {
  user_id: string; // UUID, Foreign Key to users(id)
  business_name: string;
  business_category: string;
  logo_url?: string;
  contact_phone?: string;
  location: any; // PostGIS Geometry(Point, 4326)
  shared_loyalty_id?: string; // UUID
};

export type CustomerBusinessRelation = {
  customer_id: string; // UUID, Foreign Key to customers(user_id)
  business_id: string; // UUID, Foreign Key to businesses(user_id)
};

// 2. Loyalty Engine & Transaction Logic

export type Transaction = {
  id: string; // UUID
  customer_id: string; // UUID, Foreign Key to customers(user_id)
  business_id: string; // UUID, Foreign Key to businesses(user_id)
  transaction_amount: number; // Decimal
  points_earned: number;
  created_at: Date;
};

export type LoyaltyRule = {
  id: string; // UUID
  business_id: string; // UUID, Foreign Key to businesses(user_id)
  rule_type: 'points' | 'tier' | 'milestone' | 'mukando' | 'eco';
  rule_json: Record<string, any>; // JSONB
};

export type Offer = {
  id: string; // UUID
  business_id: string; // UUID, Foreign Key to businesses(user_id)
  offer_name: string;
  description: string;
  points_required: number;
  is_geo_fenced: boolean;
  geo_fence?: any; // PostGIS Geometry(Polygon, 4326)
  active_from: Date;
  active_to: Date;
};

// 3. Mukando & AI Integrations

export type MukandoGroup = {
  id: string; // UUID
  business_id: string; // UUID, Foreign Key to businesses(user_id)
  group_name: string;
  current_payout_user_id: string; // UUID, Foreign Key to customers(user_id)
  total_pot: number; // Decimal
};

export type MukandoContribution = {
  id: string; // UUID
  group_id: string; // UUID, Foreign Key to mukando_groups(id)
  customer_id: string; // UUID, Foreign key to customers(user_id)
  amount: number; // Decimal
  created_at: Date;
};

export type AiInsight = {
  id: string; // UUID
  business_id: string; // UUID, Foreign Key to businesses(user_id)
  insight_type: 'churn_prediction' | 'segmentation' | 'feedback_summary';
  insight_json: Record<string, any>; // JSONB
  created_at: Date;
};

// 4. Security & Logging

export type AuditLog = {
  id: string; // UUID
  user_id: string; // UUID, Foreign Key to users(id)
  action: string;
  details: Record<string, any>; // JSONB
  created_at: Date;
};
