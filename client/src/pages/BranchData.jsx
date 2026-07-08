import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2, ArrowLeft, Landmark, Eye, Layers, X, DollarSign, Calendar, User, ClipboardList, Percent } from 'lucide-react';

const BranchData = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // Modal states for deep dive employee visual details
  const [activeModalRecord, setActiveModalRecord] = useState(null);

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

  // Format currency cleanly
  const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 bg-slate-50/50 min-h-screen rounded-2xl border border-slate-100 relative">
      
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
              <h2 className="text-lg font-bold text-slate-800">{selectedBranch.name} Branch</h2>
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
            <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm"><span className="animate-spin text-emerald-500">⬤</span> Extracting aggregated branch totals...</div>
          ) : employeeData.length === 0 ? (
            <div className="p-16 border border-dashed border-slate-200 text-center rounded-2xl bg-white text-slate-400 font-medium">No recorded transaction metrics found for {selectedBranch.name} branch yet.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-100/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xxs sm:text-xs">
                      <th className="px-5 py-3.5 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Employee Profile</th>
                      <th className="px-4 py-3.5 text-center bg-slate-100/80 font-bold text-slate-700">Actions</th>
                      <th className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Landmark size={13}/>Banking Context</div></th>
                      <th className="px-4 py-3.5 text-right">Total Renewal</th>
                      <th className="px-4 py-3.5 text-right text-indigo-600 bg-indigo-50/30">Renewal 15%</th>
                      <th className="px-4 py-3.5 text-right">Total New</th>
                      <th className="px-4 py-3.5 text-right text-indigo-600 bg-indigo-50/30">New 20%</th>
                      <th className="px-4 py-3.5 text-right">Gold Coin</th>
                      <th className="px-4 py-3.5 text-right">GVCN</th>
                      <th className="px-4 py-3.5 text-right">LSS</th>
                      <th className="px-4 py-3.5 text-right">GVCR</th>
                      <th className="px-4 py-3.5 text-right">Trade</th>
                      <th className="px-4 py-3.5 text-right">Land</th>
                      <th className="px-4 py-3.5 text-right">Builders</th>
                      <th className="px-4 py-3.5 text-right bg-indigo-50/50 text-indigo-700">Total E+F+G+H</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">Salary Base</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">t+L+b Allotment</th>
                      <th className="px-4 py-3.5 text-right text-slate-600">Commissions</th>
                      <th className="px-5 py-3.5 text-right bg-emerald-50/50 text-emerald-800 font-bold border-l border-emerald-100">Cumulative Grand Total</th>
                      <th className="px-4 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">Combined 10th Split</th>
                      <th className="px-5 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">Combined 16th Split</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                    {employeeData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/60 transition-all">
                        
                        {/* Sticky Profile block safely for wide tables scrolling */}
                        <td className="px-5 py-4 sticky left-0 bg-white z-10 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                          <div className="flex flex-col">
                            <span>{row.employeeName}</span>
                            <span className="text-xxs sm:text-xs text-indigo-500 font-normal tracking-wide mt-0.5">{row.designation}</span>
                          </div>
                        </td>

                        {/* Interactive Popup Row Action Button */}
                        <td className="px-4 py-4 text-center bg-slate-50/40">
                          <button
                            onClick={() => setActiveModalRecord(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
                          >
                            <Eye size={12} /> View Popup
                          </button>
                        </td>
                        
                        <td className="px-4 py-4 text-xs font-normal max-w-xs truncate">
                          <div className="flex flex-col text-slate-600 gap-0.5">
                            <span className="font-semibold text-slate-800 text-xxs tracking-wider uppercase">{row.bankName}</span>
                            <span className="font-mono text-slate-500 tracking-tight">{row.accountNumber}</span>
                            <span className="font-mono text-xxs text-slate-400">IFSC: {row.ifscCode}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.renewal)}</td>
                        <td className="px-4 py-4 text-right text-indigo-700 font-semibold font-mono bg-indigo-50/10">{fmt(row.renewal15)}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-mono">{fmt(row.newAmount)}</td>
                        <td className="px-4 py-4 text-right text-indigo-700 font-semibold font-mono bg-indigo-50/10">{fmt(row.new20)}</td>
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

      {/* POPUP MODAL COMPONENT DETAILED OVERLAY */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center rounded-xl">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-wide">{activeModalRecord.employeeName}</h3>
                  <p className="text-xs text-slate-400">{activeModalRecord.designation} — Summarized Statement</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModalRecord(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
              
              {/* Profile & Bank Info */}
              <div className="sm:col-span-2 border border-slate-100 bg-slate-50/60 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark size={18} className="text-slate-400 shrink-0" />
                  <div className="font-medium">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Bank Details</span>
                    <span className="text-slate-900 font-semibold">{activeModalRecord.bankName || 'N/A'}</span>
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-sm">
                  A/C: {activeModalRecord.accountNumber || 'N/A'}
                </div>
                <div className="font-mono text-xs text-slate-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-sm">
                  IFSC: {activeModalRecord.ifscCode || 'N/A'}
                </div>
              </div>

              {/* Primary Collection Targets Group */}
              <div className="border border-slate-150 p-4 rounded-xl shadow-sm bg-white">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-indigo-600">
                  <ClipboardList size={13} /> Metrics & Business Sourced
                </h4>
                <div className="space-y-2.5 font-medium">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Renewal:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.renewal)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 text-indigo-600 font-semibold bg-indigo-50/30 px-1 rounded"><span>Renewal (15%):</span><span className="font-mono">{fmt(activeModalRecord.renewal15)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>New Sourced:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.newAmount)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 text-indigo-600 font-semibold bg-indigo-50/30 px-1 rounded"><span>New Sourced (20%):</span><span className="font-mono">{fmt(activeModalRecord.new20)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Gold Coin:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.goldCoin)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>GVCN Ledger:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.gvcn)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>LSS Vault:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.lss)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>GVCR Ledger:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.gvcr)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Trade:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.trade)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Land Assets:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.land)}</span></div>
                  <div className="flex justify-between pt-0.5"><span>Builders Pot:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.builders)}</span></div>
                </div>
              </div>

              {/* Aggregated Totals and Release Splits */}
              <div className="space-y-4">
                
                {/* Formulas Total Box */}
                <div className="border border-indigo-100 p-4 rounded-xl bg-indigo-50/30">
                  <span className="text-xxs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Matrix Metric Subtotal (E+F+G+H)</span>
                  <div className="text-xl font-bold text-indigo-700 font-mono">{fmt(activeModalRecord.totalEFGH)}</div>
                </div>

                {/* Base Breakdown Fields */}
                <div className="border border-slate-150 p-4 rounded-xl shadow-sm bg-white font-medium space-y-2.5">
                  <div className="flex justify-between border-b border-slate-100 pb-2"><span>Salary Base:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.salary)}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-2"><span>t+L+b Allotment:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.landPayout)}</span></div>
                  <div className="flex justify-between pt-0.5"><span>Commissions Earned:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.commissions)}</span></div>
                </div>

                {/* Release Cycles Box */}
                <div className="border border-amber-100 p-4 rounded-xl bg-amber-50/20 font-medium space-y-2">
                  <h5 className="text-xxs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={11}/> Release Schedule Matrix</h5>
                  <div className="flex justify-between text-xs"><span>Combined 10th Split:</span><span className="font-mono text-amber-700 font-bold">{fmt(activeModalRecord.payout10th)}</span></div>
                  <div className="flex justify-between text-xs"><span>Combined 16th Split:</span><span className="font-mono text-amber-700 font-bold">{fmt(activeModalRecord.payout16th)}</span></div>
                </div>

              </div>

              {/* Cumulative Grand Total Block */}
              <div className="sm:col-span-2 bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-200" />
                  <span className="font-bold tracking-wide text-sm sm:text-base">Cumulative Balance Grand Total</span>
                </div>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">{fmt(activeModalRecord.grandTotal)}</span>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalRecord(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all outline-none"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BranchData;