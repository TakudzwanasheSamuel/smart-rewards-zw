## System Architecture

This document outlines the Smart Rewards ZW architecture at a glance. Diagrams are written in Mermaid so they render in GitHub and compatible viewers.

### High-Level Component Diagram
```mermaid
graph TD
  subgraph Client
    A[Web App (Next.js - CSR/SSR)]
  end

  subgraph Server
    B[Next.js API Routes]
    C[Prisma ORM]
    D[AI Flows (Genkit)]
  end

  subgraph Data
    E[(PostgreSQL / Supabase)]
    F[(Object Storage / Public Assets)]
  end

  A <--> B
  B <--> C
  C <--> E
  A --> F
  B <--> D
```

### Deployment / Networking
```mermaid
flowchart LR
  User((User)) -->|HTTPS| Nginx[Nginx Reverse Proxy]
  Nginx -->|HTTP :3000| Next[Next.js App (PM2)]
  Next -->|DB Connection| PG[(PostgreSQL)]
  Next --> Genkit[Genkit Flows]
  subgraph Host
    Nginx
    Next
    PM2[PM2 Process Manager]
  end
```

### Data Flow: Personalized Offers
```mermaid
sequenceDiagram
  participant U as User (Customer)
  participant FE as Next.js Page
  participant API as API Route /api/offers
  participant AI as Genkit Flow (personalized-offers)
  participant DB as PostgreSQL

  U->>FE: Open dashboard
  FE->>API: GET /api/offers (JWT)
  API->>DB: Fetch preferences, history
  API->>AI: Invoke flow with context
  AI->>DB: Read business and offer catalog
  AI-->>API: Ranked offers
  API-->>FE: Offers JSON
  FE-->>U: Render personalized offers
```

### Sequence: QR Scan and Points Award
```mermaid
sequenceDiagram
  participant C as Customer Device
  participant FE as Scan Page (/customer/scan)
  participant API as API Route /api/loyalty/scan
  participant DB as PostgreSQL

  C->>FE: Start camera / upload receipt
  FE->>API: POST scan payload (JWT)
  API->>DB: Validate customer, business
  API->>DB: Create transaction + calculate points (rules)
  DB-->>API: Transaction + points
  API-->>FE: Success + updated wallet
  FE-->>C: Show toast + updated points
```

### End-to-End Journey: Login → Customer Logic → Business Admin
```mermaid
flowchart LR
  %% Swimlanes via subgraphs
  subgraph User
    U1((Customer))
    U2((Business Admin))
  end

  subgraph WebApp[Next.js Web App]
    L[Login Page]
    CD[Customer Dashboard]
    CM[Customer Map & Discovery]
    CB[Customer Badges & Gamification]
    CS[Customer Scan / Upload Receipt]
    CW[Customer Wallet]
    AM[Admin Dashboard]
    AR[Admin Rules & Tiers]
    AO[Admin Offers]
    ARD[Admin Redemption]
    AP[Admin Profile]
  end

  subgraph API[Next.js API Routes]
    AAuth[/auth/login|register|me/]
    AProf[/customers/me|preferences/]
    ADisc[/businesses|businesses/:id|follow/]
    AScan[/loyalty/scan|check-in/]
    ABadges[/customers/me/badges/check/]
    AOffers[/offers/]
    ARules[/admin/rules/]
    AAdminC[/admin/customers/]
    ARedeem[/admin/redemption/]
  end

  subgraph Services
    Gen[Genkit AI Flows\n(personalized-offers, churn, receipt, location)]
    Prisma[Prisma ORM]
  end

  subgraph Data
    DB[(PostgreSQL)]
    OBJ[(Public Assets)]
  end

  %% User → WebApp
  U1 --> L
  U2 --> L

  %% Login Flow
  L -->|POST credentials| AAuth
  AAuth -->|JWT| L
  L --> CD

  %% Customer Side
  CD -->|GET /me| AAuth
  CD -->|GET offers| AOffers
  AOffers --> Gen
  Gen --> DB
  AOffers --> CD

  CD --> CM
  CM -->|GET businesses| ADisc
  ADisc --> DB
  ADisc --> CM

  CD --> CB
  CB -->|POST badges check| ABadges
  ABadges --> DB
  ABadges --> CB

  CD --> CS
  CS -->|POST scan| AScan
  AScan --> DB
  AScan -->|award points| DB
  AScan --> CS

  CD --> CW
  CW -->|GET transactions/wallet| AProf
  AProf --> DB
  AProf --> CW

  %% Admin Side
  CD -.->|role=business| AM
  U2 --> AM
  AM --> AR
  AR -->|CRUD rules| ARules
  ARules --> DB

  AM --> AO
  AO -->|CRUD offers| AOffers
  AOffers --> DB

  AM --> ARD
  ARD -->|POST verify| ARedeem
  ARedeem --> DB

  AM --> AP
  AP -->|GET me| AAuth
  AP --> DB

  %% Shared Infra
  WebApp --> OBJ
  API --> Prisma
  Prisma --> DB
  API --> Gen
```

### Module Breakdown
- Web UI: Next.js App Router, Tailwind, client components with graceful error handling and animations
- API Layer: Next.js route handlers with JWT auth
- Data Layer: Prisma schema and client
- AI: Genkit flows for offers, churn, receipts, location
- Infra: Nginx reverse proxy, PM2, optional Supabase managed Postgres

### Environment Variables (Overview)
- DATABASE_URL, JWT_SECRET, NEXTAUTH_URL, GENKIT_ENV

### Notes
- Build memory on small droplets mitigated via swap and NODE_OPTIONS
- Camera and QR features degrade gracefully on unsupported devices


