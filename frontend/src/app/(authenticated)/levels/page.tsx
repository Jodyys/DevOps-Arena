"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Lock, Zap, Target, ArrowRight, Star, Trophy, Check, ChevronRight, Shield, Terminal, ShieldAlert } from "lucide-react";

export default function Levels() {
  const [levels, setLevels] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [nextMission, setNextMission] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [levelsRes, profileRes] = await Promise.all([
          fetchApi("/levels"),
          fetchApi("/auth/me")
        ]);

        if (!profileRes.success) {
          router.push("/login");
          return;
        }

        setLevels(levelsRes.data || []);
        setProfile(profileRes.data);

        if (profileRes.data.continueMissionId) {
          try {
            const missionRes = await fetchApi(`/missions/${profileRes.data.continueMissionId}`);
            if (missionRes.success) {
              setNextMission(missionRes.data);
            }
          } catch(e) {
            // ignore silently
          }
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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

  if (!profile) return null;

  const getLogo = (category: string, isLocked: boolean) => {
    const imgClass = `w-10 h-10 md:w-12 md:h-12 transition-all duration-500 ${isLocked ? 'opacity-30 grayscale' : 'opacity-90 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`;
    const cat = category?.toLowerCase() || '';
    if (cat.includes('docker')) return <img src="/docker-logo.svg" className={imgClass} alt="Docker" />;
    if (cat.includes('kubernetes') || cat.includes('k8s')) return <img src="/k8s-logo.svg" className={imgClass} alt="Kubernetes" />;
    if (cat.includes('linux')) return <img src="/linux-logo.svg" className={imgClass} alt="Linux" />;
    if (cat.includes('ci/cd') || cat.includes('cicd') || cat.includes('pipeline')) return <img src="/jenkins-logo.svg" className={imgClass} alt="CI/CD" />;
    if (cat.includes('security') || cat.includes('devsecops') || cat.includes('bash')) return <ShieldAlert className={`w-8 h-8 md:w-10 md:h-10 ${isLocked ? 'text-slate-600' : 'text-red-500'}`} />;
    return <Target className={`w-10 h-10 md:w-12 md:h-12 ${isLocked ? 'text-slate-700' : 'text-red-500'}`} />;
  };

  const totalCompleted = levels.reduce((sum, l) => sum + (l.missions_completed || 0), 0);
  const totalMissions = levels.reduce((sum, l) => sum + (l.missions_total || 0), 0);

  const filteredLevels = levels.filter(level => {
    if (activeFilter === "ALL") return true;
    return (level.category || '').toUpperCase().includes(activeFilter.replace('-', ''));
  });

  return (
    <div className="min-h-screen pb-16 font-sans text-slate-300 selection:bg-red-500/30 selection:text-red-200">
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* TOP TABS (Visual) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
          <div className="flex gap-2 bg-[#0a0a0a] border border-white/5 p-1 rounded-lg self-start">
            <div className="px-6 py-2 rounded-md text-[10px] font-bold tracking-widest text-slate-500 cursor-not-allowed">OVERVIEW</div>
            <div className="px-6 py-2 rounded-md text-[10px] font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">SKILL MAP</div>
            <div className="px-6 py-2 rounded-md text-[10px] font-bold tracking-widest text-slate-500 cursor-not-allowed">ALL MODULES</div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent pointer-events-none z-0"></div>
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#7f1d1d 1px, transparent 1px), linear-gradient(90deg, #7f1d1d 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10 max-w-2xl w-full">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-3">// OPERATIONAL SKILLS //</div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
              OPERATIONAL <span className="text-red-500">SKILLS</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-lg">
              Ascend the operational ladder. Master real DevOps capabilities through hands-on challenges and scenarios.
            </p>
            
            <div className="flex flex-wrap gap-6 md:gap-10">
              <div className="bg-[#111] border border-white/5 rounded-xl p-4 md:p-5 flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
                  <Target className="w-3.5 h-3.5 text-red-500" /> Skills Completed
                </div>
                <div className="text-xl md:text-2xl font-black text-white tracking-tight">{totalCompleted} / {totalMissions}</div>
              </div>
              <div className="bg-[#111] border border-white/5 rounded-xl p-4 md:p-5 flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> Total XP
                </div>
                <div className="text-xl md:text-2xl font-black text-yellow-500 tracking-tight">+{profile.total_xp.toLocaleString()} XP</div>
              </div>
              <div className="bg-[#111] border border-white/5 rounded-xl p-4 md:p-5 flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
                  <Trophy className="w-3.5 h-3.5 text-emerald-500" /> Current Rank
                </div>
                <div className="text-lg md:text-xl font-black text-white tracking-tight leading-none truncate">{profile.title}</div>
              </div>
            </div>
          </div>
          
          {/* Hero Graphic */}
          <div className="hidden lg:flex relative z-10 w-64 h-64 items-center justify-center shrink-0">
             <div className="absolute inset-0 bg-red-500/10 rounded-full blur-[60px]"></div>
             <div className="relative border border-red-500/30 p-10 rounded-2xl bg-[#111]/80 shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur">
               <img src="/k8s-logo.svg" className="w-24 h-24 opacity-90 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" alt="Kubernetes" />
             </div>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-10">
          {["ALL", "LINUX", "DOCKER", "KUBERNETES", "CI/CD", "DEVSECOPS"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all duration-300
                ${activeFilter === filter ? 'bg-red-500/10 border border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-[#0a0a0a] border border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 pb-12">
          
          {/* LEFT: TIMELINE (Desktop Only) */}
          <div className="hidden lg:block w-20 xl:w-24 shrink-0 relative">
            <div className="absolute left-1/2 top-4 bottom-12 w-px -translate-x-1/2 bg-gradient-to-b from-red-600 via-red-900/30 to-transparent z-0"></div>
            <div className="relative z-10 flex flex-col gap-14 pt-8">
              {levels.map((level, i) => (
                <div key={level.id} className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs bg-[#050505] transition-all z-10 shadow-lg
                    ${level.status === 'locked' ? 'border-slate-800 text-slate-700' :
                      level.status === 'completed' ? 'border-emerald-500 text-emerald-400' :
                      'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                    {level.status === 'completed' ? <Check className="w-4 h-4" /> : `0${i + 1}`}
                  </div>
                  <div className={`text-[9px] font-mono mt-3 uppercase tracking-widest text-center whitespace-nowrap
                    ${level.status === 'locked' ? 'text-slate-600' : 'text-slate-400 font-bold'}`}>
                    Level {i+1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: SKILL CARDS */}
          <div className="flex-1 min-w-0 space-y-6">
            {filteredLevels.length === 0 && (
              <div className="text-center py-20 text-slate-500 font-mono text-sm border border-white/5 bg-[#0a0a0a] rounded-2xl">
                NO MODULES FOUND FOR THIS CATEGORY
              </div>
            )}
            
            {filteredLevels.map((level) => {
               const isLocked = level.status === 'locked';
               const isCompleted = level.status === 'completed';
               const done = level.missions_completed || 0;
               const total = level.missions_total || 0;
               const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
               const realIndex = levels.findIndex(l => l.id === level.id);

               return (
                 <Link key={level.id} href={`/levels/${level.id}`} onClick={(e) => { if (isLocked) e.preventDefault(); }}
                   className={`block ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`}>
                   <div className={`bg-[#0a0a0a] border rounded-2xl p-6 md:p-8 transition-all duration-300 relative overflow-hidden
                     ${isLocked ? 'border-white/5' : isCompleted ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'}
                   `}>
                     
                     {/* Inner glowing effect on active card */}
                     {!isLocked && !isCompleted && (
                       <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-transparent blur-2xl z-0 pointer-events-none rounded-2xl"></div>
                     )}

                     <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
                       <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg
                         ${isLocked ? 'bg-[#111] border-slate-800' : isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/30'}`}>
                         {getLogo(level.category, isLocked)}
                       </div>
                       
                       <div className="flex-1 flex flex-col justify-between">
                         <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                           <div>
                             <div className="flex items-center gap-3 mb-1.5">
                               <div className="text-[9px] md:text-[10px] font-mono text-slate-500 tracking-widest uppercase">MODULE 0{realIndex + 1}</div>
                               {!isLocked && !isCompleted && (
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                               )}
                             </div>
                             <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                               {level.name}
                             </h2>
                           </div>
                           <div className={`self-start text-[9px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded border
                             ${isCompleted ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                               isLocked ? 'text-slate-600 border-slate-800 bg-[#111]' :
                               'text-red-400 border-red-500/30 bg-red-500/10'}`}>
                             {isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'IN PROGRESS'}
                           </div>
                         </div>
                         
                         <p className={`text-xs md:text-sm leading-relaxed mb-6 max-w-2xl ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                           {level.description}
                         </p>
                         
                         <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
                           <div className="flex-1">
                             <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                               <span className="text-slate-500 uppercase tracking-wider">{done} / {total} Tasks</span>
                               <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-red-400'}`}>{progressPct}%</span>
                             </div>
                             <div className="h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5">
                               <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                                 style={{ width: `${progressPct}%` }}></div>
                             </div>
                           </div>
                           <div className="flex items-center text-yellow-500/90 text-[11px] font-mono font-bold shrink-0 bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10">
                             <Zap className="w-3.5 h-3.5 mr-1.5" />
                             +{level.xp_reward} XP
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </Link>
               );
            })}
          </div>

          {/* RIGHT: ROADMAP & SIDEBAR */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
            
            {/* OPERATORS ROADMAP */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xs font-black tracking-widest text-white uppercase mb-2">OPERATORS ROADMAP</h3>
              <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                Follow the structured learning path to become a DevOps Master.
              </p>
              <div className="space-y-4">
                {levels.map((level, i) => (
                  <div key={level.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${level.status === 'completed' ? 'border-emerald-500 bg-emerald-500/20' :
                          level.status === 'locked' ? 'border-slate-800 bg-transparent' :
                          'border-red-500 bg-red-500/20'}`}>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Level {i+1}</span>
                        <span className={`text-[10px] font-bold ${level.status === 'locked' ? 'text-slate-500' : 'text-slate-300'}`}>
                          {level.name}
                        </span>
                      </div>
                    </div>
                    <div className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1
                      ${level.status === 'completed' ? 'text-emerald-500' :
                        level.status === 'locked' ? 'text-slate-600' :
                        'text-red-500'}`}>
                      {level.status === 'completed' ? <Check className="w-3 h-3" /> :
                       level.status === 'locked' ? <Lock className="w-3 h-3" /> : null}
                      {level.status === 'completed' ? 'Completed' :
                       level.status === 'locked' ? 'Locked' : 'In Progress'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CERTIFICATION BADGE */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
              <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-4">CERTIFICATION BADGE</div>
              <div className="flex items-center justify-between bg-[#111] border border-white/5 p-4 rounded-xl">
                 <div>
                   <div className="text-xs font-black text-white mb-1.5">{profile.title}</div>
                   <div className="text-[9px] text-slate-500 font-mono">Total {totalCompleted}/{totalMissions} missions</div>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                   <Shield className="w-6 h-6 text-red-500" />
                 </div>
              </div>
            </div>

            {/* NEXT CHALLENGE */}
            {nextMission ? (
              <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                 <div className="text-[9px] font-mono text-red-500 tracking-widest uppercase mb-4 font-bold">NEXT CHALLENGE</div>
                 <div className="flex items-start gap-3 mb-5">
                   <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-500 mt-0.5">
                     <Terminal className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-sm font-black text-white leading-tight mb-2">{nextMission.title}</h4>
                     <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{nextMission.description || 'Continue your operational roadmap.'}</p>
                   </div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-6 bg-[#111] border border-white/5 p-2 rounded-lg">
                   <span className="text-slate-500">REWARD:</span>
                   <div className="text-yellow-500/90 flex items-center"><Zap className="w-3 h-3 mr-1"/> {nextMission.xp_reward || 250} XP</div>
                 </div>
                 <Link href={`/missions/${nextMission.id}`} className="flex justify-center items-center w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                   START CHALLENGE <ArrowRight className="w-3.5 h-3.5 ml-1.5 -mt-0.5" />
                 </Link>
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-center shadow-lg">
                 <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-4">NEXT CHALLENGE</div>
                 <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                   <Check className="w-5 h-5 text-emerald-500" />
                 </div>
                 <h4 className="text-xs font-black text-white mb-2">ALL MISSIONS COMPLETED</h4>
                 <p className="text-[10px] text-slate-400">You have completed all available missions. Standby for new operations.</p>
              </div>
            )}

            {/* RECENTLY UNLOCKED */}
            {profile.achievements && profile.achievements.filter((a: any) => a.unlocked).length > 0 && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-4">RECENTLY UNLOCKED</div>
                <div className="space-y-3">
                  {profile.achievements.filter((a: any) => a.unlocked).slice(0, 3).map((ach: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-[#111] p-3 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-500">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white leading-tight mb-1">{ach.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Achievement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
