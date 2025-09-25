#!/usr/bin/env node
/*
 Cross-platform PostgreSQL restore script.
 - Reads DATABASE_URL from env by default
 - Allows override via --url "postgresql://..."
 - Requires --file <path to .sql>
 - Attempts to create the database if it does not exist
 Requires: psql installed and on PATH
*/

const { execSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function getDbNameFromUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\//, '') || 'database';
  } catch {
    return 'database';
  }
}

function getServerUrlWithoutDb(url) {
  const u = new URL(url);
  // Build URL without database path
  u.pathname = '/postgres';
  return u.toString();
}

function main() {
  const url = parseArg('--url') || process.env.DATABASE_URL;
  const fileArg = parseArg('--file');
  if (!url) {
    console.error('Error: DATABASE_URL not provided. Use env or --url');
    process.exit(1);
  }
  if (!fileArg) {
    console.error('Error: --file <backup.sql> is required');
    process.exit(1);
  }
  const sqlFile = resolve(process.cwd(), fileArg);
  if (!existsSync(sqlFile)) {
    console.error(`Error: Backup file not found: ${sqlFile}`);
    process.exit(1);
  }

  const dbName = getDbNameFromUrl(url);
  const adminUrl = getServerUrlWithoutDb(url);

  try {
    // Try to create the database (ignore error if it exists)
    const createCmd = process.platform === 'win32'
      ? `psql "${adminUrl}" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${dbName}\";"`
      : `psql '${adminUrl}' -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${dbName}\";"`;
    try {
      execSync(createCmd, { stdio: 'inherit' });
    } catch {
      // Database may already exist; continue
    }

    // Restore
    const restoreCmd = process.platform === 'win32'
      ? `psql "${url}" -v ON_ERROR_STOP=1 -f "${sqlFile}"`
      : `psql '${url}' -v ON_ERROR_STOP=1 -f '${sqlFile}'`;
    execSync(restoreCmd, { stdio: 'inherit' });
    console.log('Restore complete.');
  } catch (err) {
    console.error('Restore failed:', err?.message || err);
    process.exit(1);
  }
}

main();


