# Backend Structure & AI Agent Instructions for Smart Rewards ZW

This document outlines the backend architecture required to transform the Smart Rewards ZW prototype into a full-stack Next.js application. It provides a roadmap for building the necessary API endpoints and includes instructions for an AI agent to generate the required code.

## 1. Core Technologies

- **Framework**: Next.js (App Router for API Routes)
- **Database**: PostgreSQL with the PostGIS extension for geospatial features.
- **ORM**: Prisma (for type-safe database access and schema management).
- **Authentication**: NextAuth.js or a similar JWT-based solution.
- **AI Integration**: Genkit (retaining all existing flows).

## 2. Current State vs. Required State

- **Current State**: We have a comprehensive frontend prototype built with Next.js and ShadCN UI. We also have several server-side Genkit flows for AI-powered features like offer personalization, churn prediction, receipt processing, and location verification.
- **Required State**: We need to build a complete set of RESTful API endpoints to handle all business logic, including user authentication, data persistence, and interactions between customers and businesses. The frontend will be refactored to call these APIs instead of using mock data.

## 3. Database Schema (PostgreSQL)

This is the target schema that supports all implemented features.

```sql
-- 1. User & Business Management

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "user_type" TEXT CHECK ("user_type" IN ('customer', 'business')) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "customers" (
  "user_id" UUID PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "full_name" VARCHAR(255),
  "interests" TEXT[],
  "loyalty_points" INTEGER DEFAULT 0,
  "eco_points" INTEGER DEFAULT 0,
  "loyalty_tier" VARCHAR(50) DEFAULT 'Bronze',
  "referral_code" VARCHAR(50) UNIQUE,
  "referred_by" UUID REFERENCES "users"("id"),
  "has_premium_subscription" BOOLEAN DEFAULT false,
  "subscription_expiry_date" TIMESTAMPTZ
);

CREATE TABLE "businesses" (
  "user_id" UUID PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "business_name" VARCHAR(255) NOT NULL,
  "business_category" VARCHAR(50),
  "logo_url" VARCHAR(255),
  "contact_phone" VARCHAR(50),
  "location" GEOMETRY(Point, 4326),
  "shared_loyalty_id" UUID
);

-- Relation table for followers
CREATE TABLE "customer_business_relations" (
  "customer_id" UUID REFERENCES "customers"("user_id") ON DELETE CASCADE,
  "business_id" UUID REFERENCES "businesses"("user_id") ON DELETE CASCADE,
  PRIMARY KEY ("customer_id", "business_id")
);

-- 2. Loyalty Engine & Transaction Logic

CREATE TABLE "transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "customers"("user_id"),
  "business_id" UUID NOT NULL REFERENCES "businesses"("user_id"),
  "transaction_amount" DECIMAL(10, 2),
  "points_earned" INTEGER,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "loyalty_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "businesses"("user_id"),
  "rule_type" TEXT CHECK ("rule_type" IN ('points', 'tier', 'milestone', 'mukando', 'eco')) NOT NULL,
  "rule_json" JSONB NOT NULL
);

CREATE TABLE "offers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "businesses"("user_id"),
  "offer_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "points_required" INTEGER,
  "is_geo_fenced" BOOLEAN DEFAULT false,
  "geo_fence" GEOMETRY(Polygon, 4326),
  "active_from" TIMESTAMPTZ,
  "active_to" TIMESTAMPTZ,
  "reward_type" VARCHAR(50) DEFAULT 'monetary', -- 'monetary' or 'experiential'
  "is_coupon" BOOLEAN DEFAULT false,
  "discount_code" VARCHAR(50)
);

-- 3. Mukando, Gamification & AI

CREATE TABLE "mukando_groups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "businesses"("user_id"),
  "group_name" VARCHAR(255) NOT NULL,
  "current_payout_user_id" UUID REFERENCES "customers"("user_id"),
  "total_pot" DECIMAL(10, 2) DEFAULT 0
);

CREATE TABLE "mukando_contributions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL REFERENCES "mukando_groups"("id"),
  "customer_id" UUID NOT NULL REFERENCES "customers"("user_id"),
  "amount" DECIMAL(10, 2),
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "challenges" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "challenge_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(50), -- e.g., 'visits', 'purchases'
  "goal" INTEGER,
  "reward_points" INTEGER
);

CREATE TABLE "customer_challenges" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL REFERENCES "customers"("user_id"),
  "challenge_id" UUID NOT NULL REFERENCES "challenges"("id"),
  "current_progress" INTEGER DEFAULT 0,
  "is_completed" BOOLEAN DEFAULT false
);

CREATE TABLE "ai_insights" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "businesses"("user_id"),
  "insight_type" TEXT CHECK ("insight_type" IN ('churn_prediction', 'segmentation', 'feedback_summary')),
  "insight_json" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 4. Security & Logging

CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "action" TEXT NOT NULL,
  "details" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
```

