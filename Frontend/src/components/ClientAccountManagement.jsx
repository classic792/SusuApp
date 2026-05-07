import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  User,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Phone,
  ShieldCheck,
  Wallet,
  Star,
  ChevronRight,
  FilterX,
  UserCheck,
  Loader2,
} from "lucide-react";
import api from "../services/api";

const ClientAccountManagement = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedAccount) return;
      try {
        setHistoryLoading(true);
        const res = await api.get(
          `/transactions/account/${selectedAccount.id}`,
        );
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching account history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [selectedAccount]);

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.clientName &&
        acc.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      acc.id.toString().includes(searchQuery),
  );

  if (selectedAccount) {
    // Note: Detail view would ideally fetch full client details and transaction history for THIS account
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-7xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSelectedAccount(null)}
              className="p-3 bg-white border border-slate-200 hover:border-violet-200 hover:bg-violet-50 rounded-2xl transition-all shadow-sm group active:scale-90">
              <ArrowLeft
                size={24}
                className="text-slate-600 group-hover:text-violet-600 transition-all"
              />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                Account Portfolio
              </h2>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">
                Management Profile &bull; {selectedAccount.accountNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl font-black">
                  ACC
                </div>
                {/* <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-6">
                  Account #{selectedAccount.id}
                </h3> */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full border border-violet-100 mt-2">
                  <span className="text-xs font-black uppercase tracking-widest">
                    {selectedAccount.accountType}
                  </span>
                </div>
              </div>
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Account Number
                  </p>
                  <p className="text-base font-bold text-slate-800 font-mono italic">
                    {selectedAccount.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Client Full Name
                  </p>
                  <p className="text-base font-bold text-slate-800 italic uppercase underline decoration-violet-200 decoration-2 underline-offset-4">
                    {selectedAccount.clientName} {selectedAccount.otherName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Attached Client ID
                  </p>
                  <p className="text-base font-bold text-slate-800 italic">
                    #{selectedAccount.clientId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0 shadow-sm">
                  <Wallet size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Current Balance
                  </p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    GH₵ {selectedAccount.balance.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="hidden md:block px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">
                  Open Date
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {selectedAccount.openedDate || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                <ShieldCheck className="text-violet-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Gender
                      </p>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        {selectedAccount.gender || "Not Specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Date of Birth
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {selectedAccount.dateOfBirth || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Phone Number
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {selectedAccount.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Ghana Card Number
                      </p>
                      <p className="text-sm font-bold text-slate-700 font-mono italic">
                        {selectedAccount.ghanaCardNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <History className="text-violet-600" />
                  Transaction Ledger
                </h3>
                <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                  {history.length} Entries
                </span>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-violet-600 w-10 h-10" />
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                          Date & Reference
                        </th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                          Type
                        </th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                          Agent
                        </th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">
                                {new Date(
                                  tx.transactionDate,
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {/* <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-tighter mt-0.5">
                                REF: {tx.idempotencyKey || `TX-${tx.id}`}
                              </span> */}
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              {tx.entryType === "credit" ? (
                                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                  <TrendingUp size={14} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                                  <TrendingDown size={14} strokeWidth={3} />
                                </div>
                              )}
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${tx.entryType === "credit" ? "text-emerald-700" : "text-rose-700"}`}>
                                {tx.type ||
                                  (tx.entryType === "credit"
                                    ? "Deposit"
                                    : "Withdrawal")}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[8px] font-bold">
                                AG
                              </div>
                              <span className="text-sm font-bold text-slate-600 italic">
                                {tx.agentName || `Agent #${tx.agentId}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span
                              className={`text-sm font-black italic ${tx.entryType === "credit" ? "text-emerald-600" : "text-slate-900"}`}>
                              {tx.entryType === "credit" ? "+" : "-"} GH₵{" "}
                              {tx.amount.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold tracking-tight">
                    No transaction history found for this account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Account Management
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Manage client accounts and financial summaries.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              size={20}
              className="text-slate-400 group-focus-within:text-violet-500 transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search account no. or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-violet-600 w-12 h-12" />
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Account No.
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Client Name
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Balance
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAccount(acc)}>
                      <td className="px-8 py-6 font-mono font-bold text-violet-600 text-sm">
                        {acc.accountNumber}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">
                            {acc.clientName}
                          </span>
                          {/* <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            ID: #{acc.clientId}
                          </span> */}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            acc.accountType === "savings"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                          {acc.accountType}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 text-sm italic tracking-tight">
                        GH₵ {acc.balance.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-violet-600 hover:text-white hover:border-violet-600 hover:shadow-lg transition-all active:scale-95">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                          <FilterX size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">
                          No accounts found
                        </h3>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-4 px-6 py-2.5 bg-white border border-slate-200 text-violet-600 font-black text-sm rounded-xl hover:shadow-md transition-all">
                          Clear Search
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAccountManagement;
