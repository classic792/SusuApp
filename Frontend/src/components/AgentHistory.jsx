import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  History,
  CreditCard,
  Wallet,
  Landmark,
  FilterX,
  TrendingDown,
} from "lucide-react";

const AgentHistory = ({ items, onBack }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "All", label: "General", icon: History },
    { id: "Repayment", label: "Repayment", icon: CreditCard },
    { id: "Loan Grant", label: "Loans", icon: Landmark },
    { id: "Susu Collection", label: "Susu", icon: Wallet },
    { id: "Withdrawal", label: "Withdrawal", icon: TrendingDown },
  ];

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === "All" || item.type === activeFilter;
    const matchesSearch =
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.clientName &&
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.accountNumber &&
        item.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section with Back Button and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 hover:border-violet-200 hover:bg-violet-50 rounded-xl transition-all cursor-pointer shadow-sm group">
            <ArrowLeft
              size={20}
              className="text-slate-600 group-hover:text-violet-600 group-hover:-translate-x-0.5 transition-all"
            />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Transaction History
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Track and manage all your field activities
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-slate-400 group-focus-within:text-violet-500 transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search by name, date or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60 w-fit">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-white text-violet-600 shadow-md shadow-violet-100 ring-1 ring-violet-100"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}>
              <Icon size={16} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Date & Time
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Account Name/Number
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-800">
                      <div className="flex flex-col">
                        <span>{item.clientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">
                          {item.accountNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        {item.description}
                        {item.status === "PENDING" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          item.type === "Susu Collection"
                            ? "bg-violet-100 text-violet-700"
                            : item.type === "Repayment"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.type === "Loan Grant"
                                ? "bg-amber-100 text-amber-700"
                                : item.type === "Withdrawal"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                        }`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.type === "Susu Collection"
                              ? "bg-violet-500"
                              : item.type === "Repayment"
                                ? "bg-emerald-500"
                                : item.type === "Loan Grant"
                                  ? "bg-amber-500"
                                  : item.type === "Withdrawal"
                                    ? "bg-rose-500"
                                    : "bg-slate-400"
                          }`}></span>
                        {item.type}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-5 text-sm font-black text-right whitespace-nowrap ${item.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.amount > 0 ? "+" : ""}
                      {item.amount.toLocaleString("en-GH", {
                        style: "currency",
                        currency: "GHS",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                        <FilterX size={28} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold text-lg">
                          No transactions found
                        </p>
                        <p className="text-slate-400 text-sm font-medium">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveFilter("All");
                          setSearchQuery("");
                        }}
                        className="mt-2 px-4 py-2 text-sm font-bold text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentHistory;
