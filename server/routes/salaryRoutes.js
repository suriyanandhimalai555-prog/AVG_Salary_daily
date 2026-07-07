import express from 'express';
import { getEmployeeList, submitSalaryStatement, getBranchRecords } from '../controllers/salaryController.js';

const router = express.Router();

// 1. GET Request: Active user lookup
router.get('/employee-list', getEmployeeList);

// 2. POST Request: Add ledger records
router.post('/submit', submitSalaryStatement);

// 3. Drill-down view route mapping
router.get('/branch-records', getBranchRecords);

export default router;