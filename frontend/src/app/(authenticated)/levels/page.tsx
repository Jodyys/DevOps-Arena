"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Lock, Map, Network, Server, Shield, Terminal, CheckCircle } from "lucide-react";

export default function Levels() {
  const [levels, setLevels] = useState<any[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetchApi("/levels");
        setLevels(res.data);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, [router]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'docker': return <Server className="w-8 h-8" />;
      case 'kubernetes': return <Network className="w-8 h-8" />;
      case 'linux': return <Terminal className="w-8 h-8" />;
      case 'security': return <Shield className="w-8 h-8" />;
      default: return <Map className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Skill Map</h1>
        <p className="text-slate-400">Unlock new technologies by completing missions in the previous level.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {/* Decorative connecting lines for skill tree feel */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10 translate-y-[-50%]"></div>
        
        {levels.map((level, index) => {
          const isLocked = level.status === 'locked';
          const isCompleted = level.status === 'completed';
          const done = level.missions_completed || 0;
          const total = level.missions_total || 0;
          const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
          
          return (
            <Link 
              href={`/levels/${level.id}`} 
              key={level.id}
              onClick={(e) => { if (isLocked) e.preventDefault(); }}
              className={`relative bg-slate-900 border-2 rounded-xl p-6 transition-all duration-300 flex flex-col items-center text-center
                ${isLocked 
                  ? 'border-slate-800 opacity-60 cursor-not-allowed grayscale' 
                  : isCompleted
                    ? 'border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:-translate-y-1'
                    : 'border-blue-500/50 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:-translate-y-1'
                }
              `}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 bg-slate-900 z-10
                ${isLocked ? 'border-slate-800 text-slate-600' : 
                  isCompleted ? 'border-emerald-500 text-emerald-400' : 'border-blue-500 text-blue-400'}
              `}>
                {isLocked ? <Lock className="w-8 h-8" /> : isCompleted ? <CheckCircle className="w-8 h-8" /> : getIcon(level.category)}
              </div>
              
              <h2 className="text-xl font-bold text-slate-100 mb-2">{level.name}</h2>
              <p className="text-sm text-slate-400 mb-4 flex-1">{level.description}</p>

              {/* Progress bar */}
              {!isLocked && (
                <div className="w-full mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-blue-400'}>
                      {done} / {total} missions
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="w-full bg-slate-950 rounded-lg p-3 flex justify-between items-center text-xs font-medium border border-slate-800">
                <span className="text-slate-400">Category: <span className="text-slate-300">{level.category}</span></span>
                <span className="text-yellow-500 flex items-center">
                  Reward: +{level.xp_reward} XP
                </span>
              </div>

              {/* Status Badge */}
              <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold border ${
                  isCompleted ? 'bg-emerald-900 border-emerald-500 text-emerald-400' :
                  isLocked ? 'bg-slate-800 border-slate-700 text-slate-400' :
                  'bg-blue-900 border-blue-500 text-blue-400'
                }`}>
                {level.status.replace('_', ' ').toUpperCase()}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

