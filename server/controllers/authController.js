import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/userModel.js';

// --- REGISTER / SIGNUP NEW NODE ---
export const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and account password are required elements.' });
    }

    // Check existing registry records
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'This email account is already registered in the system ledger.' });
    }

    // Validate incoming assigned role assignment
    const assignedRole = role && ['admin', 'user'].includes(role.toLowerCase()) ? role.toLowerCase() : 'user';

    // Hash Password secure layer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Write to local PostgreSQL DB
    const newUser = await createUser(email, hashedPassword, assignedRole);

    return res.status(201).json({
      message: 'User credential registry compiled successfully.',
      user: newUser
    });

  } catch (error) {
    console.error('Signup engine layer error:', error);
    return res.status(500).json({ message: 'Internal system registry registration failure.' });
  }
};

// --- LOGIN EXISTING NODE ---
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and account password.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid corporate email credential node.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect security clearance credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_matrix_key',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Authentication successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login routing layer error:', error);
    return res.status(500).json({ message: 'Internal server synchronization error.' });
  }
};