import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Database, Send, Briefcase, User, Loader2, Calendar, Building2, CreditCard, Hash, Search, ChevronDown, UserPlus, UserCheck } from 'lucide-react';

const DataEntry = () => {
  const [loading, setLoading] = useState(false);
  
  // Branch Management States
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Old vs New Selection States
  const [employeeType, setEmployeeType] = useState('new'); 
  const [existingUsers, setExistingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: '',
    designation: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    entryDate: new Date().toISOString().split('T')[0], // Changed from Month to Daily Date Selection
    renewal: '',
    newAmount: '', 
    goldCoin: '',
    gvcn: '',
    lss: '',
    gvcr: '',
    trade: '',
    land: '',
    builders: '',
    salary: '',
    landPayout: '', 
    commissions: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // 1. Fetch Branches from OnboardBranch page API endpoint on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/branches', {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          setBranches(data);
        } else {
          toast.error('Failed to sync system branches list.');
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // 2. Fetch Existing Employee profiles when branch is changed or type switches to 'old'
  useEffect(() => {
    if (employeeType === 'old' && selectedBranch) {
      fetchExistingProfilesByBranch(selectedBranch);
    } else {
      setExistingUsers([]);
    }
    // Clear user-specific input contexts when workflows reset
    setSearchQuery('');
    setFormData(prev => ({
      ...prev,
      employeeName: '', designation: '', bankName: '', accountNumber: '', ifscCode: ''
    }));
  }, [employeeType, selectedBranch]);

  const fetchExistingProfilesByBranch = async (branchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/salary/employee-list?branchId=${branchId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setExistingUsers(data);
      }
    } catch (err) {
      console.error('Error capturing branch profiles:', err);
    }
  };

  const getNum = (val) => (val === '' ? 0 : Number(val));

  // --- AUTOMATIC DERIVED FORMULAS ---
  const totalEFGH = getNum(formData.gvcn) + getNum(formData.lss) + getNum(formData.gvcr) + getNum(formData.trade);
  const renewal15 = Math.round(getNum(formData.renewal) * 0.15);
  const new20 = Math.round(getNum(formData.newAmount) * 0.20);
  const grandTotal = renewal15 + new20 + getNum(formData.salary) + getNum(formData.landPayout) + getNum(formData.commissions);

  // --- SPLIT RELEASE SCHEDULES ---
  const payout10th = grandTotal > 25000 ? 25000 : grandTotal;
  const payout16th = grandTotal > 25000 ? grandTotal - 25000 : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bankName' || name === 'accountNumber' || name === 'ifscCode') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Autocomplete auto-fills position, bank, account number, ifsc code
  const handleSelectOldEmployee = (user) => {
    const nameStr = user.employeeName || '';
    setFormData({
      ...formData,
      employeeName: nameStr,
      designation: user.designation || '',
      bankName: (user.bankName || '').toUpperCase(),
      accountNumber: (user.accountNumber || '').toUpperCase(),
      ifscCode: (user.ifscCode || '').toUpperCase()
    });
    setSearchQuery(nameStr); 
    setIsDropdownOpen(false);
  };

  const handleTypeReset = (type) => {
    setEmployeeType(type);
    setSearchQuery('');
    setFormData({
      employeeName: '', designation: '', bankName: '', accountNumber: '', ifscCode: '',
      entryDate: new Date().toISOString().split('T')[0],
      renewal: '', newAmount: '', goldCoin: '', gvcn: '', lss: '', gvcr: '', 
      trade: '', land: '', builders: '', salary: '', landPayout: '', commissions: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranch) {
      toast.error('Please map an operational corporate branch context.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Syncing database ledger transaction stream...');

    const payload = {
      branchId: selectedBranch,
      employeeName: formData.employeeName,
      designation: formData.designation,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      entryDate: formData.entryDate,
      renewal: getNum(formData.renewal),
      newAmount: getNum(formData.newAmount),
      goldCoin: getNum(formData.goldCoin),
      gvcn: getNum(formData.gvcn),
      lss: getNum(formData.lss),
      gvcr: getNum(formData.gvcr),
      trade: getNum(formData.trade),
      land: getNum(formData.land),
      builders: getNum(formData.builders),
      totalEFGH: totalEFGH,
      renewal15: renewal15,
      new20: new20,
      salary: getNum(formData.salary),
      landPayout: getNum(formData.landPayout),
      commissions: getNum(formData.commissions),
      grandTotal: grandTotal,
      payout10th: payout10th,
      payout16th: payout16th
    };

    try {
      const response = await fetch('http://localhost:5000/api/salary/submit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('System record committed to backend DB!', { id: toastId });
        setSearchQuery('');
        setFormData({
          employeeName: '', designation: '', bankName: '', accountNumber: '', ifscCode: '',
          entryDate: new Date().toISOString().split('T')[0],
          renewal: '', newAmount: '', goldCoin: '', gvcn: '', lss: '', gvcr: '', 
          trade: '', land: '', builders: '', salary: '', landPayout: '', commissions: ''
        });
      } else {
        toast.error(data.message || 'Error executing ledger save.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network database connection dropped.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = existingUsers.filter(user => 
    (user.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Salary Tracker Data Matrix</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Input employee branch operational transactional metrics safely.</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1 rounded-xl self-start sm:self-center border border-slate-200/40">
          <button
            type="button"
            onClick={() => handleTypeReset('new')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              employeeType === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={14} />
            New Employee
          </button>
          <button
            type="button"
            onClick={() => handleTypeReset('old')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              employeeType === 'old' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} />
            Old Employee
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Branch Option Dropdown Matrix Selection (Placed BEFORE Name Input) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Operational Corporate Branch</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Building2 size={16} /></span>
              <select
                required
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none bg-white transition-all appearance-none"
              >
                <option value="">-- Choose Branch Location Context --</option>
                {branches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Daily Transaction Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Calendar size={16} /></span>
              <input
                type="date"
                name="entryDate"
                required
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* PROFILE BLOCK SECTIONS */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Name of Employee</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  {employeeType === 'old' ? <Search size={16} /> : <User size={16} />}
                </span>
                {employeeType === 'new' ? (
                  <input
                    type="text"
                    name="employeeName"
                    required
                    value={formData.employeeName}
                    onChange={handleChange}
                    placeholder="E.g., G.Kamalakannan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                  />
                ) : (
                  <>
                    <div
                      onClick={() => {
                        if (!selectedBranch) {
                          toast.error("Please pick a corporate branch first!");
                          return;
                        }
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 text-sm outline-none transition-all bg-white cursor-pointer flex items-center justify-between"
                    >
                      <input
                        type="text"
                        placeholder={selectedBranch ? "Search Branch Employees..." : "Select branch to activate..."}
                        value={searchQuery}
                        disabled={!selectedBranch}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent outline-none text-sm text-slate-900"
                        required={!formData.employeeName}
                      />
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="p-3.5 text-xs text-slate-400 font-medium text-center">No structural user record matched for this branch.</div>
                        ) : (
                          filteredUsers.map((user, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectOldEmployee(user)}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-50 last:border-0"
                            >
                              <span className="text-sm font-semibold text-slate-800">{user.employeeName}</span>
                              <span className="text-xs text-indigo-500 font-medium">{user.designation || 'Staff Member'}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Position / Designation</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Briefcase size={16} /></span>
                <input
                  type="text"
                  name="designation"
                  required
                  readOnly={employeeType === 'old'}
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="E.g., BM, GM, Admin"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Bank Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Building2 size={16} /></span>
                <input
                  type="text"
                  name="bankName"
                  required
                  readOnly={employeeType === 'old'}
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="E.G., ICICI BANK"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Account Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><CreditCard size={16} /></span>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  readOnly={employeeType === 'old'}
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="ACCOUNT NUMBER"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">IFSC Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Hash size={16} /></span>
                <input
                  type="text"
                  name="ifscCode"
                  required
                  readOnly={employeeType === 'old'}
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="IFSC CODE"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* operational fields matrix */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4">Core Operational Logs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['renewal', 'newAmount', 'goldCoin', 'gvcn', 'lss', 'gvcr', 'trade', 'land', 'builders'].map((f) => (
              <div key={f}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">{f === 'newAmount' ? 'New' : f}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    name={f}
                    value={formData[f]}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total E+F+G+H</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">₹</span>
                <input type="number" readOnly value={totalEFGH} className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/80 text-slate-500 text-sm cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Renewal 15%</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">₹</span>
                <input type="number" readOnly value={renewal15} className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/80 text-slate-500 text-sm cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">New 20%</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">₹</span>
                <input type="number" readOnly value={new20} className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/80 text-slate-500 text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        {/* ALLOTMENTS COMPENSATIONS */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4">Base Payout Allotments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['salary', 'landPayout', 'commissions'].map((f) => (
              <div key={f}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">{f === 'landPayout' ? 'trade+Land+builders' : f}</label>
                <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm">₹</span>
                  <input type="number" name={f} value={formData[f]} onChange={handleChange} placeholder="0" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1.5">Total Sum Payout</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-600 font-bold text-sm">₹</span>
                <input type="number" readOnly value={grandTotal} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 font-semibold text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        {/* RELEASE TIMELINE DETAILS */}
        <div className="border-t border-slate-100 pt-5 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Scheduled Disbursement Splits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">10th Release Payout (Max ₹25,000)</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm">₹</span>
                <input type="number" readOnly value={payout10th} className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700 font-medium text-sm cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">16th Release Payout (Remaining Balance)</label>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm">₹</span>
                <input type="number" readOnly value={payout16th} className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700 font-medium text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-lg transition-all outline-none animate-none"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>{loading ? 'Processing System Entries...' : 'Submit Records Ledger'}</span>
        </button>
      </form>
    </div>
  );
};

export default DataEntry;