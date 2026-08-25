"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed, TerminalSquare, AlertTriangle, ShieldAlert, Cpu, Lock } from "lucide-react";

export default function LevelDetail() {
  const { id } = useParams();
  const [level, setLevel] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await fetchApi(`/levels/${id}`);
        setLevel(res.data);
      } catch (error) {
        console.error(error);
        router.push("/levels");
      }
    };
    if (id) fetchLevel();
  }, [id, router]);

  if (!level) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'expert': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'nightmare': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return '★☆☆☆☆';
      case 'medium': return '★★☆☆☆';
      case 'hard': return '★★★☆☆';
      case 'expert': return '★★★★☆';
      case 'nightmare': return '★★★★★';
      default: return '★☆☆☆☆';
    }
  };

  const getCategoryWatermark = (category: string) => {
    const baseClass = "w-64 h-64 text-slate-100 opacity-50 filter grayscale";
    switch (category?.toLowerCase()) {
      case 'docker': 
        return <img src="/docker-logo.svg" className={`${baseClass} invert`} alt="" />;
      case 'kubernetes': 
        return <img src="/k8s-logo.svg" className={baseClass} alt="" />;
      case 'linux': 
        return <img src="/linux-logo.svg" className={baseClass} alt="" />;
      case 'ci/cd': 
        return <img src="/jenkins-logo.svg" className={baseClass} alt="" />;
      case 'security': 
        return <img src="/bash-logo.svg" className={baseClass} alt="" />;
      default: 
        return <Cpu className="w-64 h-64 text-slate-100" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B1121]/95 backdrop-blur-xl rounded-[15px] p-8 sm:p-10 border border-slate-800/50 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          {getCategoryWatermark(level.category)}
        </div>
        <div className="relative z-10">
          <Link href="/levels" className="flex items-center text-slate-400 hover:text-blue-400 transition-colors mb-4 text-sm font-medium w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
          </Link>
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-100">{level.name}</h1>
            <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs font-bold text-slate-300">
              {level.category}
            </span>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl">{level.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center">
          <TerminalSquare className="w-5 h-5 mr-2 text-blue-500" /> 
          Available Missions
        </h2>
        
        <div className="grid gap-4">
          {level.missions.map((mission: any, idx: number) => {
            // Assume missing status means not started. 
            // In a real app we'd fetch status per mission from attempts table via API.
            // For now, if there is a 'completed' status injected, we use it.
            const status = mission.status || 'not_started'; 
            const diffClass = getDifficultyColor(mission.difficulty);
            
            return (
              <div key={mission.id} className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row overflow-hidden group">
                <div className="w-2 bg-slate-800 group-hover:bg-blue-500 transition-colors"></div>
                
                <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-slate-500 font-mono text-sm font-bold tracking-wider mb-1">M-{String(mission.id).padStart(2, '0')}</div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">{mission.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{mission.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wider font-mono">
                      <span className={diffClass.split(' ')[0]}>
                        {mission.difficulty}
                      </span>
                      {mission.xp_reward && (
                         <span className="text-yellow-500">{mission.xp_reward} XP</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-4 shrink-0 bg-slate-800/30 p-6 rounded-lg border border-slate-700/30 min-w-[200px]">
                      {status === 'completed' ? (
                        <>
                           <div className="flex flex-col items-start md:items-end w-full mb-2">
                             <div className="flex items-center text-emerald-400 font-bold mb-1 tracking-wider text-sm">
                               <CheckCircle2 className="w-4 h-4 mr-2" /> RESOLVED
                             </div>
                             {mission.best_time && <div className="text-xs text-slate-400 font-mono">BEST TIME {mission.best_time}</div>}
                             {mission.xp_reward && <div className="text-xs text-yellow-500 font-mono">+{mission.xp_reward} XP</div>}
                           </div>
                           <Link href={`/missions/${mission.id}`} className="w-full text-center px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors border border-slate-600">
                              Replay Mission
                           </Link>
                        </>
                      ) : status === 'locked' ? (
                        <>
                           <div className="flex flex-col items-start md:items-end w-full mb-2">
                             <div className="flex items-center text-slate-500 font-bold mb-1 tracking-wider text-sm">
                               <Lock className="w-4 h-4 mr-2" /> LOCKED
                             </div>
                             <div className="text-xs text-slate-600 font-mono md:text-right max-w-[150px]">{mission.lockedReason || 'Prerequisites not met'}</div>
                           </div>
                           <button disabled className="w-full px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-surface-secondary text-slate-600 cursor-not-allowed border border-surface-secondary">
                              LOCKED
                           </button>
                        </>
                      ) : (
                        <>
                           <div className="flex flex-col items-start md:items-end w-full mb-2">
                             <div className="flex items-center text-blue-400 font-bold mb-1 tracking-wider text-sm">
                               <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div> AVAILABLE
                             </div>
                           </div>
                           <Link href={`/missions/${mission.id}`} className="w-full text-center px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                              Initiate Mission →
                           </Link>
                        </>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
