import React, { useState } from "react";
import { Shield, Activity, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "../store";

export default function LoginPage() {
  const { login, navigate } = useStore();
  const [emailOrPhone, setEmailOrPhone] = useState("sakthidharan1524@gmail.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  
  // Interactive UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Form validations on client side
  const [emailOrPhoneError, setEmailOrPhoneError] = useState<string | null>(null);
  const handleIdentityConfirm = (val: string) => {
    if (!val.trim()) {
      setEmailOrPhoneError("Email or Mobile is mandated");
      return;
    }
    const isEmail = val.includes("@");
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setEmailOrPhoneError("Please enter a valid email format");
        return;
      }
    } else {
      const phoneRegex = /^\+?[0-9]{10,12}$/;
      if (!phoneRegex.test(val.replace(/\s+/g, ""))) {
        setEmailOrPhoneError("Please enter a valid 10-digit mobile");
        return;
      }
    }
    setEmailOrPhoneError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailOrPhone.trim()) {
      handleIdentityConfirm("");
      return;
    }

    setIsLoading(true);
    
    // Simulate natural authentication server call
    setTimeout(async () => {
      const ok = await login(emailOrPhone);
      setIsLoading(false);
      
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("home");
        }, 1500);
      } else {
        // Handle shake error
        setErrorMsg("Credential mismatch: The email/password combination was not recognized.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-slate-50 via-teal-50/20 to-sky-50/20 p-4 shrink-0" id="login-view">
      
      {/* 1. BACKGROUND FLOATING SHIELDS (Slow drifting cycles) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-teal-50/40 rounded-full flex items-center justify-center text-teal-200/55 animate-drift border border-teal-100/20"
            style={{
              width: `${(i + 1) * 24 + 16}px`,
              height: `${(i + 1) * 24 + 16}px`,
              top: `${(i * 15) + 10}%`,
              left: `${(i % 2 === 0 ? i * 14 : 95 - i * 16)}%`,
              animationDelay: `${i * 2}s`,
              transform: `translate3d(0, 0, 0)`
            }}
          >
            <Shield className="w-1/2 h-1/2" />
          </div>
        ))}
        
        {/* Expanding ambient rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-teal-500/5 animate-pulse-ring pointer-events-none"></div>
      </div>

      {/* 2. CORE CARD PANEL */}
      <div 
        className={`relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-teal-900/5 p-8 space-y-6 transition-all duration-300 ${shake ? "animate-shake border-red-200" : ""}`}
      >
        
        {success ? (
          /* SUCCESS STATE REDIRECT */
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-sm border border-emerald-100 animate-scale-up">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-gray-900 animate-pulse">Welcome back, Sakthi!</h2>
            <p className="text-xs text-gray-400">Secure session established. Synchronizing clinical catalogs...</p>
          </div>
        ) : (
          /* DEFAULT FORM STATE */
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Logo */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0D7377] text-white flex items-center justify-center mx-auto shadow-md">
                <Shield className="w-6.5 h-6.5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">MediTrust Private Portal</h2>
                <p className="text-xs text-gray-400">HIPAA Compliant Secure Digital Ingress</p>
              </div>
              <div className="w-10 h-0.5 bg-teal-200 mx-auto"></div>
            </div>

            {/* General API error warnings */}
            {errorMsg && (
              <div className="bg-rose-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-[#FF6B6B]">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-red-700 font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Email/Mobile field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-[#0D7377] tracking-widest uppercase block">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="name@email.com or +91 90080..."
                  value={emailOrPhone}
                  onBlur={(e) => handleIdentityConfirm(e.target.value)}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className={`w-full h-12 bg-gray-50 border rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-700/5 transition-all ${emailOrPhoneError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#0D7377]"}`}
                />
              </div>
              {emailOrPhoneError && (
                <p className="text-[10px] text-red-500 font-bold">{emailOrPhoneError}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] font-extrabold text-[#0D7377] tracking-widest uppercase block">
                  Password Credential
                </label>
                <button
                  type="button"
                  onClick={() => alert("Simulation Portal: Please enter any dummy password to log in.")}
                  className="text-[10px] font-bold text-gray-400 hover:text-[#0D7377] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secure passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-11 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-700/5 focus:border-[#0D7377] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold select-none">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-200 text-[#0D7377] focus:ring-[#0D7377]"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0D7377] hover:bg-[#14919B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-teal-900/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>

            {/* Dividers */}
            <div className="relative py-1 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase select-none">
              <div className="absolute left-0 right-0 h-[1px] bg-gray-100"></div>
              <span className="relative z-10 bg-white px-2.5">Unified Portal</span>
            </div>

            <button
              type="button"
              onClick={() => alert("Simulation Portal: SMS OTP is disabled. Use the password form.")}
              className="w-full h-12 border border-gray-200 hover:bg-gray-50 text-gray-500 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Sign In with OTP SMS
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
