## Smart Rewards – Setup and Data Migration Guide

Use this guide to set up the project on a new computer, back up the data from your current local PostgreSQL database, and restore it on the new machine. It also covers pushing your code to GitHub.

### 1) Prerequisites
- Node.js 18+ and npm
- Git
- PostgreSQL 14+ (ensure `psql` and `pg_dump` are on PATH)
- Optional: PM2/Nginx for production servers

Verify tools:
```bash
node -v
npm -v
git --version
psql --version
pg_dump --version
```

### 2) Clone the repository
```bash
git clone <your-repo-url> smart-rewards-zw
cd smart-rewards-zw
```

### 3) Environment variables
Create a `.env` file at the project root. See `env.example` for reference.

Required minimum:
```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET="<32+ chars secret>"
NEXTAUTH_URL="http://localhost:3000"
GENKIT_ENV="prod"
```

For local development (example):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_rewards"
```

### 4) Install dependencies and prepare the database
```bash
npm ci
npx prisma generate
npx prisma db push
```

This creates/updates tables in your local database using the Prisma schema.

### 5) Back up data from the current machine
On the source machine (where the data currently lives), run:
```bash
npm run db:backup
```

This will:
- Read `DATABASE_URL` from your environment
- Create a `backups/` directory if missing
- Generate a timestamped SQL dump like `backups/smart_rewards_YYYYMMDD_HHMMSS.sql`

If you need to specify a different database URL explicitly:
```bash
npm run db:backup -- --url "postgresql://user:pass@host:5432/dbname"
```

Copy the produced SQL file (in `backups/`) to the target machine (USB, SCP, etc.).

Alternatively, export as JSON via Prisma (useful when schemas match and you want a portable dataset):
```bash
npm run data:export
```

This will create a file like `backups/data-export-YYYYMMDD_HHMMSS.json`.
In this repo, an export has already been committed for convenience:
`backups/data-export-20250925_172758.json`.

### 6) Set up the project on the new machine
On the target machine:
```bash
git clone <your-repo-url> smart-rewards-zw
cd smart-rewards-zw
npm ci
```

Create `.env` and set the target `DATABASE_URL` for the new machine, then prepare the schema:
```bash
npx prisma generate
npx prisma db push
```

### 7) Restore the data on the new machine
Place your backup file under `backups/` locally (e.g., `backups/smart_rewards_20250101_120000.sql`). Then run:
```bash
npm run db:restore -- --file backups/smart_rewards_20250101_120000.sql
```

If you need to restore to a different DB URL explicitly:
```bash
npm run db:restore -- --file backups/backup.sql --url "postgresql://user:pass@host:5432/dbname"
```

JSON import with Prisma (clears data by default; add `--append` to keep existing and add). You can use the committed export directly:
```bash
npm run data:import -- --file backups/data-export-20250925_172758.json
# Or append without clearing existing rows
npm run data:import -- --file backups/data-export-20250925_172758.json --append
```

Notes:
- The restore script will attempt to create the database if it doesn’t exist.
- Ensure the target `DATABASE_URL` user has privileges to create databases.

### 8) Verify
After restore:
```bash
psql "${DATABASE_URL}" -c "\dt"
```
You should see your application tables. Optionally run the app:
```bash
npm run dev
```

### 9) Push code to GitHub
From your working directory:
```bash
git status
git add -A
git commit -m "chore: add setup and backup/restore scripts"
git push origin main
```

### 10) Troubleshooting
- Command not found: ensure `psql` and `pg_dump` are in your PATH. On Windows, add the PostgreSQL `bin` folder (e.g., `C:\Program Files\PostgreSQL\15\bin`) to the PATH.
- Authentication errors: confirm `DATABASE_URL` credentials; you can test with `psql "${DATABASE_URL}" -c "SELECT 1;"`.
- Restore into a fresh DB: if you want a clean DB, drop and recreate, then run the restore.

### 11) Keeping backups out of Git
Do not commit `backups/` to Git. Add this to your `.gitignore` if not present:
```gitignore
backups/
*.dump
*.sql
```


