import { Router } from 'express';
import { getBranches, addBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all routes so only authorized logged-in users/admins can touch them
router.use(protect);

router.get('/', getBranches);
router.post('/', authorize('admin'), addBranch);
router.put('/:id', authorize('admin'), updateBranch);
router.delete('/:id', authorize('admin'), deleteBranch);

export default router;