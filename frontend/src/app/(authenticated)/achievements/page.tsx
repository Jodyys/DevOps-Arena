"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Lock, ShieldAlert, FileDigit, Container, Server, Zap, Wrench, Shield, Activity, Award, FastForward, RotateCcw, Network } from 'lucide-react';
import { fetchApi } from '@/lib/api';

const getAchievementIcon = (name: string, isUnlocked: boolean) => {
  const svgClass = `w-12 h-12 transition-all duration-500 ${isUnlocked ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'opacity-30 grayscale'}`;
  
  if (name.includes('Docker')) return <img src="/docker-logo.svg" className={svgClass} alt="Docker" />;
  if (name.includes('Kubernetes')) return <img src="/k8s-logo.svg" className={svgClass} alt="Kubernetes" />;
  if (name.includes('Linux')) return <img src="/linux-logo.svg" className={svgClass} alt="Linux" />;
  if (name.includes('CI/CD')) return <img src="/jenkins-logo.svg" className={svgClass} alt="CI/CD" />;
  
  const lucideClass = `w-12 h-12 transition-all duration-500 ${isUnlocked ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'text-slate-600 opacity-50'}`;
  
  switch (name) {
    case 'Fast Solver': return <Zap className={lucideClass.replace('text-red-500', 'text-amber-500')} />;
    case 'Troubleshooter': return <Wrench className={lucideClass.replace('text-red-500', 'text-slate-300')} />;
    case 'Speed Runner': return <FastForward className={lucideClass.replace('text-red-500', 'text-orange-500')} />;
    case 'No-Hint Hero': return <Shield className={lucideClass.replace('text-red-500', 'text-emerald-500')} />;
    case 'Consistent Operator': return <Activity className={lucideClass.replace('text-red-500', 'text-red-400')} />;
    case 'Rollback Master': return <RotateCcw className={lucideClass} />;
    case 'DevSecOps': return <ShieldAlert className={lucideClass.replace('text-red-500', 'text-rose-600')} />;
    case 'DevOps Master': return <Award className={lucideClass} />;
    default: return <Trophy className={lucideClass} />;
  }
};

export default function Achievements() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await fetchApi('/auth/me');
        if (data.success && data.data.achievements) {
          setAchievements(data.data.achievements);
        } else {
          setError("Failed to load achievements");
        }
      } catch (err: any) {
        console.error("Achievements error", err);
        setError(err.message || "Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [router]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center bg-[#050505]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex h-64 items-center justify-center bg-[#050505]">
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md shadow-[0_0_30px_rgba(239,68,68,0.15)]">
         <ShieldAlert className="w-12 h-12 mx-auto mb-4 animate-pulse" />
         <h2 className="text-xl font-bold mb-2 tracking-widest uppercase">Connection Error</h2>
         <p className="font-mono text-sm opacity-80">{error}</p>
         <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">Retry</button>
      </div>
    </div>
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const categories = ['ALL', 'DOCKER', 'LINUX', 'KUBERNETES', 'CI/CD', 'DEVSECOPS'];

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'ALL') return true;
    const searchString = `${a.name} ${a.description}`.toUpperCase();
    if (filter === 'CI/CD' && searchString.includes('CI/CD')) return true;
    if (filter === 'DEVSECOPS' && (searchString.includes('SEC') || searchString.includes('VULN'))) return true;
    return searchString.includes(filter);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#050505] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] z-[-1] pointer-events-none"></div>
      <div className="fixed bottom-0 right-[20%] w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[150px] z-[-1] pointer-events-none"></div>

      {/* HEADER SECTION (Archive Terminal) */}
      <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDE0OCwxNjMsMTg0LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBoLTQweiIvPjwvZz48L3N2Zz4=')] opacity-50 z-0 mix-blend-overlay"></div>
        
        <div className="flex items-center relative z-10">
          <div className="bg-[#111111] p-5 rounded-2xl mr-6 border border-white/5 shadow-[0_0_20px_rgba(239,68,68,0.15)] group-hover:border-red-500/30 transition-colors">
            <Trophy className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-red-500 uppercase tracking-widest font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <span>Operator Profile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">ACHIEVEMENT ARCHIVE</h1>
          </div>
        </div>
        
        <div className="flex gap-4 md:gap-8 relative z-10 w-full md:w-auto bg-[#111111]/60 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="text-right flex-1 md:flex-none">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5 font-mono">Total Assets</div>
            <div className="text-4xl font-black text-white tracking-tighter">{achievements.length}</div>
          </div>
          <div className="w-px bg-slate-800 self-stretch mx-2"></div>
          <div className="text-right flex-1 md:flex-none">
            <div className="text-[10px] text-red-500/80 uppercase tracking-widest font-bold mb-1.5 font-mono">Unlocked</div>
            <div className="text-4xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">{unlockedCount}</div>
          </div>
        </div>
      </div>

      {/* FILTERS (Tactical Toggles) */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg border transition-all duration-300 font-mono
              ${filter === cat 
                ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'bg-[#0a0a0a]/80 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-[#111111]/80 hover:border-slate-700 backdrop-blur-md'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAchievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`flex flex-col p-8 rounded-2xl border relative overflow-hidden transition-all duration-500 group
              ${ach.unlocked 
                ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-red-500/30 hover:shadow-[0_0_40px_rgba(239,68,68,0.2)]' 
                : 'bg-[#111111]/90 backdrop-blur-md border-white/5 grayscale opacity-70'
              }
            `}
          >
            {/* Background glow for unlocked */}
            {ach.unlocked && (
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-full blur-[50px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            )}
            
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border-2 transition-transform duration-500 group-hover:rotate-3 relative z-10
              ${ach.unlocked 
                ? 'bg-[#111111] border-white/10 shadow-lg' 
                : 'bg-[#050505] border-transparent text-slate-600'
              }
            `}>
              {getAchievementIcon(ach.name, ach.unlocked)}
            </div>
            
            <h3 className={`text-xl font-black uppercase tracking-widest mb-3 relative z-10 ${ach.unlocked ? 'text-white' : 'text-slate-600'}`}>
              {ach.name}
            </h3>
            
            <p className={`text-sm leading-relaxed flex-1 mb-8 relative z-10 ${ach.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
              {ach.description}
            </p>
            
            <div className="mt-auto border-t border-white/5 pt-5 flex items-center justify-between relative z-10 bg-[#111111]/40 -mx-8 -mb-8 px-8 pb-8 rounded-b-2xl">
              {ach.unlocked ? (
                <>
                  <span className="text-[11px] font-black tracking-widest text-emerald-500 uppercase flex items-center">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                     UNLOCKED
                  </span>
                  {ach.unlocked_at && (
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-[#050505] px-2 py-1 rounded border border-white/5">
                      {new Date(ach.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[11px] font-black tracking-widest text-slate-600 flex items-center uppercase">
                    <Lock className="w-3.5 h-3.5 mr-2 opacity-50" /> RESTRICTED
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredAchievements.length === 0 && (
          <div className="col-span-full py-20 text-center bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-inner">
            <FileDigit className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-50" />
            <h3 className="text-white font-black text-2xl tracking-widest mb-2">NO DATA FOUND</h3>
            <p className="text-sm text-slate-500 font-mono">No achievements match this operational filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
