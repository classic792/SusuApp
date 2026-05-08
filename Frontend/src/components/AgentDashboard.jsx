import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, LayoutDashboard, Loader2 } from "lucide-react";
import ActionGrid from "./ActionGrid";
import MakeRepayment from "./MakeRepayment";
import GrantLoans from "./GrantLoans";
import AgentHistory from "./AgentHistory";
import SusuCollection from "./SusuCollection";
import AccountRegistration from "./AccountRegistration";
import api from "../services/api";
import authService from "../services/authService";

// --- MAIN COMPONENT ---

const AgentDashboard = () => {
  const [activeView, setActiveView] = useState("home");
  const [transactions, setTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user profile
        const profileRes = await api.get("/auth/me");
        setUserProfile(profileRes.data);

        // Fetch transaction history
        const transRes = await api.get("/transactions");
        console.log("Transactions: ", transRes.data);
        setTransactions(transRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // --- LOCATION TRACKING LOGIC ---
    let locationInterval;

    const updateLocation = async () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post("/agent/location", { latitude, longitude });
            console.log(`Location updated: ${latitude}, ${longitude}`);
          } catch (err) {
            console.error("Failed to update location on backend:", err);
          }
        },
        (error) => {
          console.error("Error obtaining geolocation:", error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    };

    // Initial update
    updateLocation();

    // Periodic updates every 60 seconds
    locationInterval = setInterval(updateLocation, 60000);

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const miniHistory = Array.isArray(transactions)
    ? transactions.slice(0, 3).map((t) => ({
        date: t.transactionDate
          ? new Date(t.transactionDate).toLocaleString()
          : "N/A",
        description:
          t.description ||
          `${t.entryType === "credit" ? "Deposit" : "Withdrawal"}`,
        clientName: t.clientName || "Unknown Client",
        accountNumber: t.accountNumber || "N/A",
        type:
          t.type ||
          (t.entryType === "credit" ? "Susu Collection" : "Repayment"),
        amount:
          t.entryType === "debit"
            ? -Math.abs(parseFloat(t.amount || 0))
            : parseFloat(t.amount || 0),
        status: t.status,
      }))
    : null;

  // const miniHistory = (transactions || []).slice(0, 3).map((t) => ({
  //   date: t.transactionDate
  //     ? new Date(t.transactionDate).toLocaleString()
  //     : "N/A",
  //   description:
  //     t.description || `${t.entryType === "credit" ? "Deposit" : "Withdrawal"}`,
  //   clientName: t.clientName || "Unknown Client",
  //   accountNumber: t.accountNumber || "N/A",
  //   type:
  //     t.type || (t.entryType === "credit" ? "Susu Collection" : "Repayment"),
  //   amount:
  //     t.entryType === "debit"
  //       ? -Math.abs(parseFloat(t.amount || 0))
  //       : parseFloat(t.amount || 0),
  //   status: t.status,
  // }));

  const formattedTransactions = Array.isArray(transactions)
    ? transactions.map((t) => ({
        date: t.transactionDate
          ? new Date(t.transactionDate).toLocaleString()
          : "N/A",
        description:
          t.description ||
          `${t.entryType === "credit" ? "Cash Deposit" : "Cash Withdrawal"}`,
        clientName: t.clientName || "Unknown Client",
        accountNumber: t.accountNumber || "N/A",
        type:
          t.type ||
          (t.entryType === "credit" ? "Susu Collection" : "Withdrawal"),
        amount:
          t.entryType === "debit"
            ? -Math.abs(parseFloat(t.amount || 0)) // Withdrawals are negative
            : parseFloat(t.amount || 0),
        status: t.status,
      }))
    : null;

  // const formattedTransactions = (transactions || []).map((t) => ({
  //   date: t.transactionDate
  //     ? new Date(t.transactionDate).toLocaleString()
  //     : "N/A",
  //   description:
  //     t.description ||
  //     `${t.entryType === "credit" ? "Cash Deposit" : "Cash Withdrawal"}`,
  //   clientName: t.clientName || "Unknown Client",
  //   accountNumber: t.accountNumber || "N/A",
  //   type:
  //     t.type || (t.entryType === "credit" ? "Susu Collection" : "Withdrawal"),
  //   amount:
  //     t.entryType === "debit"
  //       ? -Math.abs(parseFloat(t.amount || 0)) // Withdrawals are negative
  //       : parseFloat(t.amount || 0),
  //   status: t.status,
  // }));

  const handleActionComplete = async () => {
    setActiveView("home");
    // Refresh profile to update progress and transactions to update history count
    // Added cache-buster to ensure we get the latest calculated stats from backend
    try {
      const [profileRes, transRes] = await Promise.all([
        api.get(`/auth/me?t=${Date.now()}`),
        api.get("/transactions"),
      ]);
      setUserProfile(profileRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    }
  };

  const renderView = () => {
    const remainingLimit =
      (userProfile?.dailyLimit || 0) - (userProfile?.dailyCollected || 0);

    switch (activeView) {
      case "collection":
        return (
          <SusuCollection
            onComplete={handleActionComplete}
            remainingLimit={remainingLimit}
          />
        );
      case "register":
        return <AccountRegistration onComplete={handleActionComplete} />;
      case "repayment":
        return (
          <MakeRepayment
            onComplete={handleActionComplete}
            remainingLimit={remainingLimit}
          />
        );
      case "loan":
        return <GrantLoans onComplete={handleActionComplete} />;
      case "history":
        return (
          <AgentHistory
            items={formattedTransactions}
            onBack={() => setActiveView("home")}
          />
        );
      default:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-violet-600 p-8 rounded-3xl text-white shadow-xl shadow-violet-200">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-1">
                  Welcome back,{" "}
                  {userProfile?.firstName || userProfile?.lastName || "Agent"}
                </h2>
                <p className="text-violet-100 opacity-90 font-medium italic">
                  Ready to collect some savings today?
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
                    Transactions
                  </p>
                  <p className="text-2xl font-black">{transactions.length}</p>
                </div>
                <div className="w-px bg-violet-400/30"></div>
                <div className="text-center">
                  <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
                    Daily Progress
                  </p>
                  <p className="text-2xl font-black">
                    GH₵ {userProfile?.dailyCollected?.toLocaleString() || "0"} /{" "}
                    {userProfile?.dailyLimit?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div className="w-px bg-violet-400/30"></div>
                <div className="text-center">
                  <p className="text-xs uppercase font-bold opacity-70 tracking-widest mb-1">
                    Status
                  </p>
                  <p
                    className={`text-2xl font-black ${userProfile?.status === "FROZEN" ? "text-rose-300" : ""}`}>
                    {userProfile?.status || "Active"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              {userProfile?.status === "FROZEN" && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-rose-200">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
                    <LogOut size={32} className="rotate-90" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    Account Frozen
                  </h3>
                  <p className="text-slate-500 max-w-md font-medium">
                    You have reached your daily limit or your account has been
                    administrative locked. Please contact your administrator to
                    unfreeze your account.
                  </p>
                </div>
              )}
              <ActionGrid
                onAction={(id) =>
                  userProfile?.status !== "FROZEN" && setActiveView(id)
                }
                miniHistory={miniHistory}
              />
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveView("home")}>
            <div className="bg-violet-600 p-2 rounded-lg group-hover:rotate-6 transition-transform">
              <img src="logo.png" alt="logo" className="w-10 h-10" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
              Collector<span className="text-violet-600">Pro</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 leading-tight">
                {userProfile?.firstName} {userProfile?.lastName}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {userProfile?.role}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
              <User size={20} className="text-slate-600" />
            </div>
            <button
              className="ml-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              onClick={handleLogout}
              title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeView !== "home" && activeView !== "history" && (
          <button
            onClick={() => setActiveView("home")}
            className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors group cursor-pointer">
            <div className="p-1 rounded-md bg-white border border-slate-200 group-hover:border-violet-200 group-hover:shadow-sm transition-all">
              <LayoutDashboard size={16} />
            </div>
            Back to Dashboard
          </button>
        )}
        {renderView()}
      </main>

      {/* Mobile Footer Navigation */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs font-medium text-slate-400">
        &copy; 2026 Collector Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default AgentDashboard;
