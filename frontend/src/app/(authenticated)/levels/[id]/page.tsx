"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed, TerminalSquare, AlertTriangle, ShieldAlert, Cpu, Lock, Play, Zap, FileText, Check, ChevronRight, Activity, Terminal } from "lucide-react";

export default function LevelDetail() {
  const { id } = useParams();
  const [level, setLevel] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [activeMissionDetails, setActiveMissionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missionLoading, setMissionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        const [levelRes, profileRes] = await Promise.all([
          fetchApi(`/levels/${id}`),
          fetchApi(`/auth/me`)
        ]);

        if (levelRes.success) {
          setLevel(levelRes.data);
          
          // Select first available mission by default
          let toSelect = null;
          for (const m of levelRes.data.missions) {
            if (m.status === 'in_progress' || m.status === 'not_started') {
              toSelect = m.id;
              break;
            }
          }
          if (!toSelect && levelRes.data.missions.length > 0) {
            toSelect = levelRes.data.missions[0].id;
          }
          if (toSelect) setSelectedMissionId(toSelect);
        }
        
        if (profileRes.success) {
          setProfile(profileRes.data);
        }
      } catch (error) {
        console.error(error);
        router.push("/levels");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLevelData();
  }, [id, router]);

  useEffect(() => {
    const fetchMissionDetails = async () => {
      if (!selectedMissionId) return;
      setMissionLoading(true);
      try {
        const res = await fetchApi(`/missions/${selectedMissionId}`);
        if (res.success) {
          setActiveMissionDetails(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setMissionLoading(false);
      }
    };
    fetchMissionDetails();
  }, [selectedMissionId]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#050505]">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 border-[3px] border-red-900/50 border-t-red-500 rounded-full animate-spin shadow-[0_0_30px_rgba(239,68,68,0.3)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <TerminalSquare className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <div className="mt-6 text-[10px] font-mono text-red-500 tracking-[0.3em] uppercase animate-pulse">Establishing Uplink...</div>
      </div>
    </div>
  );

  if (!level) return null;

  const getCategoryWatermark = (category: string) => {
    const baseClass = "w-32 h-32 md:w-48 md:h-48 opacity-90 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-500";
    const cat = category?.toLowerCase() || '';
    if (cat.includes('docker')) return <img src="/docker-logo.svg" className={baseClass} alt="Docker" />;
    if (cat.includes('kubernetes') || cat.includes('k8s')) return <img src="/k8s-logo.svg" className={baseClass} alt="Kubernetes" />;
    if (cat.includes('linux')) return <img src="/linux-logo.svg" className={baseClass} alt="Linux" />;
    if (cat.includes('ci/cd') || cat.includes('cicd') || cat.includes('pipeline')) return <img src="/jenkins-logo.svg" className={baseClass} alt="CI/CD" />;
    if (cat.includes('security') || cat.includes('devsecops') || cat.includes('bash')) return <ShieldAlert className={`w-32 h-32 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]`} />;
    return <Cpu className={`w-32 h-32 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]`} />;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'expert': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'nightmare': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const listMissionData = level.missions.find((m: any) => m.id === selectedMissionId);
  const selectedIndex = level.missions.findIndex((m: any) => m.id === selectedMissionId);

  const getStatusBadge = (status: string, isSmall = false) => {
    if (status === 'completed') return <span className={`text-emerald-500 flex items-center gap-1.5 ${isSmall ? 'text-[9px]' : 'text-xs'} font-bold tracking-widest uppercase`}><CheckCircle2 className={isSmall ? "w-3 h-3" : "w-4 h-4"}/> RESOLVED</span>;
    if (status === 'locked') return <span className={`text-slate-500 flex items-center gap-1.5 ${isSmall ? 'text-[9px]' : 'text-xs'} font-bold tracking-widest uppercase`}><Lock className={isSmall ? "w-3 h-3" : "w-4 h-4"}/> LOCKED</span>;
    if (status === 'in_progress') return <span className={`text-yellow-500 flex items-center gap-1.5 ${isSmall ? 'text-[9px]' : 'text-xs'} font-bold tracking-widest uppercase`}><CircleDashed className={`${isSmall ? "w-3 h-3" : "w-4 h-4"} animate-spin-slow`}/> IN PROGRESS</span>;
    return <span className={`text-blue-400 flex items-center gap-1.5 ${isSmall ? 'text-[9px]' : 'text-xs'} font-bold tracking-widest uppercase`}><div className={`${isSmall ? "w-1.5 h-1.5" : "w-2 h-2"} bg-blue-500 rounded-full animate-pulse`}/> AVAILABLE</span>;
  };

  const totalMissions = level.missions.length;
  const completedMissions = level.missions.filter((m: any) => m.status === 'completed').length;
  const xpProgress = profile?.total_xp || 0;

  return (
    <div className="min-h-screen pb-16 font-sans text-slate-300 selection:bg-red-500/30 selection:text-red-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-3 pt-6 mb-8 text-[10px] font-mono tracking-widest uppercase">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">ARENA</Link>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <Link href="/levels" className="text-slate-500 hover:text-slate-300 transition-colors">SKILL MAP</Link>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className="text-red-500 font-bold">0{level.id} {level.category}</span>
        </div>

        {/* MODULE HEADER */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
            <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-[#111] border border-white/5 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              {getCategoryWatermark(level.category)}
            </div>
            
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">MODULE 0{level.id}</div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="text-[9px] font-bold tracking-widest uppercase px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md w-fit mx-auto md:mx-0">
                  {totalMissions} MISSIONS
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">{level.name}</h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mb-8 mx-auto md:mx-0">
                {level.description}
              </p>
              
              <div className="max-w-md w-full">
                <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                  <span className="text-slate-500 font-bold tracking-widest"><Zap className="w-3 h-3 inline mr-1 text-yellow-500"/> XP PROGRESS</span>
                  <span className="text-yellow-500 font-bold">{xpProgress.toLocaleString()} XP</span>
                </div>
                <div className="h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000" style={{ width: `${Math.min(100, (xpProgress / 5000) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MISSION TABS */}
        <div className="flex gap-8 mb-8 border-b border-white/5 pb-0">
           <div className="pb-3 border-b-2 border-red-500 text-white text-[11px] font-bold tracking-widest uppercase">MISSIONS</div>
        </div>

        {/* 2-COLUMN HUB */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 pb-12 items-start">
          
          {/* LEFT PANEL: MISSION LIST */}
          <div className="w-full lg:w-[45%] shrink-0 flex flex-col gap-4">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2 font-bold px-2">MISSION LIST ({totalMissions})</div>
            
            <div className="space-y-4">
              {level.missions.map((mission: any, idx: number) => {
                const isSelected = selectedMissionId === mission.id;
                const isLocked = mission.status === 'locked';
                const isCompleted = mission.status === 'completed';
                const diffColor = getDifficultyColor(mission.difficulty);
                const progressPct = isCompleted ? 100 : (mission.status === 'in_progress' ? 50 : 0);
                
                return (
                  <div 
                    key={mission.id}
                    onClick={() => !isLocked && setSelectedMissionId(mission.id)}
                    className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300
                      ${isLocked ? 'cursor-not-allowed bg-[#080808] border-white/5 opacity-70' : 'cursor-pointer'}
                      ${isSelected && !isLocked ? 'bg-[#111] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : !isLocked ? 'bg-[#0a0a0a] border-white/10 hover:border-white/20 hover:bg-[#0e0e0e]' : ''}
                    `}
                  >
                    {/* Left highlight bar */}
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}

                    <div className="flex gap-5">
                      {/* Number Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border font-mono font-bold text-xs
                        ${isSelected ? 'bg-red-500/10 border-red-500/30 text-red-500' : isLocked ? 'bg-[#111] border-white/5 text-slate-600' : isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-[#111] border-white/10 text-slate-400'}
                      `}>
                        0{idx + 1}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className={`font-bold text-sm tracking-tight ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                            {mission.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(mission.status, true)}
                          </div>
                        </div>

                        <p className={`text-xs mb-4 line-clamp-2 leading-relaxed ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                          {isLocked ? mission.lockedReason : mission.description}
                        </p>

                        {!isLocked && (
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-[8px] font-bold tracking-widest uppercase border ${diffColor}`}>
                                {mission.difficulty}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono flex items-center">
                                <Activity className="w-3 h-3 mr-1" /> —
                              </span>
                            </div>
                            
                            <div className="w-24">
                              <div className="flex justify-end text-[8px] font-mono font-bold mb-1.5">
                                <span className={isCompleted ? 'text-emerald-500' : 'text-slate-500'}>{progressPct}%</span>
                              </div>
                              <div className="h-1 bg-[#151515] rounded-full overflow-hidden border border-white/5">
                                <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${progressPct}%` }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isLocked && (
                          <div className="mt-auto flex justify-between items-center">
                            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> Complete previous missions
                            </div>
                            <Lock className="w-4 h-4 text-slate-700" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: MISSION DETAILS */}
          <div className="w-full lg:w-[55%] flex flex-col">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8 sticky top-6 shadow-xl min-h-[600px] flex flex-col">
              
              {!selectedMissionId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <Terminal className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm font-mono uppercase tracking-widest">SELECT A MISSION TO VIEW DETAILS</p>
                </div>
              ) : missionLoading || !activeMissionDetails ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-red-900 border-t-red-500 rounded-full animate-spin mb-4"></div>
                  <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase animate-pulse">Loading Mission Profile...</div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-red-500 tracking-widest uppercase font-bold">
                      <TargetIcon className="w-4 h-4" /> MISSION DETAILS
                    </div>
                    {getStatusBadge(listMissionData?.status || 'not_started')}
                  </div>

                  <div className="mb-8">
                    <div className="text-[10px] font-mono text-red-500 tracking-widest uppercase mb-3 font-bold">MISSION 0{selectedIndex + 1}</div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">{activeMissionDetails.title}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{activeMissionDetails.description}</p>
                  </div>

                  {/* METRICS */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    <div>
                      <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1.5">DIFFICULTY</div>
                      <div className={`inline-block px-3 py-1 rounded border text-[10px] font-bold tracking-widest uppercase ${getDifficultyColor(activeMissionDetails.difficulty)}`}>
                        {activeMissionDetails.difficulty}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1.5">EST. TIME</div>
                      <div className="text-xs font-bold text-white font-mono flex items-center">
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> —
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1.5">XP REWARD</div>
                      <div className="text-xs font-bold text-yellow-500 font-mono flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1.5" /> +{activeMissionDetails.xp_reward || 1000} XP
                      </div>
                    </div>
                  </div>

                  {/* OBJECTIVES */}
                  {activeMissionDetails.objective && (
                    <div className="mb-10">
                      <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-4 font-bold">OBJECTIVES</div>
                      <div className="space-y-3">
                         {/* Render objectives by splitting newlines, assuming backend formats it well */}
                         {activeMissionDetails.objective.split('\n').filter((o: string) => o.trim().length > 0).map((obj: string, i: number) => (
                           <div key={i} className="flex items-start gap-3">
                             <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${listMissionData?.status === 'completed' ? 'text-emerald-500' : 'text-slate-600'}`} />
                             <span className={`text-sm ${listMissionData?.status === 'completed' ? 'text-slate-300' : 'text-slate-400'}`}>{obj.replace(/^- /, '')}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  {/* PROBLEM PREVIEW (Only if hints/logs are available in backend) */}
                  {activeMissionDetails.hints && (
                    <div className="mb-8">
                      <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-4 font-bold">PROBLEM PREVIEW / HINTS</div>
                      <div className="bg-[#111] border border-white/5 rounded-xl p-5 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50 rounded-t-xl"></div>
                        <pre className="text-xs text-red-400/90 font-mono whitespace-pre-wrap leading-relaxed">
                          {activeMissionDetails.hints}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="mt-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                    <Link href={`/missions/${selectedMissionId}`} className={`flex-1 flex justify-center items-center py-3.5 text-white text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]
                      ${listMissionData?.status === 'completed' ? 'bg-slate-700 hover:bg-slate-600 shadow-none' : 'bg-red-600 hover:bg-red-500'}
                    `}>
                      <Play className="w-4 h-4 mr-2" /> 
                      {listMissionData?.status === 'completed' ? 'REPLAY MISSION' : listMissionData?.status === 'in_progress' ? 'CONTINUE MISSION' : 'START MISSION'}
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            {/* BOTTOM TIP */}
            <div className="mt-6 bg-[#0a0a0a] border border-yellow-500/10 rounded-xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-500">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-yellow-500 tracking-widest uppercase mb-1 font-bold">TIP OF THE DAY</div>
                <div className="text-xs text-slate-400">Remember to carefully read the mission objectives and hints before interacting with the sandbox.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple icon component to keep imports clean
function TargetIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
