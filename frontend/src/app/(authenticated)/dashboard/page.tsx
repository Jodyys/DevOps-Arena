"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ShieldAlert, CheckCircle2, Flame, Activity, Play, XCircle, RotateCcw, Lock, Server, Terminal, Network, Shield, Map, ArrowRight, Container, ShipWheel, GitBranch, LayoutDashboard, ClipboardList, Zap, User } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const TOTAL_MISSIONS = 23;

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetchApi('/auth/reset', { method: 'POST' });
      setShowResetModal(false);
      setResetting(false);
      // Reload profile data without logout
      const [profileRes, levelsRes] = await Promise.all([
        fetchApi('/auth/me'),
        fetchApi('/levels')
      ]);
      if (profileRes.success) setProfile(profileRes.data);
      if (levelsRes.data) setLevels(levelsRes.data);
    } catch (err) {
      setResetting(false);
      setShowResetModal(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const [profileRes, levelsRes] = await Promise.all([
          fetchApi('/auth/me'),
          fetchApi('/levels')
        ]);

        if (profileRes.success) {
          setProfile(profileRes.data);
        } else {
          router.push('/login');
        }

        if (levelsRes.data) {
          setLevels(levelsRes.data);
        }
      } catch (err: any) {
        console.error("Dashboard error", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-red-500 animate-pulse font-mono text-[10px]">INIT</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-8 rounded-xl text-center max-w-md shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-sm">
         <ShieldAlert className="w-12 h-12 mx-auto mb-4 animate-pulse" />
         <h2 className="text-xl font-bold mb-2 tracking-wider">CONNECTION FAILED</h2>
         <p className="text-sm font-mono opacity-80">{error}</p>
         <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest text-xs uppercase rounded transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]">
           Re-establish Connection
         </button>
      </div>
    </div>
  );

  if (!profile) return null;

  const xpPercentage = Math.min(100, Math.round(((profile.total_xp || 0) / (profile.nextLevelXp || 200)) * 100));

  const getCategoryIcon = (category: string) => {
    const imgClass = `w-12 h-12 transition-all duration-500 opacity-90 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-110`;
    switch (category?.toLowerCase()) {
      case 'docker': return <img src="/docker-logo.svg" className={imgClass} alt="Docker" />;
      case 'kubernetes': return <img src="/k8s-logo.svg" className={imgClass} alt="Kubernetes" />;
      case 'linux': return <img src="/linux-logo.svg" className={imgClass} alt="Linux" />;
      case 'ci/cd & devsecops': 
      case 'ci/cd': return <img src="/jenkins-logo.svg" className={imgClass} alt="CI/CD" />;
      case 'devsecops':
      case 'security': return <img src="/bash-logo.svg" className={imgClass} alt="Security" />;
      default: return <Map className="w-12 h-12 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Background ambient glows */}
      <div className="fixed top-0 left-[20%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] z-[-1] pointer-events-none"></div>
      <div className="fixed bottom-0 right-[20%] w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[150px] z-[-1] pointer-events-none"></div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center mb-6 text-red-500">
              <ShieldAlert className="w-8 h-8 mr-4 animate-pulse" />
              <h2 className="text-2xl font-bold tracking-widest uppercase">System Purge</h2>
            </div>
            <p className="text-slate-400 mb-8 font-mono text-sm leading-relaxed">
              WARNING: This action is irreversible. All accumulated XP, completed missions, and achievements will be permanently purged from the registry.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowResetModal(false)} className="flex-1 px-4 py-3.5 bg-[#111111] text-slate-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 border border-white/10 transition-colors">Abort</button>
              <button onClick={handleReset} disabled={resetting} className="flex-1 px-4 py-3.5 bg-red-600/90 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all">
                {resetting ? 'Purging...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION (HUD Style) */}
      <div className="relative overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,51,51,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,51,51,0.02)_1px,transparent_1px)] bg-[size:20px_20px] z-0 pointer-events-none opacity-50"></div>
        
        <div className="relative z-10 flex items-center">
          <div className="w-[72px] h-[72px] border border-red-500/40 rounded-lg flex items-center justify-center mr-5 bg-black shadow-[0_0_25px_rgba(239,68,68,0.3)] relative overflow-hidden">
             <img 
               src="/hacker-avatar.jpg" 
               className="w-full h-full object-cover object-top" 
               alt="Operator" 
               style={{ 
                 filter: `hue-rotate(${
                   String(profile.username || 'admin').split('').reduce((hash, char) => {
                     return char.charCodeAt(0) + ((hash << 5) - hash);
                   }, 0) % 360
                 }deg)` 
               }}
             />
             <div className="absolute inset-0 ring-1 ring-inset ring-red-500/30 rounded-lg pointer-events-none"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-red-500 uppercase tracking-widest font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <span>OPERATOR SESSION</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              {profile.username}
            </h1>
            <p className="text-slate-400 text-sm mb-2">{profile.title || 'DevOps Rookie'} • Level {profile.level || 1}</p>
            <div className="flex space-x-3">
               <span className="text-[9px] font-mono tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">SESSION ACTIVE</span>
               <span className="text-[9px] font-mono tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center"><span className="w-1 h-1 rounded-full bg-emerald-400 mr-1.5"></span>AUTHENTICATED</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="bg-[#111111] p-4 rounded-xl border border-white/5 shadow-inner w-full md:w-[300px]">
            <div className="flex justify-between items-end mb-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">XP PROGRESS</div>
              <div className="text-sm font-mono text-slate-300">
                <span className="text-white font-bold text-lg">{profile.total_xp || 0}</span> <span className="opacity-50">/ {profile.nextLevelXp || 200} XP</span>
              </div>
            </div>
            <div className="h-2 bg-[#050505] rounded-full overflow-hidden shadow-inner border border-white/5">
              <div 
                className="h-full bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.7)] relative transition-all duration-1000 ease-out"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
               <div className="absolute inset-0 border border-red-500/30 rotate-45 rounded-lg"></div>
               <div className="absolute inset-2 border border-red-500/20 rotate-45 rounded-lg"></div>
               <div className="text-3xl font-black text-white z-10 tracking-tighter">{profile.level || 1}</div>
               <div className="absolute -bottom-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">LEVEL</div>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/60 text-red-500 text-[9px] font-mono font-bold tracking-widest uppercase transition-all mt-4 group"
            >
              <RotateCcw className="w-3 h-3 group-hover:rotate-[-180deg] transition-transform duration-500" />
              RESET PROGRESS
            </button>
          </div>
        </div>
      </div>

      {/* 4 EQUAL STATS CARDS (Glassmorphism) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'MISSIONS COMPLETED', value: profile.completed_missions || 0, sub: 'Total missions solved', icon: ClipboardList, color: 'text-red-500' },
          { label: 'SUCCESS RATE', value: profile.completed_missions ? Math.round((profile.completed_missions / TOTAL_MISSIONS)*100) + '%' : '0%', sub: 'Successful missions', icon: Activity, color: 'text-red-500' },
          { label: 'TOTAL XP', value: profile.total_xp || 0, sub: 'Experience points earned', icon: Trophy, color: 'text-red-500' },
          { label: 'CURRENT STREAK', value: `${profile.streak || 0} days`, sub: 'Keep it up!', icon: Flame, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-lg p-4 flex flex-col group transition-all duration-500 hover:border-red-500/30 hover:-translate-y-1 relative overflow-hidden shadow-lg">
            <div className="relative z-10 h-full flex flex-col">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">{stat.label}</div>
              <div className="text-3xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
              <div className="text-[10px] text-slate-500 mb-2 flex-grow">{stat.sub}</div>
              <div className="absolute right-3 bottom-3">
                 <stat.icon className={`w-8 h-8 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW: CONTINUE LEARNING & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Continue Learning */}
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-xl p-5 md:p-6 flex flex-col shadow-2xl relative overflow-hidden group/container">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900 opacity-50"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDE0OCwxNjMsMTg0LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBoLTQweiIvPjwvZz48L3N2Zz4=')] opacity-50 z-0 pointer-events-none"></div>
            
            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center font-mono relative z-10">
              <ShieldAlert className="w-4 h-4 mr-2" /> PRIORITY INCIDENT
            </div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
              {profile.continueMissionId ? (
                <div className="flex justify-between items-center">
                  <div className="max-w-[60%]">
                    <div className="inline-flex items-center px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-500 text-[9px] font-mono tracking-widest uppercase mb-4">
                      KUBERNETES / M-03
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Fix Database Connection</h3>
                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                      Backend cannot establish connection to PostgreSQL in namespace <span className="text-red-400 font-mono">ns-challenges</span>
                    </p>
                    <div className="flex gap-6 mb-8 text-xs font-mono uppercase tracking-widest">
                       <div>
                         <div className="text-slate-500 mb-1">DIFFICULTY</div>
                         <div className="text-emerald-500 font-bold">EASY</div>
                       </div>
                       <div>
                         <div className="text-slate-500 mb-1">REWARD</div>
                         <div className="text-red-500 font-bold">+250 XP</div>
                       </div>
                       <div>
                         <div className="text-slate-500 mb-1">EST. TIME</div>
                         <div className="text-yellow-500 font-bold">~5 MIN</div>
                       </div>
                    </div>
                    <Link href={`/missions/${profile.continueMissionId}`} className="group/btn inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all">
                      INVESTIGATE INCIDENT <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className="relative w-40 h-40 hidden md:flex items-center justify-center border border-white/5 rounded-full">
                     <Server className="w-20 h-20 text-slate-700 absolute" />
                     <XCircle className="w-8 h-8 text-red-500 absolute bottom-4 right-4 bg-[#0a0a0a] rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" />
                     <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-flex items-center px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                    Status: Standby
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">No Active Incidents</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                    You have cleared the current queue. Browse the Skill Map to review all available operational modules.
                  </p>
                  <Link href="/levels" className="group/btn inline-flex items-center px-6 py-3 bg-[#111111] hover:bg-slate-800 text-slate-200 text-xs font-bold tracking-widest uppercase rounded border border-white/10 transition-all">
                    Open Skill Map <Map className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* System Status Panel */}
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-xl p-4 md:p-5 relative overflow-hidden group">
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center font-mono">
              <Server className="w-4 h-4 mr-2 text-red-500" /> INFRASTRUCTURE TELEMETRY
            </div>
            
            <div className="flex items-center mb-6 bg-[#111111] border border-white/5 rounded-lg px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase font-mono">ALL SYSTEMS OPERATIONAL</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Challenge Engine', status: 'Online' },
                { name: 'Kubernetes Cluster', status: 'Online' },
                { name: 'Validation Engine', status: 'Online' },
                { name: 'CI/CD Pipeline', status: 'Online' }
              ].map((sys, idx) => (
                <div key={idx} className="flex flex-col p-3 rounded-lg bg-[#111111] border border-white/5">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-2">{sys.name}</span>
                  <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest flex items-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                     {sys.status}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
               <span>Last updated: 2 minutes ago</span>
               <RotateCcw className="w-3 h-3 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-5 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-xl p-5 md:p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center font-mono relative z-10">
            <Zap className="w-4 h-4 mr-2 text-red-500" /> OPERATOR LOGBOOK
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {(!profile.incidentFeed || profile.incidentFeed.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[300px] bg-[#111111] border border-white/5 rounded-xl border-dashed">
                <ClipboardList className="w-10 h-10 mb-4 opacity-50 text-slate-600" />
                <p className="text-xs font-bold tracking-widest text-white mb-2 font-mono">NO LOGS DETECTED</p>
                <p className="text-[10px] text-center max-w-[200px] mb-6 opacity-70 leading-relaxed font-mono">Your operational history will be recorded here after completing your first mission.</p>
                <Link href="/levels" className="px-5 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded uppercase tracking-widest transition-all">
                   VIEW FIRST MISSION
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.incidentFeed.map((item: any, i: number) => {
                  const isAchievement = item.type === 'achievement';
                  const isSuccess = !isAchievement && item.status === 'completed';
                  
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="text-[9px] font-mono text-slate-500 pt-1 shrink-0">--:--</div>
                      <div className="flex-1 bg-[#111111] border border-white/5 rounded-lg p-3 hover:border-red-500/30 transition-colors relative overflow-hidden group/log">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/20 group-hover/log:bg-red-500 transition-colors"></div>
                        <div className="text-sm font-bold text-slate-200 mb-1">{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                           {isAchievement ? 'Achievement unlocked.' : (isSuccess ? 'Mission completed.' : 'Mission failed.')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* LEARNING PATH (Gamified nodes) */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-xl p-5 md:p-6 relative overflow-hidden">
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center font-mono">
          <Map className="w-4 h-4 mr-2 text-red-500" /> OPERATIONAL SKILL MAP
        </div>
        
        <div className="relative pt-4 pb-6">
          {/* Horizontal connection line for desktop with glow */}
          <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-[#1a1a1a] border-y border-white/5 z-0">
             <div className="absolute inset-0 bg-red-500/20 w-[40%] blur-[2px]"></div>
          </div>
          
          {/* Vertical connection line for mobile */}
          <div className="md:hidden absolute top-12 bottom-12 left-[47px] w-[2px] bg-[#1a1a1a] z-0 border-x border-white/5"></div>

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-10 md:gap-4 px-2">
            {[...levels].sort((a, b) => {
              const order = ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'DevSecOps'];
              const aIdx = order.indexOf(a.category);
              const bIdx = order.indexOf(b.category);
              return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
            }).map((level, i) => {
              const isLocked = level.status === 'locked';
              const isCompleted = level.status === 'completed';
              const isInProgress = !isLocked && !isCompleted;
              
              return (
                <div key={level.id} className="flex md:flex-col items-center flex-1 group">
                  <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 bg-[#050505] z-10
                    ${isCompleted ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 
                      isLocked ? 'border-white/5' : 
                      'border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]'}
                  `}>
                    {isLocked ? <Lock className="w-8 h-8 text-slate-700" /> : getCategoryIcon(level.category)}
                    
                    {/* Node Lock icon (overlay on top right) */}
                    {isLocked && (
                      <div className="absolute -right-2 -top-2 w-6 h-6 bg-[#050505] border-2 border-white/5 rounded flex items-center justify-center">
                         <Lock className="w-3 h-3 text-slate-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-8 md:ml-0 md:mt-6 text-left md:text-center w-full bg-[#111111] p-3 rounded-lg border border-white/5">
                    <div className={`text-xs md:text-sm font-black tracking-widest uppercase mb-2 ${isLocked ? 'text-slate-600' : 'text-slate-200'}`}>
                      {level.category}
                    </div>
                    {!isLocked && (
                      <div className="text-[9px] font-mono text-slate-500 flex items-center justify-center md:justify-center">
                        <span className="text-white font-bold mr-1">{level.missions_completed || 0}</span> / {level.missions_total || 0}
                      </div>
                    )}
                    {isLocked && (
                      <div className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Restricted</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center mt-12 gap-6 text-[9px] font-mono uppercase tracking-widest">
             <div className="flex items-center text-slate-400"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> COMPLETED</div>
             <div className="flex items-center text-slate-400"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> IN PROGRESS</div>
             <div className="flex items-center text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-700 mr-2"></span> LOCKED</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
