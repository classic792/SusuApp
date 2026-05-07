import React, { useState } from 'react';

const LoginForms = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a1c23] to-[#4f46e5] p-4">
      <form 
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md" 
        onSubmit={handleSubmit}
      >
        <h2 className="text-[#4f46e5] mb-2 text-3xl font-black tracking-tight text-center">Collector Login</h2>
        <p className="text-gray-500 mb-8 font-medium text-center">Enter your credentials to access the dashboard</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              placeholder="agent@savings.com" 
              className="p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full p-4 bg-[#4f46e5] text-white rounded-xl font-bold mt-8 cursor-pointer hover:bg-[#4338ca] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
        >
          Login to System
        </button>
      </form>
    </div>
  );
};

export default LoginForms;