import React, { useState, useEffect } from "react";
import {
  MapPin,
  Settings2,
  UserPlus,
  Search,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Building2,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import authService from "../services/authService";
import { notify } from "./Toaster";

// Create custom icons to avoid default image loading issues in leaflet/vite
const createCustomIcon = (active) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="
      background-color: ${active ? "#10b981" : "#f59e0b"};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const AgentManagement = () => {
  const [activeTab, setActiveTab] = useState("location");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agents, setAgents] = useState([]);
  const [globalLimit, setGlobalLimit] = useState(5000);
  const [isUpdatingGlobal, setIsUpdatingGlobal] = useState(false);
  const [individualLimits, setIndividualLimits] = useState({});
  const [agentStats, setAgentStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
    password: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === "location" || activeTab === "limit") {
      fetchAgentLocations();
    }
    if (activeTab === "limit") {
      fetchGlobalLimit();
    }
    if (activeTab === "agents") {
      fetchAgentStats();
    }
  }, [activeTab]);

  const fetchGlobalLimit = async () => {
    try {
      const res = await api.get("/admin/settings/global-limit");
      setGlobalLimit(res.data);
    } catch (err) {
      console.error("Error fetching global limit:", err);
    }
  };

  const fetchAgentStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/admin/agents/stats");
      setAgentStats(res.data);
    } catch (err) {
      console.error("Error fetching agent stats:", err);
      notify.error("Failed to load agent statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUpdateGlobalLimit = async () => {
    if (globalLimit < 0) {
      notify.error("Limit cannot be negative.");
      return;
    }
    try {
      setIsUpdatingGlobal(true);
      await api.post("/admin/settings/global-limit", { limit: globalLimit });
      notify.success("Global limit updated successfully!");
    } catch (err) {
      console.error("Error updating global limit:", err);
      notify.error("Failed to update global limit.");
    } finally {
      setIsUpdatingGlobal(false);
    }
  };

  const fetchAgentLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/agents/locations");
      setAgents(res.data);

      // Initialize individual limits state from fetched data
      const limitMap = {};
      res.data.forEach((ag) => {
        limitMap[ag.agentId] = ag.dailyLimit || 5000;
      });
      setIndividualLimits(limitMap);
    } catch (err) {
      console.error("Error fetching agent locations:", err);
      setError("Failed to load agent tracking data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/admin/agents/register", formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          firstName: "",
          lastName: "",
          otherName: "",
          email: "",
          password: "",
        });
        setActiveTab("location");
      }, 3000);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Failed to register new agent.");
    } finally {
      setLoading(false);
    }
  };

  const updateIndividualLimit = async (
    agentId,
    dailyLimit,
    withdrawalLimit,
  ) => {
    try {
      const adminId = authService.getCurrentUser()?.id;
      if (!adminId) throw new Error("Admin ID not found");

      await api.put(
        `/admin/agents/${agentId}/limits`,
        {
          dailyLimit,
          perTransactionLimit: withdrawalLimit,
        },
        {
          params: { adminId },
        },
      );
      notify.success("Limit updated successfully!");
      // Refresh locations or stats if needed
      fetchAgentLocations();
    } catch (err) {
      console.error("Limit update failed:", err);
      notify.error("Failed to update limit.");
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agentId.toString().includes(searchQuery),
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Collector / Agent Management
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Track locations, enforce operational limits, and onboard personnel.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("location")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "location"
              ? "bg-violet-600 text-white shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}>
          <MapPin size={18} /> Location Tracking
        </button>
        <button
          onClick={() => setActiveTab("limit")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "limit"
              ? "bg-violet-600 text-white shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}>
          <Settings2 size={18} /> Financial Limits
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "create"
              ? "bg-violet-600 text-white shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}>
          <UserPlus size={18} /> Register Agent
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            activeTab === "agents"
              ? "bg-violet-600 text-white shadow-violet-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}>
          <ShieldCheck size={18} /> Agents
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 md:p-10">
        {/* --- LOCATION TAB --- */}
        {activeTab === "location" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Map View */}
              <div
                className="flex-1 bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden relative"
                style={{ height: "600px" }}>
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-violet-600 w-12 h-12" />
                  </div>
                ) : (
                  <MapContainer
                    center={[4.8845, -1.7554]}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 10 }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredAgents
                      .filter(
                        (agent) =>
                          agent.latitude !== null && agent.longitude !== null,
                      )
                      .map((agent) => (
                        <Marker
                          key={agent.agentId}
                          position={[agent.latitude, agent.longitude]}
                          icon={createCustomIcon(
                            agent.currentStatus === "ACTIVE",
                          )}>
                          <Popup className="rounded-xl font-sans">
                            <div className="p-1">
                              <p className="font-black text-slate-800 text-base mb-1">
                                {agent.agentName}
                              </p>
                              <p className="text-xs font-bold text-slate-500 mb-2">
                                ID: #{agent.agentId} &bull;{" "}
                                {agent.lastLocationName}
                              </p>
                              <div
                                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-block ${agent.currentStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {agent.currentStatus}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                )}
              </div>

              {/* Sidebar List */}
              <div className="w-full md:w-96 flex flex-col gap-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                      size={20}
                      className="text-slate-400 group-focus-within:text-violet-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Field Personnel Tracking
                  </h3>
                  {loading ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-slate-300" />
                      <span className="text-xs font-bold text-slate-300">
                        Syncing Locations...
                      </span>
                    </div>
                  ) : (
                    filteredAgents.map((ag) => (
                      <div
                        key={ag.agentId}
                        className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-slate-800 tracking-tight group-hover:text-violet-600 transition-colors">
                              {ag.agentName}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                              {/* #{ag.agentId} */}
                               &bull; {ag.lastLocationName}
                            </p>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${ag.currentStatus === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                        </div>
                      </div>
                    ))
                  )}
                  {!loading && filteredAgents.length === 0 && (
                    <div className="text-center p-8 text-slate-400 text-sm font-medium">
                      No agents found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FINANCIAL LIMITS TAB --- */}
        {activeTab === "limit" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-violet-600" /> Enforcement Config
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Define transaction caps for each agent. Note: Daily collection
                  limit triggers deposit requirements.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    General Global Limit
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={globalLimit}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setGlobalLimit(isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="w-24 text-xl font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateGlobalLimit}
                  disabled={isUpdatingGlobal}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all disabled:opacity-50">
                  {isUpdatingGlobal ? "Saving..." : "Update Global"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-[2rem]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 bg-opacity-70">
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      Agent Details
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-right">
                      Daily Limit (GH₵)
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((ag) => (
                    <tr
                      key={ag.agentId}
                      className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-black">
                            {ag.agentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm tracking-tight">
                              {ag.agentName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <input
                          type="number"
                          min="0"
                          placeholder="Set Limit"
                          value={individualLimits[ag.agentId] || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setIndividualLimits({
                              ...individualLimits,
                              [ag.agentId]: isNaN(val) ? 0 : Math.max(0, val),
                            });
                          }}
                          className="w-32 px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-violet-500 text-right font-bold text-slate-700 text-sm italic"
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => {
                            const val = individualLimits[ag.agentId];
                            updateIndividualLimit(ag.agentId, val, val);
                          }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all">
                          Save Limit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CREATE AGENT TAB --- */}
        {activeTab === "create" && (
          <div className="animate-in fade-in duration-300 flex justify-center py-6">
            {!isSuccess ? (
              <form
                onSubmit={handleCreateAgent}
                className="w-full max-w-2xl bg-white p-10 rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-center w-16 h-16 bg-violet-50 text-violet-600 rounded-full mb-6 mx-auto">
                  <Building2 size={28} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-8">
                  Agent Registration Portal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-slate-700"
                      placeholder="e.g. Kwesi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-slate-700"
                      placeholder="e.g. Atta"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                    Other Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.otherName}
                    onChange={(e) =>
                      setFormData({ ...formData, otherName: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-slate-700"
                    placeholder="e.g. Kwame"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                    Email / Authentication ID{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-slate-700"
                    placeholder="agent@collectorpro.com"
                  />
                </div>

                <div className="space-y-2 mb-10">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                    Secure Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-slate-700 text-lg tracking-widest"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest relative overflow-hidden group hover:shadow-xl hover:shadow-violet-200 transition-all active:scale-[0.98] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Provision New Agent</span>
                      <div className="absolute inset-0 h-full w-0 bg-violet-700 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="w-full max-w-md bg-white p-12 rounded-[2rem] border border-emerald-200 shadow-xl shadow-emerald-50 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                  Registered!
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">
                  New agent credential generated successfully. Personnel can now
                  authenticate into the mobile collector module.
                </p>
                <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 font-mono italic">
                  ID will be visible on next sync
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- AGENTS STATS TAB --- */}
        {activeTab === "agents" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Personnel Directory
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Comprehensive overview of all registered agents and their
                  activity.
                </p>
              </div>
              <button
                onClick={fetchAgentStats}
                disabled={loadingStats}
                className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                title="Refresh Stats">
                <Loader2
                  className={loadingStats ? "animate-spin" : ""}
                  size={20}
                />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-[2rem]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 bg-opacity-70">
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      Agent
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      Reg. Date
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      Loans
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      Susu
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      Repay.
                    </th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {agentStats.map((ag) => (
                    <tr
                      key={ag.agentId}
                      className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {ag.agentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {ag.agentName}
                            </p>
                            {/* <p className="text-[10px] text-slate-400 uppercase font-bold">
                              ID: #{ag.agentId}
                            </p> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600">
                        {ag.registrationDate
                          ? new Date(ag.registrationDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-slate-700">
                        {ag.totalLoans}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-slate-700">
                        {ag.totalSusuCollections}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-slate-700">
                        {ag.totalRepayments}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ag.currentStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {ag.currentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {agentStats.length === 0 && !loadingStats && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-8 py-20 text-center text-slate-400 italic">
                        No agents found in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManagement;
