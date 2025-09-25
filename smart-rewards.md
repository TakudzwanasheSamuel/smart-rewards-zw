## Smart Rewards ZW – System Overview and Technical Guide

### 1) Executive Summary
Smart Rewards ZW is a multi-tenant loyalty platform that unifies Zimbabwean businesses and customers in one ecosystem. It blends traditional points, Mukando (group savings), badges/gamification, and geo-aware offers with AI intelligence for personalization and churn reduction. The system is built on Next.js (App Router) with API routes, Prisma ORM, and PostgreSQL (self-hosted or Supabase). Nginx and PM2 are used in droplet deployments; Vercel/Supabase are also supported.

Outcomes:
- Increase retention and visit frequency via personalized, timely offers
- Reduce fraud with geo-verification and robust redemption logic
- Unlock community-driven value using Mukando (join, contribute, payout cycles)
- Provide business owners with insights (churn risk, engagement) and tools (rules, offers, redemptions)

---

### 2) Primary User Roles
- Customer: discovers businesses, checks in, earns points, receives offers, participates in Mukando, collects badges
- Business Admin: configures rules/tiers, creates offers, verifies redemptions, views AI insights (e.g., churn), manages Mukando settings

---

### 3) Core Functionalities

3.1 Authentication & Sessions
- JWT-based auth via API routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Client stores token securely; API validates per request
- Role-driven UI gates admin vs customer features

3.2 Loyalty Engine (Points & Tiers)
- Transaction-driven points awarding (QR scan or receipt upload)
- Tiering (e.g., Bronze/Silver/Gold) via rules configured by admins
- Supports Eco-Points or specialized point categories

3.3 Mukando (Group Savings)
- Create/join groups, contribute periodically, and manage payout cycles
- Data stores: `mukando_groups`, `mukando_contributions`
- Business value: community retention and recurring engagement

3.4 Offers (Standard & Geo-fenced)
- Admins create and schedule offers with eligibility rules
- Geo-fenced offers constrained by store polygons (location intelligence)
- Personalized ranking for customers via AI flows

3.5 Badges & Gamification
- Badge definitions (criteria) and awarding logic
- Customer badge checks on demand and after key events (transactions, visits)
- Motivates ongoing engagement and social proof

3.6 Redemption & Verification
- Admin verifies redemption codes; backend validates ownership, status, expiry, business match
- Extensive error handling for invalid/used/expired codes
- Audit logging for manual actions

3.7 Discovery & Map
- Customers browse businesses and follow favorites
- Map view highlights nearby offers (with consent and location permissions)

3.8 Wallet & Profile
- Wallet shows balances, recent transactions, badges, and tiers
- Profile preferences feed AI personalization

---

### 4) AI Intelligence

4.1 Personalized Offers (Genkit)
- Flow: `personalized-offers`
- Inputs: profile/preferences, history (RFM), location context, active offers
- Output: ranked offers list with reason codes (e.g., nearby, matched interests)

4.2 Churn Prediction (Genkit)
- Flow: `predict-churn`
- Inputs: recency/frequency/monetary, redemptions, offer interactions, seasonality
- Output: risk score per customer (Low/Med/High) + recommended actions
- Stored in `ai_insights` for dashboard visualization and targeting

4.3 Receipt Processing (Genkit)
- Flow: `process-receipt`
- Extracts line items, totals; standardizes merchant fields
- Feeds transaction/points pipeline

4.4 Location Verification (Genkit)
- Flow: `verify-location`
- Validates inside polygon, optional dwell-time heuristics
- Used to unlock check-ins and geo-fenced offers; reduces spoofing

4.5 Feedback Summarization (Genkit)
- Flow: `summarize-feedback`
- Summarizes qualitative feedback to actionable insights for admins

---

### 5) Location Intelligence
- Business polygons define geo-fences for offers and check-ins
- Client sends opt-in location; flow validates within tolerance
- Fallbacks: upload receipt or QR if device lacks camera/GPS
- Analytics: proximity conversion, catchment areas, peak times (future)

5.a) PostGIS in Practice (How to explain it)
- What it is: PostGIS is a spatial extension to PostgreSQL that lets us store and query geographic data (points, lines, polygons) efficiently.
- Why we use it: We need precise, fast geo queries to unlock geo‑fenced offers and in‑store check‑ins while preventing spoofing.
- What we store:
  - Store locations as `geometry(Point, 4326)` (WGS84 lat/long)
  - Store store‑footprints/geo‑fences as `geometry(Polygon, 4326)`
- Key functions we rely on:
  - `ST_Contains(geom_polygon, geom_point)`: Is the user inside the store polygon?
  - `ST_DWithin(geom_a, geom_b, meters)`: Is the user within X meters of the store?
  - `ST_Distance(geom_a, geom_b)`: How far is the user?
  - `ST_MakePoint(long, lat)` and `ST_SetSRID(..., 4326)`: Build a lat/long point
- Indexing: Create `GIST` indexes on geometry columns (critical for performance at scale).
- Accuracy: Use SRID 4326 consistently; for meters-based distances, cast to `geography` or use appropriate transforms.

