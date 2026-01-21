/**
 * Sync Drizzle schema to production database
 * 
 * Usage: Set PRODUCTION_DATABASE_URL environment variable and run:
 *   npx tsx scripts/sync-production-schema.ts
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../shared/schema';

const PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;

if (!PRODUCTION_DATABASE_URL) {
  console.error('Error: PRODUCTION_DATABASE_URL environment variable is required');
  process.exit(1);
}

// Disable SSL certificate validation for DigitalOcean managed database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function syncSchema() {
  console.log('Connecting to production database...');
  
  const sql = neon(PRODUCTION_DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  console.log('Schema sync requires running drizzle-kit push against your production database.');
  console.log('\nTo sync your schema to production, run:');
  console.log('');
  console.log('DATABASE_URL="' + PRODUCTION_DATABASE_URL + '" npm run db:push');
  console.log('');
  console.log('This will create all missing tables in your production database.');
}

syncSchema();
