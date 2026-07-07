import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Database, Send, Briefcase, User, Loader2, Calendar, Building2, CreditCard, Hash, Search, ChevronDown, UserPlus, UserCheck } from 'lucide-react';

const DataEntry = () => {
  const [loading, setLoading] = useState(false);
  
  // New State variables for Handling Old vs New Employee Selection Workflow
  const [employeeType, setEmployeeType] = useState('new'); // 'new' or 'old'
  const [existingUsers, setExistingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: '',
    designation: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    salaryMonth: new Date().toISOString().slice(0, 7),
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

  // Fetch unique historical personnel registry entries when 'old' type is mounted
  useEffect(() => {
    if (employeeType === 'old') {
      fetchExistingProfiles();
    }
  }, [employeeType]);

  const fetchExistingProfiles = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
  'http://localhost:5000/api/salary/employee-list',
  {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }
);
      if (response.ok) {
        const data = await response.json();
        setExistingUsers(data);
      }
    } catch (err) {
      console.error('Error gathering administrative profiles array:', err);
    }
  };

  // Helper helper to format input values safely as safe numbers
  const getNum = (val) => (val === '' ? 0 : Number(val));

  // --- AUTOMATIC DERIVED EXCEL FORMULA CALCULATIONS ---
  const totalEFGH = getNum(formData.gvcn) + getNum(formData.lss) + getNum(formData.gvcr) + getNum(formData.trade);
  const renewal15 = Math.round(getNum(formData.renewal) * 0.15);
  const new20 = Math.round(getNum(formData.newAmount) * 0.20);
  const grandTotal = renewal15 + new20 + getNum(formData.salary) + getNum(formData.landPayout) + getNum(formData.commissions);

  // --- SPLIT PAYOUT TIMELINE SCHEDULES ---
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

  // Logic to inject corporate banking data nodes immediately into active context matrix
  const handleSelectOldEmployee = (user) => {
    const selectedName = user.employeeName || user.name || '';
    setFormData({
      ...formData,
      employeeName: selectedName,
      designation: user.role || user.designation || '',
      bankName: (user.bankName || '').toUpperCase(),
      accountNumber: (user.accountNumber || '').toUpperCase(),
      ifscCode: (user.ifscCode || '').toUpperCase()
    });
    setSearchQuery(selectedName); // FIXED: Correctly populates the visible input field
    setIsDropdownOpen(false);
  };

  const handleTypeReset = (type) => {
    setEmployeeType(type);
    setSearchQuery('');
    setFormData({
      employeeName: '', designation: '', bankName: '', accountNumber: '', ifscCode: '',
      renewal: '', newAmount: '', goldCoin: '', gvcn: '', lss: '', gvcr: '', 
      trade: '', land: '', builders: '', salary: '', landPayout: '', commissions: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Syncing compensation matrix to database...');
    const token = localStorage.getItem('token');

    const payload = {
      employeeName: formData.employeeName,
      designation: formData.designation,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      salaryMonth: formData.salaryMonth,
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
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Employee statement ledger logged successfully!', { id: toastId });
        setSearchQuery('');
        setFormData({
          employeeName: '', designation: '', bankName: '', accountNumber: '', ifscCode: '',
          renewal: '', newAmount: '', goldCoin: '', gvcn: '', lss: '', gvcr: '', 
          trade: '', land: '', builders: '', salary: '', landPayout: '', commissions: ''
        });
      } else {
        toast.error(data.message || 'Submission mapping failed.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network synchronization failure encountered.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Standard case-insensitive filtration for real-time search match indexing
  const filteredUsers = existingUsers.filter(user => 
    (user.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Salary Metric Data Entry</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Input employee branch operational transactional metrics safely.</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1 rounded-xl self-start sm:self-center border border-slate-200/40">
          <button
            type="button"
            onClick={() => handleTypeReset('new')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              employeeType === 'new'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={14} />
            New Employee
          </button>
          <button
            type="button"
            onClick={() => handleTypeReset('old')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              employeeType === 'old'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} />
            Old Employee
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- SECTION 1: IDENTITY PROFILE & BANK DETAILS --- */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* NAME INPUT / SEARCH SELECTOR ELEMENT */}
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
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 text-sm outline-none transition-all bg-white cursor-pointer flex items-center justify-between"
                    >
                      <input
                        type="text"
                        placeholder="Search Profile Identity..."
                        value={searchQuery}
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
                          <div className="p-3.5 text-xs text-slate-400 font-medium text-center">No structural user record matched.</div>
                        ) : (
                          filteredUsers.map((user, index) => (
                            <div
                              key={index}
                              onClick={() => handleSelectOldEmployee(user)}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-50 last:border-0"
                            >
                              <span className="text-sm font-semibold text-slate-800">{user.employeeName}</span>
                              <span className="text-xs text-indigo-500 font-medium">{user.role || user.designation || 'Staff'}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* DESIGNATION FIELD INPUT */}
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
                  placeholder="E.g., BM, GM, Admin, OA, SO"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* BANK NAME FIELD */}
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
                  placeholder="E.G., HDFC BANK"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* ACCOUNT NUMBER FIELD */}
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
                  placeholder="E.G., 5010023456789"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
    Salary Month
  </label>
  <input
    type="month"
    name="salaryMonth"
    value={formData.salaryMonth}
    onChange={handleChange}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
  />
</div>

            {/* IFSC CODE FIELD */}
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
                  placeholder="E.G., HDFC0001234"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all uppercase ${
                    employeeType === 'old' ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: CORE MATRIX TRANSACTION INDICATORS --- */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-4">Core Operational Logs</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Renewal</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="renewal"
                  value={formData.renewal}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">New</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="newAmount"
                  value={formData.newAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Gold Coin</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="goldCoin"
                  value={formData.goldCoin}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">GVCN</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="gvcn"
                  value={formData.gvcn}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">LSS</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="lss"
                  value={formData.lss}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">GVCR</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="gvcr"
                  value={formData.gvcr}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Trade</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="trade"
                  value={formData.trade}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Land</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="land"
                  value={formData.land}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Builders</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="builders"
                  value={formData.builders}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total E+F+G+H</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={totalEFGH}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/80 text-slate-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Renewal 15%</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={renewal15}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/80 text-slate-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">New 20%</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={new20}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/80 text-slate-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: BASE COMPENSATIONS --- */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4">Base Payout Allotments</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Salary</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">trade+Land+builders</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="landPayout"
                  value={formData.landPayout}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Commissions</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  name="commissions"
                  value={formData.commissions}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1.5">Total Sum Payout</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-600 font-bold text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={grandTotal}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 font-semibold text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 4: SPLIT DISBURSEMENT CHRONOLOGY --- */}
        <div className="border-t border-slate-100 pt-5 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Scheduled Disbursement Splits</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">10th Release Payout (Max ₹25,000)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={payout10th}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">16th Release Payout (Remaining Balance)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium text-sm">₹</span>
                <input
                  type="number"
                  readOnly
                  value={payout16th}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Submit Trigger Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/15 transition-all outline-none"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>{loading ? 'Processing System Entries...' : 'Submit Records Ledger'}</span>
        </button>
      </form>
    </div>
  );
};

export default DataEntry;