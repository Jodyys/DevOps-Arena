"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed, TerminalSquare, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cpu className="w-64 h-64 text-slate-100" />
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
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-slate-500 font-mono text-sm font-bold">M-{String(mission.id).padStart(2, '0')}</span>
                      <h3 className="text-xl font-bold text-slate-100">{mission.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">{mission.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-4 text-xs font-semibold">
                      <span className={`px-2 py-1 rounded border ${diffClass} flex items-center`}>
                        {mission.difficulty.toUpperCase()} 
                        <span className="ml-2 tracking-widest">{getDifficultyIcon(mission.difficulty)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 shrink-0 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</div>
                      {status === 'completed' ? (
                        <div className="flex items-center text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> COMPLETED
                        </div>
                      ) : status === 'locked' ? (
                        <div className="flex items-center text-slate-500 font-medium text-xs">
                           <AlertTriangle className="w-3 h-3 mr-1" /> {mission.lockedReason}
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 font-medium">
                          <CircleDashed className="w-4 h-4 mr-1" /> PENDING
                        </div>
                      )}
                    </div>
                    
                    {status === 'locked' ? (
                       <button disabled className="px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 bg-slate-800 text-slate-600 cursor-not-allowed">
                          LOCKED
                       </button>
                    ) : (
                      <Link 
                        href={`/missions/${mission.id}`}
                        className={`px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
                          status === 'completed' 
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        }`}
                      >
                        {status === 'completed' ? 'Replay' : 'Start'}
                      </Link>
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
