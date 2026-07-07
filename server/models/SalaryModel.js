import pool from '../config/db.js'; // Adjust path to your db pool configuration

export const setupSalaryDatabase = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS salaries (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER NOT NULL, -- Assumes your SQL Branch table uses an Integer ID
      employee_name VARCHAR(255) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      bank_name VARCHAR(255) NOT NULL,
      account_number VARCHAR(255) NOT NULL,
      ifsc_code VARCHAR(255) NOT NULL,
      entry_date DATE NOT NULL,
      renewal NUMERIC(12, 2) DEFAULT 0,
      new_amount NUMERIC(12, 2) DEFAULT 0,
      gold_coin NUMERIC(12, 2) DEFAULT 0,
      gvcn NUMERIC(12, 2) DEFAULT 0,
      lss NUMERIC(12, 2) DEFAULT 0,
      gvcr NUMERIC(12, 2) DEFAULT 0,
      trade NUMERIC(12, 2) DEFAULT 0,
      land NUMERIC(12, 2) DEFAULT 0,
      builders NUMERIC(12, 2) DEFAULT 0,
      total_efgh NUMERIC(12, 2) DEFAULT 0,
      renewal_15 NUMERIC(12, 2) DEFAULT 0,
      new_20 NUMERIC(12, 2) DEFAULT 0,
      salary NUMERIC(12, 2) DEFAULT 0,
      land_payout NUMERIC(12, 2) DEFAULT 0,
      commissions NUMERIC(12, 2) DEFAULT 0,
      grand_total NUMERIC(12, 2) DEFAULT 0,
      payout_10th NUMERIC(12, 2) DEFAULT 0,
      payout_16th NUMERIC(12, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_salaries_branch_employee ON salaries(branch_id, LOWER(employee_name));
  `;
  try {
    await pool.query(queryText);
    console.log("PostgreSQL Salary relational matrix ledger initialized.");
  } catch (err) {
    console.error("Error building Postgres Salary table:", err);
  }
};