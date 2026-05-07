import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  CreditCard,
  CheckCircle2,
  Scan,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Loader2,
  AlertCircle,
  Wallet,
  Landmark,
  BadgeCheck,
  Hourglass,
  CalendarClock
} from "lucide-react";
import api from "../services/api";
import FaceVerificationCamera from "./FaceVerificationCamera";

const SusuCollection = ({ onComplete, remainingLimit }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Form, 3: Confirm, 4: Success
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [entryType, setEntryType] = useState("debit"); // credit or debit (Note: backend maps debit to deposit usually, but let's be careful)
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [transactionResult, setTransactionResult] = useState(null);
  const [faceSignature, setFaceSignature] = useState(null);

  // Loans Tab State
  const [activeTab, setActiveTab] = useState("collection");
  const [pendingLoans, setPendingLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  useEffect(() => {
    // Fetch accounts on mount
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load client accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === "loans") {
      const fetchLoans = async () => {
        try {
          setLoadingLoans(true);
          const [pendingRes, activeRes] = await Promise.all([
            api.get("/loans/pending"),
            api.get("/loans/agent/active"),
          ]);
          setPendingLoans(pendingRes.data);
          setApprovedLoans(activeRes.data);
        } catch (error) {
          console.error("Error fetching loans:", error);
        } finally {
          setLoadingLoans(false);
        }
      };
      fetchLoans();
    }
  }, [activeTab]);

  // Filter accounts based on search query (searching by name or account number)
  const filteredAccounts = accounts.filter(
    (a) =>
      a.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.clientName &&
        a.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.clientId && a.clientId.toString().includes(searchQuery)),
  );

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setStep(2);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const transAmount = parseFloat(amount);
    if (entryType === "debit" && transAmount > remainingLimit) {
      setError(`Warning: This amount exceeds your remaining daily limit of GH₵ ${remainingLimit.toFixed(2)}. Please enter an amount equal to or less than GH₵ ${remainingLimit.toFixed(2)}.`);
      return;
    }

    setStep(3);
    setError("");
  };

  const handleCompleteTransaction = async (isSkipped = false) => {
    setIsScanning(true);
    setError("");

    try {
      // Simulate biometric processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const payload = {
        accountId: selectedAccount.id,
        amount: parseFloat(amount),
        entryType: entryType,
        idempotencyKey: crypto.randomUUID(),
        faceSignature: isSkipped ? null : faceSignature,
      };

      const response = await api.post("/transactions", payload);
      setTransactionResult(response.data);

      setStep(4);
    } catch (err) {
      console.error("Transaction failed:", err);
      setError(
        err.response?.data?.message || "Transaction failed. Please try again.",
      );
      // If it's a bad request, stay on step 3 so they can see the error and retake photo if needed
    } finally {
      setIsScanning(false);
    }
  };

  // --- RENDERING HELPERS ---

  const renderSearch = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Search Client Account
        </h2>
        <p className="text-slate-500">
          Enter account number / name to begin collection
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by ACC-XXX or ID..."
          className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all shadow-sm font-bold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-violet-600 w-8 h-8" />
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-3">
          {searchQuery && filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSelectAccount(account)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-violet-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">
                      {account.clientName || `Account ${account.accountNumber}`}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">
                      No: {account.accountNumber} • Bal: GH₵{" "}
                      {account.balance.toLocaleString()}
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
                No accounts found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="text-center py-10 opacity-30">
              <Search size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Start typing to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-violet-600 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
            Selected Account Name: {selectedAccount?.clientName}
          </p>
          <h3 className="text-xl font-bold">
            {selectedAccount?.accountNumber}
          </h3>
          <p className="text-sm opacity-90">
            Current Balance: GH₵ {selectedAccount?.balance.toLocaleString()}
          </p>
        </div>
        <User
          size={80}
          className="absolute -right-4 -bottom-4 opacity-10 text-white"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleFormSubmit}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Transaction Amount (GH₵)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold">¢</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="block w-full pl-8 pr-4 py-4 border border-slate-200 rounded-xl text-2xl font-black text-slate-800 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 appearance-none"
              value={amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAmount(val < 0 ? "0" : e.target.value);
              }}
            />
          </div>
          {entryType === "debit" && remainingLimit > 0 && parseFloat(amount) > remainingLimit && (
            <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600 animate-in slide-in-from-top-1">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold">
                Amount exceeds your remaining daily limit of GH₵ {remainingLimit.toFixed(2)}. 
                Please adjust to exactly match or be less than the limit.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Entry Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setEntryType("debit")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                entryType === "debit"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              }`}>
              <TrendingUp size={24} />
              <span className="font-bold">Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType("credit")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                entryType === "credit"
                  ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              }`}>
              <TrendingDown size={24} />
              <span className="font-bold">Withdraw</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!amount || isScanning}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
          {isScanning ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Confirm Details"
          )}
        </button>
      </form>
    </div>
  );

  const renderConfirm = () => (
    <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95 duration-300">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 text-left">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          Biometric Confirmation
        </h2>
        <p className="text-slate-500">
          Please have the client face the camera for ID verification
        </p>
      </div>

      <FaceVerificationCamera 
        onCapture={setFaceSignature} 
        onCancel={() => setStep(2)}
      />

      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleCompleteTransaction(false)}
          disabled={!faceSignature || isScanning}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
          {isScanning ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Complete Transaction
            </>
          )}
        </button>

        <button
          onClick={() => handleCompleteTransaction(true)}
          disabled={isScanning}
          className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
          Skip Biometric Verification
        </button>
        
        {!isScanning && (
          <button
            onClick={() => {
              setFaceSignature(null);
              setStep(2);
            }}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Back to Details
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-3 text-slate-600 shadow-sm">
        <Scan size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">Secure Face-ID Verification</span>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {entryType === "credit" ? "Withdrawal Pending!" : "Transaction Saved!"}
          </h2>
          <p className="text-slate-500">
            {entryType === "credit" ? "Your withdrawal request is awaiting admin approval." : "The record has been updated successfully."}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
        {/* <div className="flex justify-between items-center pb-4 border-b border-slate-50">
          <span className="text-slate-400 text-sm">Receipt #</span>
          <span className="font-mono font-bold text-slate-800">
            {transactionResult?.idempotencyKey?.substring(0, 8).toUpperCase()}
          </span>
        </div> */}
        <div className="grid grid-cols-2 gap-y-4">
          {/* <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Account ID
            </p>
            <p className="font-bold text-slate-800">#{selectedAccount?.id}</p>
          </div> */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Number
            </p>
            <p className="font-bold text-slate-800">
              {selectedAccount?.accountNumber}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Amount
            </p>
            <p className="font-bold text-slate-800">
              GH₵ {parseFloat(amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Type
            </p>
            <p
              className={`font-bold ${entryType === "debit" ? "text-emerald-600" : "text-rose-600"}`}>
              {entryType === "debit" ? "DEPOSIT" : "WITHDRAW"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
        Done & Back to Dashboard
      </button>
    </div>
  );

  const renderLoansList = () => {
    const allLoans = [...pendingLoans, ...approvedLoans];
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Loans Overview
          </h2>
          <p className="text-slate-500">
            Pending and Active loans associated with your account
          </p>
        </div>

        {loadingLoans ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-violet-600 w-8 h-8" />
          </div>
        ) : allLoans.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <BadgeCheck size={56} className="mx-auto mb-4 text-slate-300" />
            <p className="font-bold text-slate-500 text-lg">No Loans Found</p>
            <p className="text-sm text-slate-400">
              You do not have any pending or active loans.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {allLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
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

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        loan.status === 'pending'
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {loan.status === 'pending' ? <Hourglass size={10} /> : <CheckCircle2 size={10} />}
                      {loan.status === 'pending' ? "Pending" : "Active"}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400">
                      {loan.loanReference}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Principal
                    </p>
                    <p className="font-bold text-slate-800">
                      GH₵{" "}
                      {parseFloat(loan.principalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Total Repayable
                    </p>
                    <p className="font-bold text-violet-600">
                      GH₵{" "}
                      {parseFloat(loan.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                      {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const showTabs = activeTab === "collection" ? step === 1 : true;

  return (
    <div className="w-full">
      {showTabs && (
        <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto mb-8">
          <button
            onClick={() => setActiveTab("collection")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "collection"
                ? "bg-white text-violet-600 shadow-md shadow-violet-100 ring-1 ring-violet-100"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}>
            <Wallet size={16} />
            Collection
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "loans"
                ? "bg-white text-emerald-600 shadow-md shadow-emerald-100 ring-1 ring-emerald-100"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}>
            <Landmark size={16} />
            Loans Status
          </button>
        </div>
      )}

      {activeTab === "collection" && step === 1 && renderSearch()}
      {activeTab === "collection" && step === 2 && renderForm()}
      {activeTab === "collection" && step === 3 && renderConfirm()}
      {activeTab === "collection" && step === 4 && renderSuccess()}
      {activeTab === "loans" && renderLoansList()}
    </div>
  );
};

export default SusuCollection;
