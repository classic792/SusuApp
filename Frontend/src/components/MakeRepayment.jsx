import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  CreditCard,
  CheckCircle2,
  Scan,
  ArrowRight,
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import api from "../services/api";
import FaceVerificationCamera from "./FaceVerificationCamera";

const MakeRepayment = ({ onComplete, remainingLimit }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Form, 3: Confirm, 4: Success
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amount, setAmount] = useState("");
  const [repaymentDate, setRepaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [transactionResult, setTransactionResult] = useState(null);
  const [faceSignature, setFaceSignature] = useState(null);

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        setLoading(true);
        const res = await api.get("/loans/active");
        setActiveLoans(res.data);
      } catch (err) {
        console.error("Error fetching active loans:", err);
        setError("Failed to load active loans.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoans();
  }, []);

  // Filter loans based on search query
  const filteredLoans = activeLoans.filter(
    (loan) =>
      loan.id.toString().includes(searchQuery) ||
      loan.clientId.toString().includes(searchQuery) ||
      (loan.clientName &&
        loan.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loan.accountNumber &&
        loan.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setStep(2);
    setError("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validation: cannot be negative or exceed balance
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (paymentAmount > selectedLoan.balanceRemaining) {
      setError(
        `Amount cannot exceed current loan balance (GH₵ ${selectedLoan.balanceRemaining.toFixed(2)})`,
      );
      return;
    }

    if (paymentAmount > remainingLimit) {
      setError(
        `Warning: This amount exceeds your remaining daily limit of GH₵ ${remainingLimit.toFixed(2)}. Please enter an amount equal to or less than GH₵ ${remainingLimit.toFixed(2)}.`,
      );
      return;
    }

    setError("");
    setStep(3);
  };

  const handleSubmitRepayment = async (isSkipped = false) => {
    setIsScanning(true);
    setError("");

    try {
      // Small delay for biometric processing UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        loanId: parseInt(selectedLoan.id),
        amountPaid: parseFloat(amount),
        repaymentDate: new Date(repaymentDate).toISOString().split(".")[0],
        idempotencyKey: crypto.randomUUID(),
        faceSignature: isSkipped ? null : faceSignature,
      };

      console.log("Submitting Repayment Payload:", payload);
      const response = await api.post("/repayments", payload);
      console.log("Repayment Response:", response.data);
      setTransactionResult(response.data);
      setStep(4);
    } catch (err) {
      console.error("Repayment failed. Full Error Object:", err);
      if (err.response) {
        console.error("Error Response Data:", err.response.data);
        console.error("Error Response Status:", err.response.status);
      }

      let errorMessage = "Repayment submission failed.";
      if (typeof err.response?.data === "string") {
        errorMessage = err.response.data;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors).join(", ");
      } else if (typeof err.response?.data === "object") {
        errorMessage = Object.values(err.response.data).join(", ");
      }
      setError(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  // --- RENDERING HELPERS ---

  const renderSearch = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Select Loan for Repayment
        </h2>
        <p className="text-slate-500">
          Search for the active loan being repaid
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by Loan ID or Client ID..."
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
          {searchQuery && filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => (
              <button
                key={loan.id}
                onClick={() => handleSelectLoan(loan)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-violet-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">
                      {loan.clientName || `Loan #${loan.id}`}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">
                      Acct: {loan.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase font-bold text-right">
                      Balance
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      GH₵ {loan.balanceRemaining.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-violet-600 transition-colors"
                  />
                </div>
              </button>
            ))
          ) : searchQuery ? (
            <div className="text-center py-10">
              <p className="text-slate-400 italic">
                No active loans found matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="text-center py-10 opacity-30">
              <Search size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">
                Start typing to search active loans
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
              Repayment For
            </p>
            {/* <h3 className="text-xl font-bold">Loan #{selectedLoan?.id}</h3>*/}
            <h3 className="text-sm opacity-90">{selectedLoan?.clientName}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
              Balance Remaining
            </p>
            <p className="text-xl font-black text-rose-400">
              GH₵ {selectedLoan?.balanceRemaining?.toLocaleString()}
            </p>
          </div>
        </div>
        <CreditCard
          size={100}
          className="absolute -right-6 -bottom-6 opacity-10 text-white"
        />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Payment Amount (GH₵)
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
              className={`block w-full pl-8 pr-4 py-4 border rounded-xl text-2xl font-black text-slate-800 placeholder-slate-200 focus:outline-none transition-all ${
                error
                  ? "border-rose-300 ring-4 ring-rose-50"
                  : "border-slate-200 focus:ring-2 focus:ring-violet-600"
              }`}
              value={amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAmount(val < 0 ? "0" : e.target.value);
                if (error) setError("");
              }}
            />
          </div>
          {remainingLimit > 0 && parseFloat(amount) > remainingLimit && (
            <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600 animate-in slide-in-from-top-1">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold">
                Amount exceeds your remaining daily limit of GH₵{" "}
                {remainingLimit.toFixed(2)}. Please adjust to exactly match or
                be less than the limit.
              </p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 text-rose-600 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Repayment Date
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="date"
              required
              className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-mono"
              value={repaymentDate}
              onChange={(e) => setRepaymentDate(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!amount || !!error || isScanning}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
          {isScanning ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Proceed to Confirmation"
          )}
        </button>
      </form>
    </div>
  );

  const renderConfirm = () => (
    <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Confirm Payment</h2>
        <p className="text-slate-500">
          Capture client face to authorize the repayment
        </p>
      </div>

      <FaceVerificationCamera
        onCapture={setFaceSignature}
        onCancel={() => setStep(2)}
      />

      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleSubmitRepayment(false)}
          disabled={!faceSignature || isScanning}
          className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
          {isScanning ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying Identity...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Authorize Repayment
            </>
          )}
        </button>

        <button
          onClick={() => handleSubmitRepayment(true)}
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

      <div className="flex items-center justify-center gap-3 text-slate-600 bg-slate-100 p-4 rounded-xl shadow-sm">
        <Scan size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">
          Secure Biometric Payment
        </span>
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
            Payment Successful!
          </h2>
          <p className="text-slate-500">The repayment record has been saved.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-50">
          {/* <span className="text-slate-400 text-sm">Receipt #</span> */}
          <span className="font-mono font-bold text-slate-800 uppercase">
            {transactionResult?.idempotencyKey?.substring(0, 8)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-y-4">
          {/* <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Loan ID
            </p>
            <p className="font-bold text-slate-800">#{selectedLoan?.id}</p>
          </div> */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Date
            </p>
            <p className="font-bold text-slate-800">{repaymentDate}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Amount Paid
            </p>
            <p className="font-bold text-emerald-600">
              GH₵ {parseFloat(amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Remaining Balance
            </p>
            <p className="font-bold text-slate-800">
              GH₵ {transactionResult?.balanceRemaining?.toLocaleString()}
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

  return (
    <div className="w-full">
      {step === 1 && renderSearch()}
      {step === 2 && renderForm()}
      {step === 3 && renderConfirm()}
      {step === 4 && renderSuccess()}
    </div>
  );
};

export default MakeRepayment;
