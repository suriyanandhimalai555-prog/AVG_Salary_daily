// import pg from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const { Pool } = pg;

// // Connect using individual credential keys
// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'avg_salary',
//   password: process.env.DB_PASSWORD || 'password', // Note: pg uses 'password', not 'DB_PASS'
//   port: process.env.DB_PORT || 5432,
// });

// pool.on('connect', () => {
//   console.log('PostgreSQL database connected successfully via credential keys');
// });

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle PostgreSQL client', err);
//   process.exit(-1);
// });

// export const query = (text, params) => pool.query(text, params);
// export default pool;


import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 1. Prioritize the public connection string, fallback to a local URI if missing
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/avg_salary';

const pool = new Pool({
  connectionString: connectionString,
  // 2. CRITICAL FOR PRODUCTION: Cloud databases (like Railway) require SSL encryption
  ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') 
    ? false 
    : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('PostgreSQL database connected successfully via Connection URL String! 🚀');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;