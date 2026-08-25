import Link from "next/link";
import { ArrowRight, Activity, ShipWheel, GitBranch, Target, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex items-center justify-center px-8 py-2 lg:px-16">
      
      {/* Background Grid & Red Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,51,51,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,51,51,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
      
      {/* Central glow */}
      <div className="hidden xl:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/8 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-[1300px] flex flex-col xl:flex-row justify-between items-center xl:items-center gap-6 z-10 relative pl-4 xl:pl-8">
        
        {/* LEFT COLUMN */}
        <div className="w-full xl:w-[48%] flex flex-col">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="border border-red-500 px-2 py-0.5 bg-red-500/10 text-red-500 font-mono font-bold text-xs">{`>_`}</div>
            <span className="text-base font-bold tracking-widest text-white">
              DEVOPS <span className="text-red-500">ARENA</span>
            </span>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest uppercase mb-3 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-500 font-bold">[SYS_ONLINE] <span className="text-slate-400 font-normal">CONNECTION SECURE</span></span>
          </div>

          {/* Hero Titles */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white leading-none">
            DevOps <span className="text-red-500">Arena</span>
          </h1>
          
          <div className="text-slate-300 text-sm leading-relaxed mb-3 max-w-lg">
            Master the infrastructure. Solve live incidents.<br/>
            <span className="font-bold text-white">Prove your operational supremacy.</span>
          </div>

          {/* Stats Box - compact */}
          <div className="border border-white/10 bg-[#080808] rounded-lg flex items-center divide-x divide-white/10 mb-3 max-w-xl">
            <div className="flex-1 px-3 py-2 flex flex-col items-start hover:bg-white/5 transition-colors cursor-default">
              <Activity className="w-3 h-3 text-red-500 mb-1.5" />
              <div className="text-[7px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">SYSTEM STATUS</div>
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">OPERATIONAL</div>
            </div>
            <div className="flex-1 px-3 py-2 flex flex-col items-start hover:bg-white/5 transition-colors cursor-default">
              <ShipWheel className="w-3 h-3 text-slate-400 mb-1.5" />
              <div className="text-[7px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">KUBERNETES</div>
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">READY</div>
            </div>
            <div className="flex-1 px-3 py-2 flex flex-col items-start hover:bg-white/5 transition-colors cursor-default">
              <GitBranch className="w-3 h-3 text-slate-400 mb-1.5" />
              <div className="text-[7px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">CI/CD PIPELINE</div>
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">READY</div>
            </div>
            <div className="flex-1 px-3 py-2 flex flex-col items-start hover:bg-white/5 transition-colors cursor-default">
              <Target className="w-3 h-3 text-slate-400 mb-1.5" />
              <div className="text-[7px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">ACTIVE MISSIONS</div>
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wider">42 AVAILABLE</div>
            </div>
          </div>

          <p className="text-slate-400 text-xs max-w-[480px] leading-relaxed mb-3">
            A hands-on DevOps training platform where you solve real infrastructure incidents across <span className="font-bold text-white">Linux</span>, <span className="font-bold text-white">Docker</span>, <span className="font-bold text-white">Kubernetes</span>, <span className="font-bold text-white">CI/CD</span>, and <span className="font-bold text-white">DevSecOps</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3 w-full sm:w-auto">
            <Link href="/login" className="group px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-all flex items-center justify-center uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5">
              INITIALIZE SESSION <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-transparent border border-white/20 hover:border-slate-400 rounded-lg font-bold text-slate-200 transition-all flex items-center justify-center uppercase tracking-widest text-[10px] hover:bg-white/5">
              CREATE CREDENTIALS
            </Link>
          </div>

          {/* Terminal Snippet - compact */}
          <div className="border border-white/10 bg-[#080808] rounded-lg p-3 font-mono text-[10px] text-slate-400 leading-relaxed max-w-xl shadow-2xl relative overflow-hidden">
             <div className="text-red-500 mb-1">{`>_`}</div>
             <div><span className="text-white">$</span> <span className="text-red-400">kubectl</span> get pods --all-namespaces</div>
             <div><span className="text-white">$</span> <span className="text-red-400">docker</span> ps --format "table {'{{.Names}}\t{{.Status}}'}"</div>
             <div><span className="text-white">$</span> <span className="text-red-400">pipeline</span> deploy --env=production</div>
             <div className="text-red-500 mt-1 animate-pulse">{`>_`}</div>
          </div>
        </div>

        {/* RIGHT COLUMN (Cards) */}
        <div className="w-full xl:w-[48%] flex flex-col items-center xl:items-end justify-center relative">
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-[480px]">
            
            {/* Linux */}
            <div className="relative group overflow-hidden border border-white/5 bg-[#0a0a0a] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-red-500/40 hover:bg-[#0c0c0c] hover:-translate-y-1 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none opacity-50"></div>
              <img src="/linux-logo.svg" alt="Linux" className="w-10 h-10 mb-3 drop-shadow-xl z-10 transition-transform group-hover:scale-110" />
              <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-widest z-10">LINUX</h3>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed z-10">Troubleshooting<br/>& Operations</p>
              <div className="w-5 h-[1px] bg-red-500/50 mt-2 z-10"></div>
            </div>
            
            {/* Docker */}
            <div className="relative group overflow-hidden border border-white/5 bg-[#0a0a0a] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-red-500/40 hover:bg-[#0c0c0c] hover:-translate-y-1 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none opacity-50"></div>
              <img src="/docker-logo.svg" alt="Docker" className="w-10 h-10 mb-3 drop-shadow-xl z-10 transition-transform group-hover:scale-110" />
              <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-widest z-10">DOCKER</h3>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed z-10">Container<br/>Runtime</p>
              <div className="w-5 h-[1px] bg-red-500/50 mt-2 z-10"></div>
            </div>

            {/* CI/CD */}
            <div className="relative group overflow-hidden border border-white/5 bg-[#0a0a0a] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-red-500/40 hover:bg-[#0c0c0c] hover:-translate-y-1 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none opacity-50"></div>
              <img src="/jenkins-logo.svg" alt="CI/CD" className="w-10 h-10 mb-3 drop-shadow-xl z-10 transition-transform group-hover:scale-110" />
              <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-widest z-10">CI/CD</h3>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed z-10">Automation<br/>& Pipeline</p>
              <div className="w-5 h-[1px] bg-red-500/50 mt-2 z-10"></div>
            </div>

            {/* Kubernetes */}
            <div className="relative group overflow-hidden border border-white/5 bg-[#0a0a0a] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-red-500/40 hover:bg-[#0c0c0c] hover:-translate-y-1 shadow-lg">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none opacity-50"></div>
              <img src="/k8s-logo.svg" alt="Kubernetes" className="w-10 h-10 mb-3 drop-shadow-xl z-10 transition-transform group-hover:scale-110" />
              <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-widest z-10">KUBERNETES</h3>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed z-10">Cluster<br/>Operations</p>
              <div className="w-5 h-[1px] bg-red-500/50 mt-2 z-10"></div>
            </div>

          </div>

          {/* Bottom HUD */}
          <div className="mt-4 w-full flex justify-end">
            <div className="relative border border-white/5 rounded-md p-3 pl-10 flex items-center justify-end w-fit">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/50 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500/50 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50 rounded-br-sm"></div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border border-red-500/30 rounded-sm flex items-center justify-center bg-red-500/5">
                <Shield className="w-2.5 h-2.5 text-red-500" />
              </div>
              <div className="text-right font-mono text-[7px] tracking-widest text-slate-500 space-y-0.5">
                <div className="text-red-500">DEVOPS ARENA</div>
                <div>TRAINING ENVIRONMENT V2.0</div>
                <div>[ SYS_ID: 849-B ]</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
