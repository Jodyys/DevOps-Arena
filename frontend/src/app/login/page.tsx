"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Terminal, ShieldAlert, Eye, EyeOff, Loader2, Lock, User, Check, Server, ShipWheel, Container, Shield, ChevronRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.success) {
        localStorage.setItem("token", res.data.token);
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans relative overflow-hidden items-center justify-center">
      
      {/* Background Grid & Red Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,51,51,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,51,51,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0 pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      {/* Isometric Graphic Placeholder (Central Glow) */}
      <div className="hidden lg:block absolute left-[25%] top-[20%] w-[300px] h-[300px] opacity-20 pointer-events-none z-0">
         <div className="absolute inset-0 border-2 border-red-500/20 transform rotate-45 scale-y-50"></div>
         <div className="absolute inset-4 border-2 border-red-500/20 transform rotate-45 scale-y-50"></div>
         <div className="absolute inset-8 border-2 border-red-500/20 transform rotate-45 scale-y-50"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500/20 blur-[40px]"></div>
      </div>

      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row p-4 z-10 relative">
        
        {/* LEFT COLUMN: HERO & INFO */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center pr-6">
          
          {/* Top Branding & Hero */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-red-500 font-mono font-bold text-sm">{`>_`}</span>
              <span className="text-sm font-bold tracking-widest text-white">
                DEVOPS <span className="text-red-500">ARENA</span>
              </span>
            </div>
            
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[7px] font-mono tracking-widest uppercase mb-4">
              <span className="w-1 h-1 rounded-full bg-red-500"></span>
              <span className="text-slate-300">SYSTEM STATUS: <span className="text-red-400">ALL SYSTEMS OPERATIONAL</span></span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3 leading-[1.1] tracking-tight">
              Master the infrastructure.<br />
              Defend the systems.<br />
              <span className="text-red-500">Become the operator.</span>
            </h1>
            
            <p className="text-slate-400 text-[10px] max-w-[300px] leading-relaxed mb-6">
              A hands-on DevOps training platform where you solve real infrastructure incidents across Linux, Docker, Kubernetes, CI/CD, and DevSecOps.
            </p>
          </div>

          {/* Bottom Info Modules */}
          <div>
            {/* Status Badges Row */}
            <div className="flex space-x-2 mb-3">
              <div className="flex items-center space-x-2 border border-white/10 bg-[#0a0a0a] rounded-md px-2.5 py-1.5 min-w-[90px]">
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                <div>
                  <div className="text-[6px] font-mono text-slate-400 uppercase tracking-wider">KUBERNETES</div>
                  <div className="text-[8px] font-bold text-white uppercase tracking-wider mt-0.5">READY</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-white/10 bg-[#0a0a0a] rounded-md px-2.5 py-1.5 min-w-[90px]">
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                <div>
                  <div className="text-[6px] font-mono text-slate-400 uppercase tracking-wider">CI/CD PIPELINE</div>
                  <div className="text-[8px] font-bold text-white uppercase tracking-wider mt-0.5">READY</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-white/10 bg-[#0a0a0a] rounded-md px-2.5 py-1.5 min-w-[90px]">
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                <div>
                  <div className="text-[6px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE MISSIONS</div>
                  <div className="text-[8px] font-bold text-white uppercase tracking-wider mt-0.5">42 AVAILABLE</div>
                </div>
              </div>
            </div>

            {/* Capability Cards Row */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { title: 'LINUX', desc: 'Troubleshooting\n& Operations', logo: '/linux-logo.svg', missions: '12 MISSIONS' },
                { title: 'DOCKER', desc: 'Container\nRuntime', logo: '/docker-logo.svg', missions: '15 MISSIONS' },
                { title: 'KUBERNETES', desc: 'Cluster\nOperations', logo: '/k8s-logo.svg', missions: '18 MISSIONS' },
                { title: 'CI/CD + SECURITY', desc: 'Automation &\nHardening', logo: '/jenkins-logo.svg', missions: '22 MISSIONS' }
              ].map((mod, i) => (
                <div key={i} className="border border-white/10 bg-[#0a0a0a] rounded-md p-2 flex flex-col items-start transition-colors hover:border-red-500/50 group">
                  <img src={mod.logo} className="w-4 h-4 mb-2.5 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" alt={mod.title} />
                  <h3 className="text-[8px] font-bold text-white mb-1">{mod.title}</h3>
                  <p className="text-[7px] text-slate-400 whitespace-pre-line mb-3 flex-grow leading-tight">{mod.desc}</p>
                  <div className="text-[6px] font-mono text-red-500 font-bold">{mod.missions}</div>
                </div>
              ))}
            </div>

            {/* Footer Text */}
            <div className="font-mono text-[6px] text-slate-500 space-y-0.5">
              <div><span className="text-red-500">{'>'}</span> DEVOPS ARENA TRAINING ENVIRONMENT</div>
              <div><span className="text-red-500">{'>'}</span> BUILT FOR OPERATORS. ENGINEERED FOR IMPACT. <span className="inline-block w-1 h-1 bg-red-500"></span></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center items-center lg:items-end">
          
          <div className="w-full max-w-[320px]">
            {/* Login Card */}
            <div className="border border-white/10 bg-[#0a0a0a] rounded-lg p-5 shadow-2xl relative">
              
              <div className="flex items-center space-x-1.5 text-red-500 mb-3">
                <Lock className="w-2.5 h-2.5" />
                <span className="text-[7px] font-mono tracking-widest uppercase">SECURE ACCESS</span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-1">Initialize Session</h2>
              <p className="text-slate-400 text-[10px] mb-6">Authenticate to access environment.</p>

              <form onSubmit={handleLogin} className="space-y-3.5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded flex items-start text-[9px]">
                    <ShieldAlert className="w-2.5 h-2.5 mr-1 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-red-500 mb-1 text-[7px] font-bold uppercase tracking-widest font-mono">OPERATOR IDENTITY</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <User className="w-3 h-3 text-slate-500" />
                      </div>
                      <input 
                        type="email" 
                        className="w-full bg-[#111111] text-slate-200 rounded-md border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors text-[10px] pl-7 pr-3 h-8 placeholder:text-slate-600" 
                        placeholder="operator@devopsarena.local"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        disabled={loading || success}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-red-500 mb-1 text-[7px] font-bold uppercase tracking-widest font-mono">ACCESS CODE</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="w-3 h-3 text-slate-500" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-[#111111] text-slate-200 rounded-md border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors text-[10px] pl-7 pr-7 h-8 placeholder:text-slate-600 tracking-widest" 
                        placeholder="••••••••••"
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        disabled={loading || success}
                      />
                      <button 
                        type="button" 
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center space-x-1.5 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-2.5 h-2.5">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-2.5 h-2.5 border border-white/20 rounded-sm bg-[#111111] checked:bg-red-500 checked:border-red-500 transition-colors cursor-pointer"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />
                        <Check className="absolute w-2 h-2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="text-[9px] text-slate-400 group-hover:text-slate-300 transition-colors">Remember this device</span>
                    </label>
                    
                    <Link href="#" className="text-[9px] text-red-500 hover:text-red-400 transition-colors">
                      Forgot access code?
                    </Link>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || success}
                    className={`w-full h-8 font-bold rounded-md transition-all mt-3 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed text-[9px] tracking-wider text-white shadow-lg
                      ${success ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 
                        'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                      }`}
                  >
                    {success ? (
                      <>CONNECTION ESTABLISHED <Check className="w-2.5 h-2.5 ml-1" /></>
                    ) : loading ? (
                      <>AUTHENTICATING... <Loader2 className="w-2.5 h-2.5 ml-1 animate-spin" /></>
                    ) : (
                      <><span className="font-mono font-normal mr-1">{`>_`}</span> ESTABLISH CONNECTION <ChevronRight className="w-2.5 h-2.5 ml-1" /></>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center space-x-1 mt-3 text-[7px] font-mono tracking-widest text-slate-500 pt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    <span>SECURE CHANNEL ENCRYPTED</span>
                  </div>
                </div>
              </form>
              
              <div className="mt-6 text-center text-[9px]">
                <span className="text-slate-400">Unregistered operator? </span>
                <Link href="/register" className="text-red-500 hover:text-red-400 transition-colors font-medium inline-flex items-center">
                  Create credentials <ChevronRight className="w-2 h-2 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* Bottom Right HUD Elements */}
            <div className="mt-4 flex justify-end">
              <div className="relative border border-white/5 rounded-md p-2 pl-8 flex items-center justify-end w-fit">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500/50 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-red-500/50 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-red-500/50 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500/50 rounded-br-sm"></div>
                
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-red-500/30 rounded-sm flex items-center justify-center bg-red-500/5">
                  <Shield className="w-2 h-2 text-red-500" />
                </div>
                
                <div className="text-right font-mono text-[6px] tracking-widest text-slate-500 space-y-0.5">
                  <div className="text-red-500">DEVOPS ARENA</div>
                  <div>TRAINING ENVIRONMENT V2.0</div>
                  <div>[ SYS_ID: 849-B ]</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