Sample enablement and schema:
```sql
-- Enable PostGIS once per database
CREATE EXTENSION IF NOT EXISTS postgis;

-- Business locations and store polygons
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS store_polygon geometry(Polygon, 4326);

-- Indexes for fast spatial queries
CREATE INDEX IF NOT EXISTS business_location_gix ON "Business" USING GIST (location);
CREATE INDEX IF NOT EXISTS business_polygon_gix ON "Business" USING GIST (store_polygon);
```

Sample proximity search (nearby businesses):
```sql
-- Find businesses within 1km of a given lat/long
WITH params AS (
  SELECT ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography AS user_geo
)
SELECT b.id, b.name
FROM "Business" b, params p
WHERE b.location IS NOT NULL
  AND ST_DWithin(b.location::geography, p.user_geo, 1000)
ORDER BY ST_Distance(b.location::geography, p.user_geo) ASC
LIMIT 50;
```

Sample geo‑fence check (in‑store verification):
```sql
-- Verify user is inside the store polygon
WITH params AS (
  SELECT ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS user_point
)
SELECT b.id, b.name
FROM "Business" b, params p
WHERE b.store_polygon IS NOT NULL
  AND ST_Contains(b.store_polygon, p.user_point);
```

Talking points for non-technical stakeholders:
- “We use a map-aware database so we can tell if a customer is actually at your store when an offer is redeemed.”
- “It lets us show nearby deals instantly and fairly, even across many locations.”
- “It reduces fraud because redemptions can be limited to customers physically inside your geo‑fence.”

---

### 6) Technical Architecture
- Web: Next.js (App Router), Tailwind CSS, client/server components
- API: Next.js Route Handlers in `src/app/api/**`
- Data: Prisma ORM + PostgreSQL; schemas in `prisma/schema.prisma`, application models in `src/lib/db/schema.ts`
- AI: Genkit flows in `src/ai/flows/**`
- Infra: Nginx (reverse proxy), PM2 (process manager), optional Vercel deployment
- Assets: `public/` for logos/images (e.g., `/smart-rewards-zw.png`)

Key Pages/Routes (non-exhaustive):
- Customer: `/customer/dashboard`, `/customer/map`, `/customer/badges`, `/customer/scan`, `/customer/wallet`
- Admin: `/admin/dashboard`, `/admin/rules`, `/admin/offers`, `/admin/redemption`, `/admin/profile`
- API: `/api/auth/*`, `/api/customers/*`, `/api/businesses/*`, `/api/loyalty/*`, `/api/admin/*`

---

### 7) Data Model (Representative)
- Users: auth identity, role (customer/business)
- Customers: profile, preferences, loyalty_points, eco_points, tier
- Businesses: category, location (PostGIS point), shared loyalty networks (optional)
- CustomerBusinessRelations: follows
- Transactions: amount, points_earned, timestamps
- LoyaltyRules: business rules JSON (points multipliers, tiers, milestones, Mukando)
- Offers: business offers, timing, is_geo_fenced, polygon (optional)
- Badges & CustomerBadges: definitions and awards
- MukandoGroups & MukandoContributions: group-saving structures
- AI_Insights: churn scores, reasons, recommended actions
- AuditLogs: trace admin actions and redemptions

---

### 8) Security & Compliance
- JWT-based authentication; sensitive routes require valid token
- Least-privilege checks for admin-only APIs
- HTTPS via Nginx + Let’s Encrypt (droplet) or platform SSL (Vercel)
- Data at rest: Postgres-managed encryption; consider TDE or KMS for cloud
- PII minimization; logs redact secrets; audit trail for sensitive operations

---

### 9) Error Handling & Resilience
- UI: user-friendly toasts, ErrorBoundaries on critical pages
- Camera/location fallbacks (upload receipt, manual entry) when unsupported
- API: granular status codes and message mapping (403/404/422)
- Build-time constraints: memory-tuned builds (swap, `NODE_OPTIONS`)

---

### 10) Deployment Options
- Droplet: Node.js + PM2 + Nginx + PostgreSQL
  - Use swap for low-RAM builds; `NODE_OPTIONS=--max-old-space-size=2048` for Next.js build
  - Prisma generate on postinstall; environment via `.env`
- Vercel + Supabase: serverless-friendly with pooled connections

---

### 11) Observability & Ops (Recommended)
- Logging: structured logs in API routes; centralize via syslog/ELK
- Metrics: request rates, latency, error rates, redemption success
- Alerts: auth failures spike, 5xx on critical APIs, DB connectivity

---

### 12) Roadmap Ideas
- Push notifications for proximity deals
- Advanced fraud detection (device fingerprinting, anomaly scoring)
- Deeper analytics (LTV, cohort retention by segment)
- Partner APIs for payment integration and POS connectors
- Multi-currency handling and FX exposure for USD/ZWL

---

### 13) How to Explain to Stakeholders
- Customers: “Earn and redeem seamlessly across many businesses; join Mukando, collect badges, and get offers that actually match your needs and location.”
- Businesses: “Configure your loyalty logic, run geo-fenced and targeted campaigns, reduce fraud via location checks, and proactively retain at‑risk customers with AI-driven insights.”

---

### 14) References (in repo)
- Architecture diagrams: `docs/architecture.md`
- AI flows: `src/ai/flows/*`
- API routes: `src/app/api/*`
- Key pages: `src/app/(authenticated)/**`
- Prisma schema: `prisma/schema.prisma`


