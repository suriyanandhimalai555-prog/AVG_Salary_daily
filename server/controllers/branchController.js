import { 
  getAllBranchesFromDB, 
  checkBranchExists, 
  checkBranchExistsForOther, 
  insertBranch, 
  updateBranchInDB, 
  deleteBranchFromDB 
} from '../models/branchModel.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await getAllBranchesFromDB();
    return res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return res.status(500).json({ message: 'Failed to retrieve branches.' });
  }
};

export const addBranch = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Branch name is required.' });
    }

    const exists = await checkBranchExists(name.trim());
    if (exists) {
      return res.status(400).json({ message: 'This branch name is already onboarded!' });
    }

    const newBranch = await insertBranch(name.trim());
    return res.status(201).json({ message: 'Branch added successfully', branch: newBranch });
  } catch (error) {
    console.error('Error adding branch:', error);
    return res.status(500).json({ message: 'Failed to onboard branch.' });
  }
};

export const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Branch name cannot be empty.' });
    }

    const exists = await checkBranchExistsForOther(id, name.trim());
    if (exists) {
      return res.status(400).json({ message: 'Another branch already has this name!' });
    }

    const updatedBranch = await updateBranchInDB(id, name.trim());
    return res.status(200).json({ message: 'Branch updated successfully', branch: updatedBranch });
  } catch (error) {
    console.error('Error updating branch:', error);
    return res.status(500).json({ message: 'Failed to update branch.' });
  }
};

export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteBranchFromDB(id);
    return res.status(200).json({ message: 'Branch removed from registry.' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return res.status(500).json({ message: 'Failed to remove branch.' });
  }
};