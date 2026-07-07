import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';

const OnboardBranch = () => {
  // 1. State Management
  const [branches, setBranches] = useState([
    { id: 1, name: 'Main HQ' },
    { id: 2, name: 'North Branch' }
  ]);
  const [branchInput, setBranchInput] = useState('');
  
  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, branchId: null, branchName: '' });

  // 2. Handlers
  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!branchInput.trim()) return;

    // Check if branch name already exists (case-insensitive)
    const exists = branches.some(b => b.name.toLowerCase() === branchInput.trim().toLowerCase());
    if (exists) {
      toast.error('This branch name is already onboarded!');
      return;
    }

    const newBranch = {
      id: Date.now(),
      name: branchInput.trim()
    };

    setBranches([...branches, newBranch]);
    setBranchInput('');
    toast.success('New branch onboarded successfully!');
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, branchId: id, branchName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, branchId: null, branchName: '' });
  };

  const confirmDelete = () => {
    const { branchId } = deleteModal;
    setBranches(branches.filter(branch => branch.id !== branchId));
    closeDeleteModal();
    toast.success('Branch removed from registry.');
  };

  const startEdit = (branch) => {
    setEditingId(branch.id);
    setEditingName(branch.name);
  };

  const handleUpdate = (id) => {
    if (!editingName.trim()) return;

    // Check if updating to a name that already exists elsewhere
    const exists = branches.some(b => b.id !== id && b.name.toLowerCase() === editingName.trim().toLowerCase());
    if (exists) {
      toast.error('Another branch already has this name!');
      return;
    }

    setBranches(branches.map(branch => 
      branch.id === id ? { ...branch, name: editingName.trim() } : branch
    ));
    
    setEditingId(null);
    setEditingName('');
    toast.success('Branch details updated.');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 p-4 sm:p-6 md:p-8 relative">
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Building2 size={20} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Onboard Corporate Branches</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Register, update, and manage official organizational business branches.</p>
        </div>
      </div>

      {/* BRANCH DATA ENTRY INPUT FORM */}
      <form onSubmit={handleAddBranch} className="space-y-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-8">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Branch Name</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Building2 size={16} />
              </span>
              <input
                type="text"
                required
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="E.g., Chennai Corporate Office"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all bg-white"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/15 transition-all outline-none whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Add Branch</span>
            </button>
          </div>
        </div>
      </form>

      {/* REGISTERED BRANCHES TABLE */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4">Registered Operational Branches</h3>
        
        {branches.length === 0 ? (
          <div className="p-8 text-sm text-slate-400 font-medium text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            No active business branch nodes found in records registry.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/60 rounded-xl shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="px-6 py-3.5 tracking-wider text-xs font-bold uppercase">Branch Identity</th>
                  <th className="px-6 py-3.5 tracking-wider text-xs font-bold uppercase w-40 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {editingId === branch.id ? (
                        <div className="relative max-w-md">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 text-sm outline-none bg-white font-normal"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span>{branch.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === branch.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdate(branch.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Save Changes"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Cancel Edit"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(branch)}
                            className="p-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Edit Branch"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(branch.id, branch.name)}
                            className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Remove Branch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- CUSTOM POPUP MODAL (DELETE CONFIRMATION) --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Layer */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeDeleteModal}></div>
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200/80 shadow-2xl p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">Confirm Deletion</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to completely clear out the <span className="font-semibold text-slate-800">"{deleteModal.branchName}"</span> branch matrix from the ecosystem ledger?
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all outline-none"
              >
                Cancel Actions
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/15 transition-all outline-none"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OnboardBranch;