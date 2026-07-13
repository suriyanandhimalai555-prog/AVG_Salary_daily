import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import { setupDatabase } from './models/userModel.js';
import { setupBranchDatabase } from './models/branchModel.js';
import { setupSalaryDatabase } from './models/salaryModel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Initialize SQL Structure definitions
setupDatabase();
setupBranchDatabase();
setupSalaryDatabase();

// Route Declarations
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/salary', salaryRoutes);

app.listen(PORT, () => {
  console.log(`System backend environment hot-swapped online on port: ${PORT}`);
});