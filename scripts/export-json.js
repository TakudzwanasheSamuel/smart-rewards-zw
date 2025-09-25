#!/usr/bin/env node
/*
 Export all Prisma models to a single JSON file.
 - Reads DATABASE_URL from env
 - Outputs backups/data-export-YYYYMMDD_HHMMSS.json
*/

const { PrismaClient, Prisma } = require('@prisma/client');
const { mkdirSync, existsSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

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

function toDelegateName(modelName) {
  const lower = modelName.slice(0, 1).toLowerCase() + modelName.slice(1);
  return lower;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const models = Prisma.dmmf.datamodel.models.map((m) => m.name);
    const data = {};

    for (const modelName of models) {
      const delegate = prisma[toDelegateName(modelName)];
      if (!delegate || typeof delegate.findMany !== 'function') continue;
      const rows = await delegate.findMany();
      data[modelName] = rows;
      console.log(`Exported ${rows.length} rows from ${modelName}`);
    }

    const outDir = join(process.cwd(), 'backups');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, `data-export-${nowStamp()}.json`);
    writeFileSync(outFile, JSON.stringify(data, null, 2));
    console.log(`\nJSON export complete: ${outFile}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Export failed:', e);
  process.exit(1);
});


