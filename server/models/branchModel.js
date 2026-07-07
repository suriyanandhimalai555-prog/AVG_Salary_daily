import { query } from '../config/db.js';

export const setupBranchDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await query(createTableQuery);
    console.log('Branches database table verified/created.');
  } catch (error) {
    console.error('Error setting up branches table:', error);
  }
};

export const getAllBranchesFromDB = async () => {
  const { rows } = await query('SELECT * FROM branches ORDER BY created_at DESC');
  return rows;
};

export const checkBranchExists = async (name) => {
  const { rows } = await query('SELECT * FROM branches WHERE LOWER(name) = LOWER($1)', [name]);
  return rows.length > 0;
};

export const checkBranchExistsForOther = async (id, name) => {
  const { rows } = await query('SELECT * FROM branches WHERE id != $1 AND LOWER(name) = LOWER($2)', [id, name]);
  return rows.length > 0;
};

export const insertBranch = async (name) => {
  const { rows } = await query('INSERT INTO branches (name) VALUES ($1) RETURNING *', [name]);
  return rows[0];
};

export const updateBranchInDB = async (id, name) => {
  const { rows } = await query('UPDATE branches SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  return rows[0];
};

export const deleteBranchFromDB = async (id) => {
  await query('DELETE FROM branches WHERE id = $1', [id]);
};