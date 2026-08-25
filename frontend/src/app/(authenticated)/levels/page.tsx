"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Lock, Zap, Target, ArrowRight, Clock, Star, Trophy, CheckCircle } from "lucide-react";

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
    <div className="flex min-h-[60vh] items-center justify-center bg-[#050505]">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 border-[3px] border-red-900/50 border-t-red-500 rounded-full animate-spin shadow-[0_0_30px_rgba(239,68,68,0.3)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Target className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <div className="mt-6 text-[10px] font-mono text-red-500 tracking-[0.3em] uppercase animate-pulse">Initializing Map...</div>
      </div>
    </div>
  );

  const getLogo = (category: string, isLocked: boolean) => {
    const imgClass = `w-10 h-10 transition-all duration-500 ${isLocked ? 'opacity-30 grayscale' : 'opacity-90 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`;
    const cat = category?.toLowerCase() || '';
    if (cat.includes('docker')) return <img src="/docker-logo.svg" className={imgClass} alt="Docker" />;
    if (cat.includes('kubernetes') || cat.includes('k8s')) return <img src="/k8s-logo.svg" className={imgClass} alt="Kubernetes" />;
    if (cat.includes('linux')) return <img src="/linux-logo.svg" className={imgClass} alt="Linux" />;
    if (cat.includes('ci/cd') || cat.includes('cicd') || cat.includes('pipeline')) return <img src="/jenkins-logo.svg" className={imgClass} alt="CI/CD" />;
    if (cat.includes('security') || cat.includes('devsecops') || cat.includes('bash')) return <img src="/bash-logo.svg" className={imgClass} alt="Security" />;
    return <Target className={`w-10 h-10 ${isLocked ? 'text-slate-700' : 'text-red-500'}`} />;
  };

  const totalCompleted = levels.reduce((sum, l) => sum + (l.missions_completed || 0), 0);
  const totalMissions = levels.reduce((sum, l) => sum + (l.missions_total || 0), 0);
  const totalXP = levels.reduce((sum, l) => sum + (l.xp_reward || 0), 0);

  return (
    <div className="min-h-screen pb-16 font-sans text-slate-300 selection:bg-red-500/30 selection:text-red-200">
      
      {/* HEADER */}
      <div className="relative w-full flex items-center justify-center mb-12 overflow-hidden py-12 border-b border-red-900/20 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent z-0"></div>
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#7f1d1d 1px, transparent 1px), linear-gradient(90deg, #7f1d1d 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[9px] font-mono tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <Zap className="w-2.5 h-2.5 mr-1.5" />
            Skill Progression
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tighter">
            <span className="text-white">OPERATIONAL </span>
            <span className="text-red-500">SKILLS</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ascend the operational ladder. Master complex infrastructure modules<br/>to decrypt advanced capabilities and dominate the arena.
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        
        {/* Vertical Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-0 hidden sm:block">
          <div className="h-full bg-gradient-to-b from-red-500/60 via-red-900/30 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.3)]"></div>
        </div>

        <div className="space-y-8 relative z-10">
          {levels.map((level, index) => {
            const isLocked = level.status === 'locked';
            const isCompleted = level.status === 'completed';
            const isInProgress = !isLocked && !isCompleted;
            const done = level.missions_completed || 0;
            const total = level.missions_total || 0;
            const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={level.id}
                className={`flex items-center w-full gap-0 animate-in zoom-in-95 duration-500`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* LEFT CARD (even index) or spacer */}
                <div className={`w-[calc(50%-28px)] ${isLeft ? 'block' : 'hidden sm:block'}`}>
                  {isLeft && (
                    <Link
                      href={`/levels/${level.id}`}
                      onClick={(e) => { if (isLocked) e.preventDefault(); }}
                      className={`block ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}
                    >
                      <div className={`relative bg-[#0a0a0a] border rounded-xl p-4 transition-all duration-300 overflow-hidden
                        ${isLocked ? 'border-white/5' : isCompleted ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5'}
                      `}>
                        {/* Top bar */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">MODULE 0{index + 1}</span>
                          <span className={`text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border
                            ${isCompleted ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                              isLocked ? 'text-slate-600 border-slate-700 bg-slate-800/50' :
                              'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse'}`}>
                            {isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'IN PROGRESS'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border
                            ${isLocked ? 'bg-[#111] border-slate-800' : isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            {getLogo(level.category, isLocked)}
                          </div>
                          <div>
                            <h2 className={`text-base font-black tracking-tight leading-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                              {level.name}
                            </h2>
                            <p className={`text-[10px] leading-relaxed mt-0.5 ${isLocked ? 'text-slate-700' : 'text-slate-400'}`}>
                              {level.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress */}
                        {!isLocked && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[8px] font-mono mb-1">
                              <span className="text-slate-500 uppercase tracking-wider">Progress</span>
                              <span className={isCompleted ? 'text-emerald-400' : 'text-red-400'}>{done} ({progressPct}%)</span>
                            </div>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-orange-500'}`}
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isLocked ? 'text-slate-700' : 'text-slate-400'}`}>
                            {level.category}
                          </span>
                          <div className="flex items-center text-yellow-500/80 text-[9px] font-mono font-bold">
                            <Zap className="w-2.5 h-2.5 mr-1" />
                            +{level.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                {/* CENTER NODE */}
                <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm z-20 bg-[#050505] transition-all duration-300
                    ${isLocked ? 'border-slate-700 text-slate-700' :
                      isCompleted ? 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                      'border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : `0${index + 1}`}
                  </div>
                </div>

                {/* RIGHT CARD (odd index) or spacer */}
                <div className={`w-[calc(50%-28px)] ${!isLeft ? 'block' : 'hidden sm:block'}`}>
                  {!isLeft && (
                    <Link
                      href={`/levels/${level.id}`}
                      onClick={(e) => { if (isLocked) e.preventDefault(); }}
                      className={`block ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}
                    >
                      <div className={`relative bg-[#0a0a0a] border rounded-xl p-4 transition-all duration-300 overflow-hidden
                        ${isLocked ? 'border-white/5' : isCompleted ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5'}
                      `}>
                        {/* Top bar */}
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">MODULE 0{index + 1}</span>
                          <span className={`text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border
                            ${isCompleted ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                              isLocked ? 'text-slate-600 border-slate-700 bg-slate-800/50' :
                              'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse'}`}>
                            {isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'IN PROGRESS'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border
                            ${isLocked ? 'bg-[#111] border-slate-800' : isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            {getLogo(level.category, isLocked)}
                          </div>
                          <div>
                            <h2 className={`text-base font-black tracking-tight leading-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                              {level.name}
                            </h2>
                            <p className={`text-[10px] leading-relaxed mt-0.5 ${isLocked ? 'text-slate-700' : 'text-slate-400'}`}>
                              {level.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress */}
                        {!isLocked && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[8px] font-mono mb-1">
                              <span className="text-slate-500 uppercase tracking-wider">Progress</span>
                              <span className={isCompleted ? 'text-emerald-400' : 'text-red-400'}>{done} ({progressPct}%)</span>
                            </div>
                            <div className="h-1 bg-[#111] rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-orange-500'}`}
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isLocked ? 'text-slate-700' : 'text-slate-400'}`}>
                            {level.category}
                          </span>
                          <div className="flex items-center text-yellow-500/80 text-[9px] font-mono font-bold">
                            <Zap className="w-2.5 h-2.5 mr-1" />
                            +{level.xp_reward} XP
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <div className="border border-white/5 bg-[#0a0a0a] rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 to-transparent pointer-events-none"></div>
          
          {[
            {
              icon: <Target className="w-4 h-4 text-red-500" />,
              label: 'YOUR PROGRESS',
              value: `${totalCompleted} / ${totalMissions} SKILLS COMPLETE`,
              sub: `${totalCompleted}`,
              subColor: 'text-red-500'
            },
            {
              icon: <Star className="w-4 h-4 text-yellow-500" />,
              label: 'TOTAL XP AVAILABLE',
              value: `+${totalXP.toLocaleString()} XP`,
              sub: null,
              subColor: 'text-yellow-400'
            },
            {
              icon: <Trophy className="w-4 h-4 text-red-500" />,
              label: 'COMPLETION REWARD',
              value: 'DEVOPS OPERATOR',
              sub: null,
              subColor: 'text-red-400'
            },
            {
              icon: <Clock className="w-4 h-4 text-slate-400" />,
              label: 'ESTIMATED TIME',
              value: '12 - 15 HOURS',
              sub: null,
              subColor: 'text-slate-300'
            }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                {stat.icon}
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className={`text-sm font-black tracking-tight ${stat.subColor}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
