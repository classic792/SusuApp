import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Landmark,
  ReceiptText,
  Users,
  UserCheck,
  BookOpen,
  ShieldCheck,
  Search,
  FilterX,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import ClientAccountManagement from "./ClientAccountManagement.jsx";
import AgentManagement from "./AgentManagement.jsx";
import ReportAnalytics from "./ReportAnalytics.jsx";
import api from "../services/api";
import authService from "../services/authService";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("home");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await api.get("/admin/corporate-analysis");
        setStatsData(statsRes.data);

        // Fetch transactions
        const transRes = await api.get("/admin/transactions/overview");
        setTransactions(transRes.data);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === "home") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeView]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", id: "home", icon: LayoutDashboard },
    { name: "Client / Account Management", id: "accounts", icon: BookOpen },
    { name: "Collector / Agent Management", id: "agents", icon: UserCheck },
    { name: "Report & Analytics", id: "reports", icon: Landmark },
  ];

  const stats = statsData
    ? [
      // {
      //   title: "Agent Balance",
      //   value: `GH₵ ${(statsData.totalAgentFloatBalance ?? 0).toLocaleString()}`,
      //   icon: Wallet,
      //   color: "text-emerald-600",
      //   bg: "bg-emerald-50",
      // },
      {
        title: "Total Client Balance",
        value: `GH₵ ${(statsData.totalClientBalance ?? 0).toLocaleString()}`,
        icon: CreditCard,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Total Loans",
        value: `GH₵ ${(statsData.totalLoanBalanceRemaining ?? 0).toLocaleString()}`,
        icon: Landmark,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        title: "Active Loans",
        value: (statsData.totalLoansActive ?? 0).toString(),
        icon: ReceiptText,
        color: "text-rose-600",
        bg: "bg-rose-50",
      },
      {
        title: "Active Clients",
        value: (statsData.totalClients ?? 0).toString(),
        icon: Users,
        color: "text-violet-600",
        bg: "bg-violet-50",
      },
      {
        title: "Active Agents",
        value: (statsData.totalAgents ?? 0).toString(),
        icon: UserCheck,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
    ]
    : [];

  const formattedTransactions = [...(transactions || [])].reverse().map((tx) => ({
    id: `TX-${tx.id}`,
    agent: tx.agentName || `Agent #${tx.agentId}`,
    client: tx.clientName || `Account #${tx.accountId}`,
    accountNumber: tx.accountNumber,
    status: "Completed",
    date: tx.transactionDate
      ? new Date(tx.transactionDate).toLocaleString()
      : "N/A",
    amount: `GH₵ ${parseFloat(tx.amount || 0).toFixed(2)}`,
    type: tx.type === "Susu Collection" ? "Collections" : (tx.type === "Loan Grant" ? "Loans" : (tx.type || (tx.entryType === "credit" ? "Collections" : "Withdrawal"))),
    category: "success",
  }));

  const filteredTransactions = formattedTransactions.filter((tx) => {
    const matchesTab = activeTab === "All" || tx.type === activeTab;
    const matchesSearch =
      tx.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.accountNumber &&
        tx.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderView = () => {
    switch (activeView) {
      case "accounts":
        return <ClientAccountManagement />;
      case "agents":
        return <AgentManagement />;
      case "reports":
        return <ReportAnalytics />;

      case "home":
      default:
        return (
          <>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                  Monitor real-time performance and financial health across all
                  regions.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                    Today
                  </span>
                  <span className="text-sm font-black text-slate-700">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group">
                    <div
                      className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      {stat.title}
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-white space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    Recent Transactions
                    <span className="text-xs font-bold bg-violet-100 text-violet-600 px-3 py-1 rounded-full">
                      {filteredTransactions.length} Total
                    </span>
                  </h2>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search
                        size={18}
                        className="text-slate-400 group-focus-within:text-violet-500 transition-colors"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Search agent, recipient, or date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
                  {["All", "Loans", "Repayment", "Collections"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab
                        ? "bg-white text-violet-600 shadow-md ring-1 ring-violet-100"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        Agent
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        Client
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        Type
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                        Amount
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                        Status
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-black text-xs">
                                {tx.agent.includes("#")
                                  ? tx.agent.split("#")[1]
                                  : "A"}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">
                                  {tx.agent}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                  Field Agent
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm italic tracking-tight">
                                {tx.client}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {tx.accountNumber} • {tx.date}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.type === "Loans"
                                ? "bg-amber-100 text-amber-700"
                                : tx.type === "Repayment"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                                }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-black text-slate-900 text-sm text-right whitespace-nowrap">
                            {tx.amount}
                          </td>
                          <td className="px-6 py-6 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${tx.category === "success"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${tx.category === "success" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <button className="p-2 text-slate-300 hover:text-violet-600 transition-colors">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                              <FilterX size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-700">
                              No results found
                            </h3>
                            <p className="text-slate-400 font-medium">
                              Try adjusting your search or filters to find what
                              you're looking for.
                            </p>
                            <button
                              onClick={() => {
                                setActiveTab("All");
                                setSearchQuery("");
                              }}
                              className="mt-4 px-6 py-2.5 bg-white border border-slate-200 text-violet-600 font-black text-sm rounded-xl hover:shadow-md transition-all">
                              Reset All Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  if (loading && activeView === "home") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-violet-600">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-black italic text-sm">
            CP
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-800 uppercase italic">
            Collector<span className="text-violet-600">Pro</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 w-72 h-screen bg-white border-r border-slate-200 
        transition-transform duration-300 ease-in-out z-[70]
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        flex flex-col p-6 shrink-0
      `}>
        <div className="flex items-center justify-between mb-10">
          <div
            className="flex items-center gap-3 text-violet-600 cursor-pointer"
            onClick={() => {
              setActiveView("home");
              setIsSidebarOpen(false);
            }}>
            <div className="w-10 h-10 bg-violet-600 rounded-xl shadow-lg shadow-violet-200 flex items-center justify-center text-white font-black italic">
              CP
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800 uppercase italic">
              Collector<span className="text-violet-600">Pro</span> Admin
            </span>
          </div>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${activeView === item.id
                ? "bg-violet-600 text-white shadow-xl shadow-violet-100 ring-4 ring-violet-50"
                : "text-slate-500 hover:bg-slate-50 hover:text-violet-600"
                }`}>
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 lg:ml-72 max-w-7xl mx-auto w-full mt-16 lg:mt-0 transition-all duration-300">
        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;
