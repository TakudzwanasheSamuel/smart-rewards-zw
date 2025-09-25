#!/usr/bin/env node
/*
 Import JSON into the database using Prisma.
 - Reads backups/<file>.json and inserts into tables in safe order
 - Clears existing data (truncate) before import unless --append is provided
 - Best-effort order: respects implicit dependencies by truncating all and inserting
*/

const { PrismaClient, Prisma } = require('@prisma/client');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function toDelegateName(modelName) {
  const lower = modelName.slice(0, 1).toLowerCase() + modelName.slice(1);
  return lower;
}

async function truncateAll(prisma, models) {
  // Disable referential checks; Prisma doesn't support FK disable, so we delete in reverse order
  for (const modelName of models.slice().reverse()) {
    const delegate = prisma[toDelegateName(modelName)];
    if (!delegate || typeof delegate.deleteMany !== 'function') continue;
    await delegate.deleteMany();
    console.log(`Cleared ${modelName}`);
  }
}

async function main() {
  const fileArg = parseArg('--file');
  const append = process.argv.includes('--append');
  if (!fileArg) {
    console.error('Error: --file backups/<export>.json is required');
    process.exit(1);
  }
  const filePath = resolve(process.cwd(), fileArg);
  const raw = readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  const prisma = new PrismaClient();
  try {
    const models = Prisma.dmmf.datamodel.models.map((m) => m.name);

    if (!append) {
      await truncateAll(prisma, models);
    }

    // Insert in model order
    for (const modelName of models) {
      const rows = json[modelName];
      if (!rows || rows.length === 0) continue;
      const delegate = prisma[toDelegateName(modelName)];
      if (!delegate || !delegate.createMany) continue;
      // createMany ignores duplicates by default with skipDuplicates: true
      await delegate.createMany({ data: rows, skipDuplicates: true });
      console.log(`Imported ${rows.length} rows into ${modelName}`);
    }

    console.log('\nJSON import complete.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});


