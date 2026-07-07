import pool from '../config/db.js';

// 1. GET: Fetch existing unique employees belonging strictly to the selected branch
export const getEmployeeList = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) {
      return res.status(400).json({ message: 'Branch selection ID is required.' });
    }

    const queryText = `
      SELECT DISTINCT ON (LOWER(employee_name))
        employee_name AS "employeeName",
        designation,
        bank_name AS "bankName",
        account_number AS "accountNumber",
        ifsc_code AS "ifscCode"
      FROM salaries
      WHERE branch_id = $1
      ORDER BY LOWER(employee_name), created_at DESC;
    `;

    const { rows } = await pool.query(queryText, [branchId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching branch employee lists via Postgres:', error);
    return res.status(500).json({ message: 'Server error building filtered employee profile index.' });
  }
};

// 2. POST: Process complete salary statement updates and map fields directly to Postgres DB
export const submitSalaryStatement = async (req, res) => {
  try {
    const data = req.body;
    
    if (!data.branchId || !data.employeeName || !data.entryDate) {
      return res.status(400).json({ message: 'Missing mandatory matching parameters.' });
    }

    const queryText = `
      INSERT INTO salaries (
        branch_id, employee_name, designation, bank_name, account_number, ifsc_code, entry_date,
        renewal, new_amount, gold_coin, gvcn, lss, gvcr, trade, land, builders,
        total_efgh, renewal_15, new_20, salary, land_payout, commissions, grand_total, payout_10th, payout_16th
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *;
    `;

    const values = [
      data.branchId,
      data.employeeName,
      data.designation,
      String(data.bankName || '').toUpperCase(),
      String(data.accountNumber || '').toUpperCase(),
      String(data.ifscCode || '').toUpperCase(),
      data.entryDate,
      data.renewal || 0,
      data.newAmount || 0,
      data.goldCoin || 0,
      data.gvcn || 0,
      data.lss || 0,
      data.gvcr || 0,
      data.trade || 0,
      data.land || 0,
      data.builders || 0,
      data.totalEFGH || 0,
      data.renewal15 || 0,
      data.new20 || 0,
      data.salary || 0,
      data.landPayout || 0,
      data.commissions || 0,
      data.grandTotal || 0,
      data.payout10th || 0,
      data.payout16th || 0
    ];

    const { rows } = await pool.query(queryText, values);
    return res.status(201).json({ message: 'Salary statement successfully logged!', record: rows[0] });
  } catch (error) {
    console.error('Error handling submission ledger data in Postgres:', error);
    return res.status(500).json({ message: 'Internal server error committing ledger data.' });
  }
};

// 3. GET: Fetch all individual row entries logged inside a selected corporate branch
export const getBranchRecords = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) {
      return res.status(400).json({ message: 'Branch validation ID code context required.' });
    }

    const queryText = `
      SELECT 
        id,
        branch_id AS "branchId",
        employee_name AS "employeeName",
        designation,
        bank_name AS "bankName",
        account_number AS "accountNumber",
        ifsc_code AS "ifscCode",
        entry_date AS "entryDate",
        renewal,
        new_amount AS "newAmount",
        gold_coin AS "goldCoin",
        gvcn,
        lss,
        gvcr,
        trade,
        land,
        builders,
        total_efgh AS "totalEFGH",
        renewal_15 AS "renewal15",
        new_20 AS "new20",
        salary,
        land_payout AS "landPayout",
        commissions,
        grand_total AS "grandTotal",
        payout_10th AS "payout10th",
        payout_16th AS "payout16th"
      FROM salaries
      WHERE branch_id = $1
      ORDER BY entry_date DESC, id DESC;
    `;

    const { rows } = await pool.query(queryText, [branchId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error extracting structural branch statement datasets via Postgres:', error);
    return res.status(500).json({ message: 'Internal Server Error compiling branch datasets.' });
  }
};