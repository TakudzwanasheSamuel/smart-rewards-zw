# Backend Setup Guide for Smart Rewards ZW

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v13 or higher)
3. **PostGIS extension** for PostgreSQL

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE smart_rewards_zw;
```

### 2. Enable PostGIS Extension

```sql
\c smart_rewards_zw;
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_rewards_zw?schema=public"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Google AI API Key (for Genkit AI features)
GOOGLE_API_KEY="your-google-api-key-here"

# Next.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Database Migrations

```bash
npx prisma db push
```

### 4. Optional: Run Database Setup Script

```bash
psql -d smart_rewards_zw -f scripts/setup-database.sql
```

## Running the Application

### 1. Development Mode (Frontend + API)

```bash
npm run dev
```

The application will be available at `http://localhost:9002`

### 2. AI Development (Genkit Flows)

```bash
npm run genkit:dev
```

The Genkit developer UI will be available at `http://localhost:4000`

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Customer APIs
- `GET /api/customers/me` - Get customer profile
- `PUT /api/customers/me/preferences` - Update customer preferences
- `GET /api/businesses` - List businesses (with location filtering)
- `GET /api/businesses/:id` - Get business details
- `POST /api/businesses/:id/follow` - Follow a business
- `DELETE /api/businesses/:id/follow` - Unfollow a business

### Loyalty System
- `POST /api/loyalty/scan` - Process QR code scan/receipt
- `POST /api/loyalty/check-in` - Location-based check-in

### Admin APIs (Business Users)
- `GET /api/admin/customers` - List business customers
- `GET /api/admin/customers/:id` - Get customer details
- `POST /api/admin/customers/:id/points` - Adjust customer points
- `GET /api/admin/rules` - Get loyalty rules
- `POST /api/admin/rules` - Create loyalty rules
- `GET /api/admin/offers` - Get business offers
- `POST /api/admin/offers` - Create offers
- `GET /api/admin/mukando` - Get Mukando groups
- `POST /api/admin/mukando` - Create Mukando groups

### Public APIs
- `GET /api/offers` - Get public offers (with location filtering)

## AI Features (Genkit Flows)

The application includes several AI-powered features:

1. **Personalized Offers** - `getPersonalizedOffers`
2. **Churn Prediction** - `predictChurn`
3. **Receipt Processing** - `processReceipt`
4. **Location Verification** - `verifyLocation`
5. **Feedback Summarization** - `summarizeFeedback`

## Database Schema

The database includes these main entities:

- **Users** - Base user accounts
- **Customers** - Customer profiles with loyalty data
- **Businesses** - Business profiles with location data
- **Transactions** - Loyalty transactions and point history
- **Offers** - Business offers and promotions
- **LoyaltyRules** - Configurable loyalty program rules
- **MukandoGroups** - Traditional savings groups
- **AiInsights** - AI-generated business insights

## Testing the APIs

You can test the APIs using tools like:

- **Postman** or **Insomnia** for REST API testing
- **curl** commands
- The frontend application itself

### Example API Call

```bash
# Register a new customer
curl -X POST http://localhost:9002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "user_type": "customer",
    "full_name": "John Doe"
  }'

# Login
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists and user has permissions

2. **PostGIS Extension Missing**
   - Install PostGIS: `sudo apt-get install postgresql-postgis` (Ubuntu)
   - Enable in database: `CREATE EXTENSION postgis;`

3. **Prisma Client Issues**
   - Regenerate client: `npx prisma generate`
   - Reset database: `npx prisma db push --force-reset`

4. **AI Features Not Working**
   - Verify GOOGLE_API_KEY in .env file
   - Check Google AI API quotas and permissions

## Production Deployment

For production deployment, consider:

1. **Environment Variables** - Use secure environment variable management
2. **Database Migrations** - Use `npx prisma migrate deploy`
3. **SSL/TLS** - Enable HTTPS
4. **Load Balancing** - Consider multiple API instances
5. **Monitoring** - Add application monitoring and logging
6. **Backup** - Set up regular database backups

## Support

For issues or questions:
1. Check the development logs in `development_logs.md`
2. Review the API documentation
3. Test with the provided frontend application
