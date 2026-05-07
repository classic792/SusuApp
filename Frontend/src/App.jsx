import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AgentDashboard from "./components/AgentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";
import Toaster from "./components/Toaster";

function App() {
  return (
    <Router>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          
          <Route 
            path="/agent" 
            element={
              <ProtectedRoute role="AGENT">
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- LOGIN COMPONENT ---
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    const user = authService.getCurrentUser();
    if (user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/agent");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = await authService.login(email, password);
      const role = data.role ? data.role.toUpperCase().replace("ROLE_", "") : "";
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "AGENT") {
        navigate("/agent");
      } else {
        setError("User role not recognized. Contact Administrator.");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a1c23] to-[#4f46e5] p-4">
      <form 
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md text-center" 
        onSubmit={handleSubmit}
      >
        <h2 className="text-[#4f46e5] mb-2 text-3xl font-bold tracking-tight">Collector Pro</h2>
        <p className="text-gray-600 mb-6 font-medium">Please sign in to your account</p>

        {error && <div className="mb-4 text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{error}</div>}

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3.5 my-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3.5 my-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-3.5 ${loading ? 'bg-gray-400' : 'bg-[#4f46e5]'} text-white rounded-lg font-bold mt-4 cursor-pointer hover:bg-[#4338ca] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default App;
