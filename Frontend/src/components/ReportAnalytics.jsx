import React, { useState, useEffect } from "react";
import api from "../services/api";
import { notify } from "./Toaster";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Landmark,
  Clock,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Activity,
  BarChart3,
  CalendarDays,
  Target,
  X,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportAnalytics = () => {
  const [isFrozenModalOpen, setIsFrozenModalOpen] = useState(false);
  const [isLoansModalOpen, setIsLoansModalOpen] = useState(false);
  const [isWithdrawalsModalOpen, setIsWithdrawalsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportingReport, setExportingReport] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [frozenAgents, setFrozenAgents] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    totalCollections: 0,
    communityData: [],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [frozenRes, loansRes, analyticsRes, withdrawalsRes] =
        await Promise.all([
          api.get("/admin/reports/frozen-agents"),
          api.get("/admin/reports/pending-loans"),
          api.get("/admin/reports/deep-analytics"),
          api.get("/admin/reports/pending-withdrawals"),
        ]);

      setFrozenAgents(frozenRes.data);
      setPendingLoans(loansRes.data);
      setAnalytics(analyticsRes.data);
      setPendingWithdrawals(withdrawalsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreeze = async (agentId) => {
    try {
      const adminId = JSON.parse(localStorage.getItem("user"))?.id;
      await api.post(`/admin/agents/${agentId}/unfreeze?adminId=${adminId}`);
      notify.success("Agent unfrozen successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Unfreeze failed:", err);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await api.post(`/admin/loans/${loanId}/approve`);
      notify.success("Loan approved successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Loan approval failed:", err);
    }
  };

  const handleDeclineLoan = async (loanId) => {
    try {
      await api.post(`/admin/loans/${loanId}/decline`);
      notify.success("Loan declined successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Loan decline failed:", err);
    }
  };

  const handleApproveWithdrawal = async (txId) => {
    try {
      await api.post(`/admin/withdrawals/${txId}/approve`);
      notify.success("Withdrawal approved successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Withdrawal approval failed:", err);
      notify.error("Failed to approve withdrawal.");
    }
  };

  const handleDeclineWithdrawal = async (txId) => {
    try {
      await api.post(`/admin/withdrawals/${txId}/decline`);
      notify.success("Withdrawal declined successfully!");
      fetchInitialData();
    } catch (err) {
      console.error("Withdrawal decline failed:", err);
      notify.error("Failed to decline withdrawal.");
    }
  };

  const handleExportDeepReport = async () => {
    if (!exportStartDate || !exportEndDate) {
      notify.error("Please select a date range.");
      return;
    }

    try {
      setExportingReport(true);
      notify.success("Generating report...");

      const res = await api.get("/admin/transactions/overview");
      const allTx = res.data;

      const start = new Date(exportStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(exportEndDate);
      end.setHours(23, 59, 59, 999);

      const filteredTx = allTx.filter((tx) => {
        if (!tx.transactionDate) return false;
        const txDate = new Date(tx.transactionDate);
        return txDate >= start && txDate <= end;
      });

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Deep Report: Transactions", 14, 22);
      doc.setFontSize(11);
      doc.text(
        `Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
        14,
        30,
      );

      const tableColumn = [
        "Date",
        "Type",
        "Client Name",
        "Account Number",
        "Amount",
        "Status",
      ];
      const tableRows = [];

      filteredTx.forEach((tx) => {
        const txData = [
          new Date(tx.transactionDate).toLocaleString(),
          tx.entryType === "credit" ? "Deposit" : "Withdrawal",
          tx.clientName || "N/A",
          tx.accountNumber || "N/A",
          `GHS ${tx.amount.toFixed(2)}`,
          tx.status || "COMPLETED",
        ];
        tableRows.push(txData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] },
      });

      doc.save(`Deep_Report_${exportStartDate}_to_${exportEndDate}.pdf`);
      notify.success("Report downloaded successfully.");
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Export failed", err);
      notify.error("Failed to generate report.");
    } finally {
      setExportingReport(false);
    }
  };

  // --- MOCK DATA FOR CHARTS (Will be replaced as API matures) ---
  const communityData =
    analytics.communityData.length > 0
      ? analytics.communityData
      : [
          { name: "Anaji", accounts: 0 },
          { name: "Apowa", accounts: 0 },
        ];

  const topLocation = communityData.reduce(
    (prev, current) => (prev.accounts >= current.accounts ? prev : current),
    communityData[0] || { name: "N/A", accounts: 0 },
  );

  const monthlyData = analytics.monthlyData || [
    { name: "Jan", collections: 45000, loans: 20000 },
    { name: "Feb", collections: 52000, loans: 25000 },
    { name: "Mar", collections: 48000, loans: 22000 },
    { name: "Apr", collections: 70000, loans: 30000 },
    { name: "May", collections: 85000, loans: 40000 },
    { name: "Jun", collections: 95000, loans: 45000 },
  ];

  const agentPerformanceData = analytics.agentPerformanceData || [
    { name: "Jonathan C.", amount: 85000, transactions: 142 },
    { name: "Sarah P.", amount: 92000, transactions: 156 },
    { name: "Kweku B.", amount: 45000, transactions: 89 },
    { name: "Elizabeth O.", amount: 110000, transactions: 210 },
  ];

  const creditScoreData = analytics.creditScoreData || [
    { name: "Excellent", value: 35 },
    { name: "Good", value: 45 },
    { name: "Fair", value: 15 },
    { name: "Poor", value: 5 },
  ];

  const COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"];
  const peakHour = analytics.peakHour || "10:00 AM - 12:00 PM";
  const busiestDay = analytics.busiestDay || "Friday";

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Modals */}
      {isFrozenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 pb-20 md:pb-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Frozen Agents Directory
                  </h2>
                  <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">
                    Immediate Review Required
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFrozenModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                    <th className="pb-4">Agent</th>
                    <th className="pb-4">Risk Reason</th>
                    <th className="pb-4">Cause of Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {frozenAgents.map((ag) => (
                    <tr key={ag.agentId} className="group">
                      <td className="py-6">
                        <div className="font-bold text-slate-800">
                          {ag.agentName}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 tracking-widest">
                          ID: {ag.agentId}
                        </div>
                      </td>
                      <td className="py-6 text-sm font-medium text-slate-600 italic px-4">
                        {ag.reason}
                      </td>
                      <td className="py-6">
                        <button
                          onClick={() => handleUnfreeze(ag.agentId)}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all">
                          Quick Unfreeze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isLoansModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 pb-20 md:pb-6">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Loan Approval Pipeline
                  </h2>
                  <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">
                    Eligibility & Interest Analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLoansModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                    <th className="pb-4 px-2">Applicant</th>
                    <th className="pb-4 px-2">Financials</th>
                    <th className="pb-4 px-2">Repayment Details</th>
                    <th className="pb-4 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingLoans.map((loan) => {
                    const principal = loan.principalAmount || 0;
                    const rate = loan.interestRate || 0;
                    const interestAmount = (principal * rate) / 100;
                    const totalRepayment = principal + interestAmount;
                    return (
                      <tr
                        key={loan.id}
                        className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 px-2">
                          <div className="font-bold text-slate-800">
                            {loan.clientName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${loan.creditScore >= 700 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                              Score: {loan.creditScore}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Rating: {loan.eligibility}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 px-2">
                          <div className="text-sm font-black text-slate-900 tracking-tight">
                            GH₵ {(principal || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase italic">
                            Rate: {rate}% Interest
                          </div>
                        </td>
                        <td className="py-6 px-2">
                          <div className="text-sm font-black text-violet-600">
                            GH₵ {(totalRepayment || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Method: {loan.method || "Standard"}
                          </div>
                        </td>
                        <td className="py-6 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDeclineLoan(loan.id)}
                              className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
                              Decline
                            </button>
                            <button
                              onClick={() => handleApproveLoan(loan.id)}
                              className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-violet-100">
                              Approve Loan
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isWithdrawalsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 pb-20 md:pb-6">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Pending Withdrawals
                  </h2>
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                    Review & Approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawalsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                    <th className="pb-4 px-2">Client Details</th>
                    <th className="pb-4 px-2">Account No</th>
                    <th className="pb-4 px-2">Amount</th>
                    <th className="pb-4 px-2">Agent</th>
                    <th className="pb-4 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-2">
                        <div className="font-bold text-slate-800">
                          {withdrawal.clientName || "Unknown Client"}
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <div className="font-medium text-slate-600">
                          {withdrawal.accountNumber}
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <div className="text-sm font-black text-amber-600">
                          GH₵ {(withdrawal.amount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <div className="text-xs font-bold text-slate-600">
                          {withdrawal.agentName}
                        </div>
                      </td>
                      <td className="py-6 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              handleDeclineWithdrawal(withdrawal.id)
                            }
                            className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              handleApproveWithdrawal(withdrawal.id)
                            }
                            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-amber-100">
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingWithdrawals.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-slate-500 font-medium">
                        No pending withdrawals at the moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 pb-20 md:pb-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-violet-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Export Report
                  </h2>
                  <p className="text-sm font-bold text-violet-500 uppercase tracking-widest">
                    Select Timeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full pl-4 pr-3 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full pl-4 pr-3 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleExportDeepReport}
                disabled={exportingReport || !exportStartDate || !exportEndDate}
                className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                {exportingReport ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Generating...
                  </>
                ) : (
                  <>
                    <FileText size={20} /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Report & Analytics
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Comprehensive operational intelligence and financial growth
            tracking.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-violet-700 transition-all flex items-center gap-2">
            <FileText size={16} /> Export Deep Report
          </button>
        </div>
      </header>

      {/* --- SECTION: RISK & CONTROL --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <button
          onClick={() => setIsFrozenModalOpen(true)}
          className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-row items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-rose-100 hover:scale-[1.02] transition-all cursor-pointer text-left w-full group">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">
              Frozen Agents
            </p>
            <p className="text-3xl font-black text-rose-700 flex items-baseline gap-2">
              {frozenAgents.length}{" "}
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest opacity-80">
                Requires Review
              </span>
            </p>
          </div>
        </button>

        <button
          onClick={() => setIsWithdrawalsModalOpen(true)}
          className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex flex-row items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-amber-100 hover:scale-[1.02] transition-all cursor-pointer text-left w-full group">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
              Pending Withdrawals
            </p>
            <p className="text-3xl font-black text-amber-700 flex items-baseline gap-2">
              {pendingWithdrawals.length}{" "}
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest opacity-80">
                Awaiting Approval
              </span>
            </p>
          </div>
        </button>

        <button
          onClick={() => setIsLoansModalOpen(true)}
          className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-row items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-blue-100 hover:scale-[1.02] transition-all cursor-pointer text-left w-full group">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
              Pending Loans
            </p>
            <p className="text-3xl font-black text-blue-700 flex items-baseline gap-2">
              {pendingLoans.length}{" "}
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest opacity-80">
                Awaiting Approval
              </span>
            </p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* --- SECTION: HIGH-LEVEL KPIs --- */}
        <div className="lg:col-span-8 grid grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Collections
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-3">
              GH₵ {(analytics.totalCollections || 0).toLocaleString()}
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                <TrendingUp size={14} /> +18.4%
              </span>
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Active Clients
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              {analytics.totalClients}{" "}
              <span className="text-sm font-bold text-slate-400 uppercase">
                Customers
              </span>
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <Landmark size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Average Loan Size
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight">
              GH₵ 4,250
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Average Repayment Time
            </p>
            <p className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              14{" "}
              <span className="text-sm font-bold text-slate-400 uppercase">
                Weeks
              </span>
            </p>
          </div>
        </div>

        {/* --- SECTION: TOP LOCATION & TIME INSIGHTS --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-violet-600 text-white p-8 rounded-[2rem] shadow-xl shadow-cyan-200/20 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <MapPin size={24} className="text-white" />
              </div>
              <span className="px-3 py-1 bg-white/10 text-xs font-black uppercase tracking-widest rounded-full border border-white/20">
                Top Community
              </span>
            </div>
            <p className="text-[10px] font-bold text-violet-200 uppercase tracking-widest mb-1 relative z-10">
              Highest Active Accounts
            </p>
            <p className="text-5xl font-black tracking-tighter mb-2 relative z-10 group-hover:scale-105 transition-transform origin-left duration-500">
              {topLocation.name}
            </p>
            <p className="text-sm font-medium text-violet-200 relative z-10 flex items-center gap-2">
              <span className="font-black text-white">
                {topLocation.accounts}
              </span>{" "}
              Active Accounts yield.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Peak Collection Hours
              </p>
              <p className="text-lg font-black text-slate-800 tracking-tight">
                {peakHour}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Busiest Work Day
              </p>
              <p className="text-lg font-black text-slate-800 tracking-tight">
                {busiestDay}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* --- SECTION: MONTHLY GROWTH CHART --- */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <TrendingUp className="text-violet-600" /> Monthly Growth
              Trajectory
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient
                    id="colorCollections"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                  tickFormatter={(value) => `GH₵ ${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    fontWeight: 900,
                    color: "#1e293b",
                    marginBottom: "0.5rem",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: 700,
                    paddingTop: "20px",
                  }}
                />
                <Area
                  type="monotone"
                  name="Total Collections"
                  dataKey="collections"
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorCollections)"
                />
                <Area
                  type="monotone"
                  name="Loans Disbursed"
                  dataKey="loans"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorLoans)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- SECTION: AGENT PERFORMANCE --- */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <BarChart3 className="text-emerald-600" /> Agent Performance
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={agentPerformanceData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `GH₵ ${value / 1000}k`}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#1e293b", fontWeight: 900 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "12px",
                    fontWeight: 700,
                    paddingTop: "10px",
                  }}
                />
                <Bar
                  name="Total Collected (GH₵)"
                  dataKey="amount"
                  fill="#10b981"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                />
                <Bar
                  name="Transaction Count"
                  dataKey="transactions"
                  fill="#e2e8f0"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- SECTION: CLIENT SCORE ANALYSIS --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
            <Target className="text-blue-600" /> Client Credit Distribution
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            A comprehensive breakdown of the client base categorized by their
            operational credit scores. This metric is crucial for defining risk
            exposure.
          </p>

          <div className="space-y-4">
            {creditScoreData.map((entry, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700">
                    {entry.name} Rating
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {entry.value}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${entry.value}%`,
                      backgroundColor: COLORS[index],
                    }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-80 w-full flex justify-center border-l border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={creditScoreData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none">
                {creditScoreData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontWeight: 900 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalytics;