## 4. AI Agent Instructions: Building the Backend

**Objective**: Create the complete backend structure for the Smart Rewards ZW application using Next.js API Routes and Prisma.

### Step-by-Step Instructions:

1.  **Project Setup**:
    *   Initialize Prisma in the project: `npx prisma init`.
    *   Configure Prisma to connect to a PostgreSQL database by setting the `DATABASE_URL` in the `.env` file.
    *   Copy the SQL schema above into `prisma/schema.prisma`, converting it to Prisma schema syntax.
    *   Generate the Prisma Client: `npx prisma generate`.

2.  **Authentication (`/api/auth`)**:
    *   Implement user registration (`/api/auth/register`): Handle both 'customer' and 'business' user types. Hash passwords before saving to the `users` table. Create corresponding entries in `customers` or `businesses` tables.
    *   Implement user login (`/api/auth/login`): Validate credentials, and if successful, return a JWT.
    *   Implement session management (`/api/auth/me`): An endpoint that verifies a JWT and returns the current user's data.

3.  **Customer API Routes (`/api/customers`)**:
    *   **`GET /api/customers/me`**: Get the logged-in customer's complete profile, including points, tier, and wallet info.
    *   **`PUT /api/customers/me/preferences`**: Update the `interests` for the logged-in customer.
    *   **`GET /api/businesses`**: Fetch a list of all businesses. Implement filters for category and sorting by distance (using PostGIS).
    *   **`GET /api/businesses/:id`**: Fetch a single business's public profile.
    *   **`POST /api/businesses/:id/follow`**: Create an entry in the `customer_business_relations` table.
    *   **`DELETE /api/businesses/:id/follow`**: Remove an entry from `customer_business_relations`.

4.  **Loyalty & Transactions API Routes (`/api/loyalty`)**:
    *   **`POST /api/loyalty/scan`**: Endpoint to receive QR code data. It should validate the data, calculate points based on `loyalty_rules`, and create a `transactions` record. This is where you can call the `processReceipt` Genkit flow for receipt uploads.
    *   **`POST /api/loyalty/check-in`**: Endpoint to receive GPS coordinates. It should call the `verifyLocation` Genkit flow. If successful, award points and create a transaction record.

5.  **Business Admin API Routes (`/api/admin`)**:
    *   All these routes must be protected and accessible only to 'business' user types.
    *   **`GET /api/admin/customers`**: Fetch a list of all customers who follow the logged-in business.
    *   **`GET /api/admin/customers/:id`**: Get a specific customer's profile and transaction history with the business.
    *   **`POST /api/admin/customers/:id/points`**: Manually adjust `loyalty_points` or `eco_points` for a customer. Create an `audit_logs` entry.
    *   **`GET /api/admin/rules`**: Fetch the loyalty rules for the business.
    *   **`POST /api/admin/rules`**: Create or update loyalty rules.
    *   **`POST /api/admin/offers`**: Create a new offer.
    *   **`GET /api/admin/mukando`**: Fetch all Mukando groups for the business.
    *   **`POST /api/admin/mukando`**: Create a new Mukando group.

6.  **Refactor Frontend**:
    *   Replace all mock data and direct Genkit calls in the frontend components with `fetch` calls to the newly created API endpoints.
    *   Implement a global state or context for managing user authentication status.
    *   Ensure all data-driven pages (dashboards, lists, profiles) fetch their data from the backend.
