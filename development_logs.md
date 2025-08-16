# Development Logs

This document logs the development work done on the Smart Rewards ZW backend.

## Backend Implementation

I have created the complete backend structure for the Smart Rewards ZW application using Next.js API Routes and Prisma.

### Project Setup
- Initialized Prisma in the project.
- Configured Prisma to connect to a PostgreSQL database by setting the `DATABASE_URL` in the `.env` file.
- Converted the SQL schema from `backend_structure.md` to Prisma schema syntax and created the `prisma/schema.prisma` file.
- Generated the Prisma Client.

### Authentication (`/api/auth`)
- Implemented user registration (`/api/auth/register`): Handles both 'customer' and 'business' user types. Hashes passwords before saving to the `users` table. Creates corresponding entries in `customers` or `businesses` tables.
- Implemented user login (`/api/auth/login`): Validates credentials, and if successful, returns a JWT.
- Implemented session management (`/api/auth/me`): An endpoint that verifies a JWT and returns the current user's data.

### Customer API Routes (`/api/customers`)
- `GET /api/customers/me`: Get the logged-in customer's complete profile, including points, tier, and wallet info.
- `PUT /api/customers/me/preferences`: Update the interests for the logged-in customer.
- `GET /api/businesses`: Fetch a list of all businesses. Implemented filters for category.
- `GET /api/businesses/:id`: Fetch a single business's public profile.
- `POST /api/businesses/:id/follow`: Create an entry in the `customer_business_relations` table.
- `DELETE /api/businesses/:id/follow`: Remove an entry from `customer_business_relations`.

### Loyalty & Transactions API Routes (`/api/loyalty`)
- `POST /api/loyalty/scan`: Endpoint to receive QR code data. It validates the data, calculates points based on `loyalty_rules`, and creates a `transactions` record.
- `POST /api/loyalty/check-in`: Endpoint to receive GPS coordinates. It awards points and creates a transaction record.

### Business Admin API Routes (`/api/admin`)
- All routes are protected and accessible only to 'business' user types using middleware.
- `GET /api/admin/customers`: Fetch a list of all customers who follow the logged-in business.
- `GET /api/admin/customers/:id`: Get a specific customer's profile and transaction history with the business.
- `POST /api/admin/customers/:id/points`: Manually adjust `loyalty_points` or `eco_points` for a customer. Creates an `audit_logs` entry.
- `GET /api/admin/rules`: Fetch the loyalty rules for the business.
- `POST /api/admin/rules`: Create or update loyalty rules.
- `POST /api/admin/offers`: Create a new offer.
- `GET /api/admin/mukando`: Fetch all Mukando groups for the business.
- `POST /api/admin/mukando`: Create a new Mukando group.

### Skipped Items
- Frontend refactoring was not part of this task.
- No tests were created for the endpoints.

### Updates
- Integrated Genkit flows for receipt processing and location verification.
- Implemented PostGIS-based distance sorting for businesses.
