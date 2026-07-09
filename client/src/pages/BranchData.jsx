import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Building2, ArrowLeft, Landmark, Eye, Layers, X, DollarSign, Calendar, User, ClipboardList, Wallet } from 'lucide-react';

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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 md:p-8 bg-slate-50/50 min-h-screen rounded-2xl border border-slate-100 box-border overflow-hidden">

      {/* HEADER RENDERING BLOCK */}
      {!selectedBranch ? (
        <div className="mb-6 flex items-start gap-3 p-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Branch Overview Dashboard</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Select an operational corporate branch location below to parse employee statement metrics.</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 p-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => { setSelectedBranch(null); setEmployeeData([]); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all w-full sm:w-auto justify-center"
            >
              <ArrowLeft size={14} /> Back to Branches
            </button>
            <div className="flex items-center gap-2.5 mt-1 sm:mt-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Building2 size={16} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                {selectedBranch.name} Branch
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full self-start sm:self-center">
            Active View
          </span>
        </div>
      )}

      {/* VIEW 1: RENDER ALL AVAILABLE CORPORATE BRANCHES */}
      {!selectedBranch && (
        <>
          {loadingBranches ? (
            <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
              <span className="animate-spin text-indigo-500">⬤</span> Syncing global records database...
            </div>
          ) : branches.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 text-center rounded-2xl bg-white text-slate-400 text-sm">
              No active operational corporate branches discovered inside system core models.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/40 overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-600 font-bold tracking-wider uppercase text-xxs sm:text-xs">
                    <th className="px-4 sm:px-6 py-4">Branch Registry Reference</th>
                    <th className="px-4 sm:px-6 py-4">System Identifier Code</th>
                    <th className="px-4 sm:px-6 py-4 text-right">Operational Actions Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
                  {branches.map((branch) => (
                    <tr key={branch._id || branch.id} className="hover:bg-indigo-50/20 transition-all duration-150">
                      <td className="px-4 sm:px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Building2 size={16} /></div>
                        <span className="font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-none">{branch.name}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xxs font-mono tracking-tight text-slate-400">{branch._id || branch.id}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => handleSelectBranch(branch)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm tracking-wide transition-all"
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
            <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
              <span className="animate-spin text-emerald-500">⬤</span> Extracting aggregated branch totals...
            </div>
          ) : employeeData.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 text-center rounded-2xl bg-white text-slate-400 font-medium text-sm">
              No recorded transaction metrics found for {selectedBranch.name} branch yet.
            </div>
          ) : (
            <div className="w-full space-y-4">

              {/* MOBILE ONLY SMART CARD DISPLAY (Hidden on Desktop/Tablets >= md) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {employeeData.map((row, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3.5">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{row.employeeName}</h4>
                        <span className="text-xxs text-indigo-500 font-medium px-1.5 py-0.5 bg-indigo-50 rounded mt-0.5 inline-block">{row.designation}</span>
                      </div>
                      <button
                        onClick={() => setActiveModalRecord(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xxs rounded-lg transition-all shadow-sm"
                      >
                        <Eye size={12} /> View Statement
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xxs border-b border-slate-50 pb-2.5">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Bank Name</span>
                        <span className="font-semibold text-slate-800 truncate max-w-full block">{row.bankName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Account Number</span>
                        <span className="font-mono text-slate-700 truncate max-w-full block">{row.accountNumber || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Salary:</span>
                        <span className="font-mono font-medium text-slate-900">{fmt(row.salary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">t+L+b Allotment:</span>
                        <span className="font-mono font-semibold text-emerald-600">{fmt(row.landPayout)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">10th Release Split:</span>
                        <span className="font-mono font-medium text-amber-700">{fmt(row.payout10th)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">16th Release Split:</span>
                        <span className="font-mono font-medium text-amber-700">{fmt(row.payout16th)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-dashed border-slate-100 font-bold text-sm text-emerald-800">
                        <span>Grand Total:</span>
                        <span className="font-mono">{fmt(row.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP/TABLET ENGINE COMPONENT (Hidden on screen views < md) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-100/50 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-max table-auto">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xxs">
                        <th className="px-5 py-3.5 sticky left-0 bg-slate-50安全 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">Employee Profile</th>
                        <th className="px-4 py-3.5 text-center bg-slate-100/80 font-bold text-slate-700">Actions</th>
                        <th className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Landmark size={13} />Banking Context</div></th>
                        <th className="px-4 py-3.5 text-right">Total Renewal</th>
                        <th className="px-4 py-3.5 text-right text-indigo-600 bg-indigo-50/30">Renewal 15%</th>
                        <th className="px-4 py-3.5 text-right">Total New</th>
                        <th className="px-4 py-3.5 text-right font-bold text-indigo-500 bg-indigo-50/20">Total E+F+G+H</th>
                        <th className="px-4 py-3.5 text-right text-indigo-600 bg-indigo-50/30">New 20%</th>
                        <th className="px-4 py-3.5 text-right">Gold Coin</th>
                        <th className="px-4 py-3.5 text-right">GVCN</th>
                        <th className="px-4 py-3.5 text-right">LSS</th>
                        <th className="px-4 py-3.5 text-right">GVCR</th>
                        <th className="px-4 py-3.5 text-right">Trade</th>
                        <th className="px-4 py-3.5 text-right">Land</th>
                        <th className="px-4 py-3.5 text-right">Builders</th>
                        <th className="px-4 py-3.5 text-right text-slate-500 bg-slate-50">Trade Comm.</th>
                        <th className="px-4 py-3.5 text-right text-slate-500 bg-slate-50">Land Comm.</th>
                        <th className="px-4 py-3.5 text-right text-slate-500 bg-slate-50">Builders Comm.</th>
                        <th className="px-4 py-3.5 text-right text-slate-600">Salary Base</th>
                        <th className="px-4 py-3.5 text-right font-semibold text-emerald-600 bg-emerald-50/20">t+L+b Allotment</th>
                        <th className="px-4 py-3.5 text-right text-slate-600">Commissions</th>
                        <th className="px-5 py-3.5 text-right bg-emerald-50/50 text-emerald-800 font-bold border-l border-emerald-100">Cumulative Grand Total</th>
                        <th className="px-4 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">Combined 10th Split</th>
                        <th className="px-5 py-3.5 text-right text-amber-700 font-medium bg-amber-50/20">Combined 16th Split</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {employeeData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/60 transition-all">
                          <td className="px-5 py-4 sticky left-0 bg-white z-10 font-semibold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                            <div className="flex flex-col">
                              <span>{row.employeeName}</span>
                              <span className="text-xxs text-indigo-500 font-normal tracking-wide mt-0.5">{row.designation}</span>
                            </div>
                          </td>
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
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.renewal)}</td>
                          <td className="px-4 py-4 text-right font-mono text-indigo-700 font-semibold bg-indigo-50/10">{fmt(row.renewal15)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.newAmount)}</td>
                          <td className="px-4 py-4 text-right font-mono font-semibold text-indigo-600 bg-indigo-50/20">{fmt(row.totalEFGH)}</td>
                          <td className="px-4 py-4 text-right font-mono text-indigo-700 font-semibold bg-indigo-50/10">{fmt(row.new20)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.goldCoin)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.gvcn)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.lss)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.gvcr)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.trade)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.land)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.builders)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-500 bg-slate-50/40">{fmt(row.tradeCommission)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-500 bg-slate-50/40">{fmt(row.landCommission)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-500 bg-slate-50/40">{fmt(row.buildersCommission)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.salary)}</td>
                          <td className="px-4 py-4 text-right font-mono text-emerald-700 font-semibold bg-emerald-50/10">{fmt(row.landPayout)}</td>
                          <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(row.commissions)}</td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">{fmt(row.grandTotal)}</td>
                          <td className="px-4 py-4 text-right font-mono font-medium text-amber-700 bg-amber-50/10">{fmt(row.payout10th)}</td>
                          <td className="px-5 py-4 text-right font-mono font-medium text-amber-700 bg-amber-50/10">{fmt(row.payout16th)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* POPUP MODAL COMPONENT DETAILED OVERLAY */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center rounded-xl shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold tracking-wide truncate">{activeModalRecord.employeeName}</h3>
                  <p className="text-xxs sm:text-xs text-slate-400 truncate">{activeModalRecord.designation} — Summarized Statement</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRecord(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all outline-none shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">

              {/* Profile & Bank Info */}
              <div className="border border-slate-100 bg-slate-50/60 p-3.5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div className="flex items-center gap-2 col-span-1 sm:col-span-3 border-b border-slate-200/50 pb-2 sm:pb-0 sm:border-0">
                  <Landmark size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Bank Context</span>
                    <span className="text-slate-900 font-bold text-xs sm:text-sm">{activeModalRecord.bankName || 'N/A'}</span>
                  </div>
                </div>
                <div className="font-mono text-xxs sm:text-xs text-slate-600 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg shadow-sm truncate">
                  <span className="text-slate-400 font-sans font-medium text-xxs block sm:hidden">A/C:</span> {activeModalRecord.accountNumber || 'N/A'}
                </div>
                <div className="font-mono text-xxs sm:text-xs text-slate-600 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg shadow-sm truncate sm:col-span-2">
                  <span className="text-slate-400 font-sans font-medium text-xxs block sm:hidden">IFSC:</span> {activeModalRecord.ifscCode || 'N/A'}
                </div>
              </div>

              {/* Grid Wrapper for Core Metrics Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Primary Collection Targets Group */}
                <div className="border border-slate-200/60 p-4 rounded-xl shadow-sm bg-white">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-indigo-600">
                    <ClipboardList size={13} /> Sourced Operations
                  </h4>
                  <div className="space-y-2 font-medium text-xxs sm:text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Renewal:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.renewal)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 text-indigo-600 font-semibold bg-indigo-50/40 px-1 rounded"><span>Renewal (15%):</span><span className="font-mono">{fmt(activeModalRecord.renewal15)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>New Sourced:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.newAmount)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 text-indigo-600 font-semibold bg-indigo-50/40 px-1 rounded"><span>New Sourced (20%):</span><span className="font-mono">{fmt(activeModalRecord.new20)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Gold Coin:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.goldCoin)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>GVCN Ledger:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.gvcn)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>LSS Vault:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.lss)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>GVCR Ledger:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.gvcr)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Trade:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.trade)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Land Assets:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.land)}</span></div>
                    <div className="flex justify-between pt-0.5"><span>Builders Pot:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.builders)}</span></div>
                  </div>
                </div>

                {/* Combined Secondary Formulas & Splits Group */}
                <div className="space-y-4">

                  {/* Formulas Total Box */}
                  <div className="border border-indigo-100 p-3.5 rounded-xl bg-indigo-50/30">
                    <span className="text-xxs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Total E+F+G+H (New+Gold+Gvcn+Lss)</span>
                    <div className="text-base sm:text-lg font-bold text-indigo-700 font-mono">{fmt(activeModalRecord.totalEFGH)}</div>
                  </div>

                  {/* Individual Breakdown of Commissions inputs */}
                  <div className="border border-slate-200/60 p-3.5 rounded-xl bg-slate-50/50 text-xxs sm:text-xs space-y-1.5 font-medium">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Logged Commissions</span>
                    <div className="flex justify-between border-b border-slate-200/40 pb-1"><span>Trade Comm:</span><span className="font-mono text-slate-800">{fmt(activeModalRecord.tradeCommission)}</span></div>
                    <div className="flex justify-between border-b border-slate-200/40 pb-1"><span>Land Comm:</span><span className="font-mono text-slate-800">{fmt(activeModalRecord.landCommission)}</span></div>
                    <div className="flex justify-between pb-0.5"><span>Builders Comm:</span><span className="font-mono text-slate-800">{fmt(activeModalRecord.buildersCommission)}</span></div>
                  </div>

                  {/* Base Breakdown Fields */}
                  <div className="border border-slate-200/60 p-3.5 rounded-xl bg-white font-medium space-y-2 text-xxs sm:text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Salary Base:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.salary)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 text-emerald-700 font-semibold bg-emerald-50/30 px-1 rounded"><span>t+L+b Allotment:</span><span className="font-mono">{fmt(activeModalRecord.landPayout)}</span></div>
                    <div className="flex justify-between pt-0.5"><span>Other Commissions:</span><span className="font-mono text-slate-900">{fmt(activeModalRecord.commissions)}</span></div>
                  </div>

                </div>
              </div>

              {/* Release Cycles Box */}
              <div className="border border-amber-100 p-3.5 rounded-xl bg-amber-50/20 font-medium space-y-2">
                <h5 className="text-xxs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1"><Calendar size={11} /> Release Schedule Cycles</h5>
                <div className="grid grid-cols-2 gap-4 text-xxs sm:text-xs">
                  <div className="bg-white/80 p-2 border border-amber-100/50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">10th Split Payment</span>
                    <span className="font-mono text-amber-700 font-bold">{fmt(activeModalRecord.payout10th)}</span>
                  </div>
                  <div className="bg-white/80 p-2 border border-amber-100/50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">16th Split Payment</span>
                    <span className="font-mono text-amber-700 font-bold">{fmt(activeModalRecord.payout16th)}</span>
                  </div>
                </div>
              </div>

              {/* Cumulative Grand Total Block */}
              <div className="bg-emerald-600 text-white p-3.5 sm:p-4 rounded-xl shadow-lg flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Wallet size={18} className="text-emerald-200 shrink-0" />
                  <span className="font-bold tracking-wide text-xs sm:text-sm truncate">Statement Grand Total</span>
                </div>
                <span className="text-base sm:text-xl font-black font-mono tracking-tight shrink-0">{fmt(activeModalRecord.grandTotal)}</span>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalRecord(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all outline-none w-full sm:w-auto"
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