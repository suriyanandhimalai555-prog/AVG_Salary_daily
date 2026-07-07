import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2, Users, ArrowLeft, Calendar, ShieldCheck, Landmark, Eye, Layers } from 'lucide-react';

const BranchData = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // 1. Fetch All Branches on Component Mount
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
          toast.error('Failed to pull system branches list.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error establishing database handshake.');
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // 2. Fetch Employee Statements when a Branch is clicked
  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoadingEmployees(true);
    try {
      const response = await fetch(`http://localhost:5000/api/salary/branch-records?branchId=${branch._id || branch.id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setEmployeeData(data);
      } else {
        toast.error('Could not fetch branch statement history.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network execution breakdown.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Format Dates cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // Format currency cleanly
  const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 min-h-screen rounded-2xl border border-slate-100">
      
      {/* HEADER RENDERING BLOCK */}
      {!selectedBranch ? (
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Branch Overview & Statement Dashboard</h2>
            <p className="text-sm text-slate-500">Select any active corporate branch location below to parse raw employee statement ledger data tables.</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSelectedBranch(null); setEmployeeData([]); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <ArrowLeft size={14} /> Back to Branches
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><Building2 size={16} /></div>
              <h2 className="text-lg font-bold text-slate-800">{selectedBranch.name} Ledger Matrix</h2>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">Active View</span>
        </div>
      )}

      {/* VIEW 1: RENDER ALL AVAILABLE CORPORATE BRANCHES */}
      {!selectedBranch && (
        <>
          {loadingBranches ? (
            <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm"><span className="animate-spin text-indigo-500">⬤</span> Syncing global records database...</div>
          ) : branches.length === 0 ? (
            <div className="p-16 border border-dashed border-slate-200 text-center rounded-2xl bg-white text-slate-400">No active operational corporate branches discovered inside system core database models.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-600 font-bold tracking-wider uppercase text-xs">
                    <th className="px-6 py-4">Branch Registry Reference</th>
                    <th className="px-6 py-4">System Identifier Code</th>
                    <th className="px-6 py-4 text-right">Operational Actions Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                  {branches.map((branch) => (
                    <tr key={branch._id || branch.id} className="hover:bg-indigo-50/20 transition-all duration-150">
                      <td className="px-6 py-4.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Building2 size={16} /></div>
                        <span className="font-semibold text-slate-900">{branch.name}</span>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-slate-400 font-mono tracking-tight">{branch._id || branch.id}</td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => handleSelectBranch(branch)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm tracking-wide transition-all"
                        >
                          <Eye size={13} /> View Statements
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: DRILL-DOWN DETAILED EMPLOYEE MATRIX DATA TABLE */}
      {selectedBranch && (
        <>
          {loadingEmployees ? (
            <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm"><span className="animate-spin text-emerald-500">⬤</span> Extracting filtered schema datasets...</div>
          ) : employeeData.length === 0 ? (
            <div className="p-16 border border-dashed border-slate-200 text-center rounded-2xl bg-white text-slate-400 font-medium">No recorded transaction metrics found for {selectedBranch.name} branch yet.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xxs sm:text-xs">
                      <th className="px-5 py-3.5 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Employee Profile</th>
                      <th className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Calendar size={13}/>Activity Date</div></th>
                      <th className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Landmark size={13}/>Banking Context</div></th>
                      <th className="px-4 py-3.5 text-right">Renewal</th>
                      <th className="px-4 py-3.5 text-right">New</th>
                      <th className="px-4 py-3.5 text-right">Gold Coin</th>
                      <th className="px-4 py-3.5 text-right">GVCN</th>
                      <th className="px-4 py-3.5 text-right">LSS</th>
                      <th className="px-4 py-3.5 text-right">GVCR</th>
                      <th className="px-4 py-3.5 text-right">Trade</th>
                      <th className="px-4 py-3.5 text-right">Land</th>
                      <th className="px-4 py-3.5 text-right">Builders</th>
                      <th className="px-4 py-3.5 text-right bg-indigo-50/30 text-indigo-700">Total E+F+G+H</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">Salary</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">t+L+b Allotment</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">Commissions</th>
                      <th className="px-5 py-3.5 text-right bg-emerald-50/50 text-emerald-800 font-bold border-l border-emerald-100">Grand Total</th>
                      <th className="px-4 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">10th Split</th>
                      <th className="px-5 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">16th Split</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                    {employeeData.map((row, index) => (
                      <tr key={row.id || index} className="hover:bg-slate-50/60 transition-all">
                        
                        {/* Stick Profile block safely for wide tables scrolling */}
                        <td className="px-5 py-4 sticky left-0 bg-white z-10 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                          <div className="flex flex-col">
                            <span>{row.employeeName}</span>
                            <span className="text-xxs sm:text-xs text-indigo-500 font-normal tracking-wide mt-0.5">{row.designation}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 text-slate-500 font-mono text-xs">{formatDate(row.entryDate)}</td>
                        
                        <td className="px-4 py-4 text-xs font-normal max-w-xs truncate">
                          <div className="flex flex-col text-slate-600 gap-0.5">
                            <span className="font-semibold text-slate-800 text-xxs tracking-wider uppercase">{row.bankName}</span>
                            <span className="font-mono text-slate-500 tracking-tight">{row.accountNumber}</span>
                            <span className="font-mono text-xxs text-slate-400">IFSC: {row.ifscCode}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.renewal)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.newAmount)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.goldCoin)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.gvcn)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.lss)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.gvcr)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.trade)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.land)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.builders)}</td>
                        
                        <td className="px-4 py-4 text-right font-semibold text-indigo-600 font-mono bg-indigo-50/20">{fmt(row.totalEFGH)}</td>
                        
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.salary)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.landPayout)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.commissions)}</td>
                        
                        <td className="px-5 py-4 text-right font-bold text-emerald-700 font-mono bg-emerald-50/30 border-l border-emerald-100">{fmt(row.grandTotal)}</td>
                        <td className="px-4 py-4 text-right font-medium font-mono text-amber-700 bg-amber-50/10">{fmt(row.payout10th)}</td>
                        <td className="px-5 py-4 text-right font-medium font-mono text-amber-700 bg-amber-50/10">{fmt(row.payout16th)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BranchData;