#!/usr/bin/env node
/*
 Cross-platform PostgreSQL backup script.
 - Reads DATABASE_URL from env by default
 - Allows override via --url "postgresql://..."
 - Outputs backups/<dbname>_YYYYMMDD_HHMMSS.sql
 Requires: pg_dump installed and on PATH
*/

const { execSync } = require('node:child_process');
const { mkdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + '_' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function getDbNameFromUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, '') || 'database';
  } catch {
    return 'database';
  }
}

function main() {
  const url = parseArg('--url') || process.env.DATABASE_URL;
  if (!url) {
    console.error('Error: DATABASE_URL not provided. Use env or --url');
    process.exit(1);
  }

  const outDir = join(process.cwd(), 'backups');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const dbName = getDbNameFromUrl(url);
  const outFile = join(outDir, `${dbName}_${nowStamp()}.sql`);

  const env = { ...process.env, PGPASSWORD: undefined };
  // Let pg_dump read password embedded in URL

  const cmd = process.platform === 'win32'
    ? `pg_dump --no-owner --no-privileges --format=p --dbname="${url}" --file="${outFile}"`
    : `pg_dump --no-owner --no-privileges --format=p --dbname='${url}' --file='${outFile}'`;

  try {
    execSync(cmd, { stdio: 'inherit', env });
    console.log(`Backup complete: ${outFile}`);
  } catch (err) {
    console.error('Backup failed:', err?.message || err);
    process.exit(1);
  }
}

main();


