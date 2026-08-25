"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ShieldAlert, Eye, EyeOff, Loader2, User, Lock, Mail, CheckCircle2, Shield, ChevronRight } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const isUsernameValid = username.length > 3;
  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 8;

  const passwordStrength = password.length === 0 ? "" : password.length < 8 ? "Weak" : password.length < 12 ? "Medium" : "Strong";
  const strengthColor = passwordStrength === "Strong" ? "text-emerald-500" : passwordStrength === "Medium" ? "text-yellow-500" : "text-red-500";
  const bars = passwordStrength === "Strong" ? 4 : passwordStrength === "Medium" ? 2 : passwordStrength === "Weak" ? 1 : 0;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex-col items-center justify-center px-4 py-4">
      
      {/* Background Grid & Red Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,51,51,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,51,51,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
      
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px] z-0 pointer-events-none"></div>

      {/* TOP HEADER */}
      <div className="relative z-10 flex flex-col items-center mb-3 w-full">
        <div className="flex items-center space-x-2 mb-2">
          <div className="border border-red-500 p-0.5 px-1.5 rounded-md bg-red-500/10">
            <span className="text-red-500 font-mono font-bold text-sm">{`>_`}</span>
          </div>
          <span className="text-xl font-bold tracking-widest text-white">
            DEVOPS <span className="text-red-500">ARENA</span>
          </span>
        </div>
        
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded border border-red-500/30 bg-red-500/5 text-red-500 text-[9px] font-mono tracking-widest uppercase mb-2">
          <User className="w-2.5 h-2.5" />
          <span>NEW OPERATOR</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-0.5 tracking-tight text-center">
          Create <span className="text-red-500">Credentials</span>
        </h2>
        <p className="text-slate-400 text-xs text-center">Register to join the training environment.</p>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center relative z-10 gap-4">
        
        {/* LEFT COLUMN: STATS */}
        <div className="hidden md:flex flex-col space-y-3 flex-1 max-w-[200px]">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">[ SYSTEM STATUS ]</div>
            <div className="text-[12px] font-bold text-red-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> ONLINE
            </div>
          </div>
          
          <div className="h-px bg-white/5 w-full"></div>
          
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">[ ARENA NETWORK ]</div>
            <div className="text-[12px] font-bold text-red-500 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-2" /> SECURE
            </div>
          </div>
          
          <div className="h-px bg-white/5 w-full"></div>
          
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">[ ENCRYPTION ]</div>
            <div className="text-[12px] font-bold text-red-500 flex items-center">
              <Lock className="w-3.5 h-3.5 mr-2" /> AES-256
            </div>
          </div>

          <div className="mt-12 space-y-2 font-mono text-[10px]">
            <div className="text-slate-500">{`> initializing secure channel...`}</div>
            <div className="text-slate-500">{`> verifying operator node...`}</div>
            <div className="text-red-500 font-bold">{`> connection established`}</div>
          </div>
        </div>

        {/* CENTER COLUMN: FORM */}
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl p-5 shadow-2xl shrink-0 relative">
           
           {/* Decorative corner lines */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-500/50 rounded-tl-2xl"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-500/50 rounded-br-2xl"></div>

           <form onSubmit={handleRegister} className="space-y-3">
             {error && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded flex items-start text-xs">
                 <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
                 <span>{error}</span>
               </div>
             )}
             
             <div>
               <label className="flex items-center text-slate-300 mb-2 text-xs font-bold uppercase tracking-wider font-mono">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> OPERATOR HANDLE (USERNAME)
               </label>
               <div className="relative flex items-center">
                 <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/10 bg-[#111111] flex items-center justify-center rounded-l-md">
                   <User className="w-4 h-4 text-red-500" />
                 </div>
                 <input 
                    type="text" 
                    className="w-full bg-[#111111] text-slate-200 rounded-md border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors text-sm pl-14 pr-10 h-10 placeholder:text-slate-600" 
                    placeholder="operator_one"
                   value={username} 
                   onChange={e => setUsername(e.target.value)} 
                   required 
                   disabled={loading || success}
                 />
                 {isUsernameValid && <CheckCircle2 className="absolute right-4 w-5 h-5 text-emerald-500" />}
               </div>
             </div>

             <div>
               <label className="flex items-center text-slate-300 mb-1 text-xs font-bold uppercase tracking-wider font-mono">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> OPERATOR IDENTITY (EMAIL)
               </label>
               <div className="relative flex items-center">
                 <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/10 bg-[#111111] flex items-center justify-center rounded-l-md">
                   <Mail className="w-4 h-4 text-red-500" />
                 </div>
                 <input 
                    type="email" 
                    className="w-full bg-[#111111] text-slate-200 rounded-md border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors text-sm pl-14 pr-10 h-10 placeholder:text-slate-600" 
                    placeholder="operator@devopsarena.local"
                   value={email} 
                   onChange={e => setEmail(e.target.value)} 
                   required 
                   disabled={loading || success}
                 />
                 {isEmailValid && <CheckCircle2 className="absolute right-4 w-5 h-5 text-emerald-500" />}
               </div>
             </div>
             
             <div>
               <label className="flex items-center text-slate-300 mb-1 text-xs font-bold uppercase tracking-wider font-mono">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span> ACCESS CODE (PASSWORD)
               </label>
               <div className="relative flex items-center">
                 <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/10 bg-[#111111] flex items-center justify-center rounded-l-md">
                   <Lock className="w-4 h-4 text-red-500" />
                 </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-[#111111] text-slate-200 rounded-md border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors text-sm pl-14 pr-10 h-10 placeholder:text-slate-600 tracking-widest" 
                    placeholder="•••••••••••••"
                   value={password} 
                   onChange={e => setPassword(e.target.value)} 
                   required 
                   disabled={loading || success}
                 />
                 <button 
                   type="button" 
                   className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
                   onClick={() => setShowPassword(!showPassword)}
                   tabIndex={-1}
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
               
               <div className="mt-2 flex items-center ml-14">
                  <Shield className="w-3.5 h-3.5 text-red-500 mr-2" />
                  <span className="text-[10px] text-slate-400 mr-3">Strength: <span className={strengthColor}>{passwordStrength || "None"}</span></span>
                  <div className="flex space-x-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-sm transition-colors ${i <= bars ? (strengthColor.replace('text-', 'bg-')) : 'bg-white/10'}`}></div>
                    ))}
                  </div>
               </div>
             </div>

              <button 
                type="submit" 
                disabled={loading || success}
                className={`w-full h-11 font-bold rounded-lg transition-all mt-4 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-lg
                  ${success ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 
                    'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                  }`}
             >
               {success ? (
                 <>CREDENTIALS CREATED <CheckCircle2 className="w-5 h-5 ml-2" /></>
               ) : loading ? (
                 <>INITIALIZING... <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
               ) : (
                 <><span className="font-mono font-normal mr-2">{`>_`}</span> CREATE CREDENTIALS <ChevronRight className="w-5 h-5 ml-2" /></>
               )}
             </button>
           </form>
        </div>

        {/* RIGHT COLUMN: RADAR */}
        <div className="hidden lg:flex flex-1 max-w-[250px] justify-center items-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Radar circles */}
            <div className="absolute inset-0 border border-white/5 rounded-full"></div>
            <div className="absolute inset-4 border border-white/5 rounded-full"></div>
            <div className="absolute inset-12 border border-white/10 rounded-full border-dashed"></div>
            <div className="absolute inset-20 border border-red-500/20 rounded-full"></div>
            
            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-white/5"></div>
            <div className="absolute h-full w-px bg-white/5"></div>
            
            {/* Center icon */}
            <div className="relative z-10 w-24 h-24 flex items-center justify-center">
              <Shield className="w-full h-full text-red-500/20 absolute inset-0 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
              <span className="text-red-500 font-mono font-bold text-3xl relative z-10">{`>_`}</span>
            </div>
            
            {/* Scanning line */}
            <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-red-500/20 to-transparent origin-top-left animate-[spin_4s_linear_infinite]" style={{ borderTop: '2px solid rgba(239,68,68,0.8)' }}></div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-8 text-center">
        <p className="text-slate-400 text-sm">
          Already an operator? <Link href="/login" className="text-red-500 hover:text-red-400 hover:underline transition-all font-medium">Sign in to your account</Link> <ChevronRight className="w-3 h-3 inline text-red-500" />
        </p>
      </div>

    </div>
  );
}
