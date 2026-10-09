import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

// Neon DB requires SSL mode
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('[Neon PostgreSQL] Connected to database successfully.');
});

pool.on('error', (err) => {
  console.error('[Neon PostgreSQL] Unexpected connection pool error:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
