"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { TerminalSquare, ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
        // Auto login or redirect to login
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 border-2 border-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <TerminalSquare className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-wider">
            DEVOPS<span className="text-blue-500">ARENA</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Register new operator credentials</p>
        </div>

        <form onSubmit={handleRegister} className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-start text-sm">
              <ShieldAlert className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                className="w-full bg-slate-900/50 text-slate-100 rounded-lg p-3.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm" 
                placeholder="operator_one"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-slate-900/50 text-slate-100 rounded-lg p-3.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm" 
                placeholder="operator@system.local"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-900/50 text-slate-100 rounded-lg p-3.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-lg transition-all mt-4 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...</>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have credentials? <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">Initialize connection</Link>
        </p>
      </div>
    </div>
  );
}
