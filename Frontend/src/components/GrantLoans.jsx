import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  User,
  HandCoins,
  ArrowRight,
  Landmark,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Loader2,
  ListChecks,
  PlusCircle,
  CalendarClock,
  BadgeCheck,
  Hourglass,
} from "lucide-react";
import api from "../services/api";
import FaceVerificationCamera from "./FaceVerificationCamera";

const GrantLoans = ({ onComplete }) => {
  // Tab: "new" | "pending"
  const [activeTab, setActiveTab] = useState("new");

  // --- New Loan state ---
  const [step, setStep] = useState(1); // 1: Search, 2: Form, 3: Confirm, 4: Success
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("5");
  const [duration, setDuration] = useState("6");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [transactionResult, setTransactionResult] = useState(null);
  const [faceSignature, setFaceSignature] = useState(null);

  // --- Pending Loans state ---
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState("");

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const res = await api.get("/clients");
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to load applicants.");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch pending loans when tab switches to "pending"
  useEffect(() => {
    if (activeTab !== "pending") return;
    const fetchPending = async () => {
      try {
        setLoadingPending(true);
        setPendingError("");
        const res = await api.get("/loans/pending");
        setPendingLoans(res.data);
      } catch (err) {
        console.error("Error fetching pending loans:", err);
        setPendingError("Failed to load pending loans.");
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
  }, [activeTab]);

  // Calculations
  const totalRepayment = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(interestRate) || 0;
    return p + p * (r / 100);
  }, [principal, interestRate]);

  const monthlyInstallment = useMemo(() => {
    const d = parseInt(duration) || 1;
    return totalRepayment / d;
  }, [totalRepayment, duration]);

  // Filtered clients
  const filteredClients = clients.filter(
    (c) =>
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ghanaCardNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setError("");
    try {
      setLoadingClients(true);
      const res = await api.get("/accounts");
      const account = res.data.find((a) => a.clientId === client.id);
      if (!account) {
        setError("No active account found for this client.");
        return;
      }
      setSelectedAccount(account);
      setStep(2);
    } catch (err) {
      console.error("Error fetching client account:", err);
      setError("Failed to load account details.");
    } finally {
      setLoadingClients(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccount) {
      setError("No active account found for this client.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleApply = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (!selectedAccount) {
        setError("No active account found for this client.");
        setSubmitting(false);
        return;
      }
      const months = parseInt(duration);
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + months);
      const payload = {
        clientId: selectedClient.id,
        accountId: selectedAccount.id,
        principalAmount: parseFloat(principal),
        interestRate: parseFloat(interestRate),
        duration: months,
        disbursementDate: new Date().toISOString().substring(0, 19),
        dueDate: dueDate.toISOString().substring(0, 19),
        faceSignature: faceSignature,
      };
      const response = await api.post("/loans", payload);
      setTransactionResult(response.data);
      setStep(4);
    } catch (err) {
      console.error("Loan application failed:", err);
      let errorMessage = "Loan submission failed.";
      if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── STATUS BADGE ────────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const map = {
      pending: {
        color: "bg-amber-100 text-amber-700",
        label: "Pending Approval",
      },
      active: { color: "bg-emerald-100 text-emerald-700", label: "Active" },
      paid: { color: "bg-slate-100 text-slate-600", label: "Paid" },
      defaulted: { color: "bg-rose-100 text-rose-700", label: "Defaulted" },
      declined: { color: "bg-rose-600 text-white", label: "Declined" },
    };
    const s = map[status] || map.pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.color}`}>
        <Hourglass size={10} />
        {s.label}
      </span>
    );
  };

  // ─── RENDERS ──────────────────────────────────────────────────────────────────

  const renderSearch = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Identify Applicant
        </h2>
        <p className="text-slate-500">
          Search for the client requesting a new loan
        </p>
      </div>
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Client name or Ghana Card..."
          className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all shadow-sm font-bold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      {loadingClients ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-violet-600 w-8 h-8" />
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-3">
          {searchQuery && filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-violet-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">
                      Acct: {client.primaryAccountNumber}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-300 group-hover:text-violet-600 transition-colors"
                />
              </button>
            ))
          ) : searchQuery ? (
            <div className="text-center py-10">
              <p className="text-slate-400 italic">
                No clients found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="text-center py-10 opacity-30">
              <HandCoins size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">
                Search to identify applicant
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              {selectedClient?.firstName} {selectedClient?.lastName}
            </h3>
            <p className="text-xs text-slate-500 uppercase">
              GHANA CARD: {selectedClient?.ghanaCardNumber}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Account Number
          </p>
          <p className="font-bold text-violet-600">
            #{selectedAccount?.accountNumber}
          </p>
        </div>
      </div>
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handleFormSubmit}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Loan Principal (GH₵)
              </label>
              <div className="relative">
                <Landmark
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none font-bold"
                  value={principal}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPrincipal(val < 0 ? "0" : e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                  value={interestRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setInterestRate(val < 0 ? "0" : e.target.value);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                  value={duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDuration(val < 1 ? "1" : e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!principal || submitting}
            className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group">
            Proceed to Biometric Check
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>
        <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-8">
            <Calculator size={20} className="text-violet-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Repayment Summary
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs opacity-60 mb-1">Total to Repay</p>
              <p className="text-4xl font-black text-violet-400">
                GH₵{" "}
                {totalRepayment.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-60">Interest (Flat)</span>
                <span className="font-bold">
                  GH₵{" "}
                  {(totalRepayment - (parseFloat(principal) || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-60">Monthly Installment</p>
                  <p className="text-lg font-bold">
                    GH₵{" "}
                    {monthlyInstallment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">Period</p>
                  <p className="text-lg font-bold">{duration || 0} Months</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle
              size={16}
              className="text-violet-400 shrink-0 mt-0.5"
            />
            <p className="text-[10px] text-violet-200 leading-relaxed italic">
              Calculations based on simple interest. Final approval is subject
              to credit assessment and company policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Identity Verification</h2>
        <p className="text-slate-500">
          Scan client's face to authorize this loan application
        </p>
      </div>

      <FaceVerificationCamera 
        onCapture={setFaceSignature} 
        onCancel={() => setStep(2)}
      />

      <div className="flex flex-col gap-4">
        <button
          onClick={handleApply}
          disabled={!faceSignature || submitting}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Submitting Application...
            </>
          ) : (
            <>
              <BadgeCheck size={20} />
              Finalize & Submit Request
            </>
          )}
        </button>
        
        {!submitting && (
          <button
            onClick={() => {
              setFaceSignature(null);
              setStep(2);
            }}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Modify Loan Details
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-3 text-slate-600 shadow-sm">
        <HandCoins size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">Authorized Application Process</span>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="w-24 h-24 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
          <CheckCircle2 size={56} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-50 rounded-full animate-ping opacity-20" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">
          Request Submitted!
        </h2>
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Clock size={12} strokeWidth={3} />
          Pending Approval
        </div>
        <p className="text-slate-500 px-4 leading-relaxed">
          The loan application for{" "}
          <span className="font-bold text-slate-700">
            {selectedClient?.firstName} {selectedClient?.lastName}
          </span>{" "}
          has been successfully sent for review.
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left divide-y divide-slate-50">
        <div className="pb-4 flex justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase">
            Requested Amount
          </p>
          <p className="font-black text-slate-800">
            GH₵ {parseFloat(principal).toFixed(2)}
          </p>
        </div>
        <div className="py-4 flex justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase">Terms</p>
          <p className="text-sm font-bold text-slate-800">
            {interestRate}% over {duration} months
          </p>
        </div>
        <div className="pt-4 flex justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase">Loan Ref</p>
          <p className="text-xs font-mono font-bold text-slate-400">
            {transactionResult?.loanReference}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            setActiveTab("pending");
            setStep(1);
            setSearchQuery("");
            setSelectedClient(null);
            setPrincipal("");
          }}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-md active:scale-95">
          View Pending Loans
        </button>
        <button
          onClick={onComplete}
          className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95">
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  const renderPendingLoans = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Pending Loan Applications
        </h2>
        <p className="text-slate-500">
          Loans you've submitted that are awaiting admin approval
        </p>
      </div>

      {loadingPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-600 w-8 h-8" />
        </div>
      ) : pendingError ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 max-w-md mx-auto">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{pendingError}</p>
        </div>
      ) : pendingLoans.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <BadgeCheck size={56} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-slate-500 text-lg">All clear!</p>
          <p className="text-sm text-slate-400">
            No pending loan applications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {pendingLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Client info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <User size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {loan.clientName || `Client #${loan.clientId}`}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {loan.accountNumber}
                    </p>
                  </div>
                </div>

                {/* Right: Status & Ref */}
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={loan.status} />
                  <p className="text-[10px] font-mono text-slate-400">
                    {loan.loanReference}
                  </p>
                </div>
              </div>

              {/* Loan Details Grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Principal
                  </p>
                  <p className="font-bold text-slate-800">
                    GH₵{" "}
                    {parseFloat(loan.principalAmount).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Total Repayable
                  </p>
                  <p className="font-bold text-violet-600">
                    GH₵{" "}
                    {parseFloat(loan.totalAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="font-bold text-slate-800">
                    {loan.duration} months
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                    <CalendarClock size={10} /> Due Date
                  </p>
                  <p className="font-bold text-slate-800 text-sm">
                    {loan.dueDate
                      ? new Date(loan.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────────

  // While in step 2 or 3, hide the tabs
  const showTabs = activeTab === "new" ? step === 1 : true;

  return (
    <div className="w-full">
      {/* Tab Switcher - only visible on step 1 or pending tab */}
      {showTabs && (
        <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto mb-8">
          <button
            onClick={() => {
              setActiveTab("new");
              setStep(1);
              setSearchQuery("");
              setSelectedClient(null);
              setPrincipal("");
              setError("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "new"
                ? "bg-white text-violet-600 shadow-md shadow-violet-100 ring-1 ring-violet-100"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}>
            <PlusCircle size={16} />
            New Loan
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "pending"
                ? "bg-white text-amber-600 shadow-md shadow-amber-100 ring-1 ring-amber-100"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}>
            <ListChecks size={16} />
            Pending
            {pendingLoans.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {pendingLoans.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === "new" && step === 1 && renderSearch()}
      {activeTab === "new" && step === 2 && renderForm()}
      {activeTab === "new" && step === 3 && renderConfirm()}
      {activeTab === "new" && step === 4 && renderSuccess()}
      {activeTab === "pending" && renderPendingLoans()}
    </div>
  );
};

export default GrantLoans;
