import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const setupDatabase = async () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createUserTableQuery);
    
    // Seed default profiles if table is brand new and empty
    const { rows } = await query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      const adminPassword = await bcrypt.hash('123456', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      await query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3), ($4, $5, $6)',
        ['admin@gmail.com', adminPassword, 'admin', 'user@gmail.com', userPassword, 'user']
      );
      console.log('Database seeded with standard accounts.');
    }
  } catch (error) {
    console.error('Error executing database setup scripts:', error);
  }
};

export const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const createUser = async (email, hashedPassword, role = 'user') => {
  const { rows } = await query(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
    [email, hashedPassword, role]
  );
  return rows[0];
};