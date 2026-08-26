"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, Activity, Flame, ClipboardList, AlertTriangle, 
  GitBranch, Server, Box, GitCommit, PlayCircle, 
  CheckCircle2, ArrowRight, XCircle, Terminal, 
  ShieldAlert, Activity as ActivityIcon, Cloud, Check, Cpu, HardDrive, Network, RotateCcw, Map
} from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const TOTAL_MISSIONS = 23;

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const profileRes = await fetchApi('/auth/me');
        if (profileRes.success) {
          setProfile(profileRes.data);
        } else {
          router.push('/login');
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-red-500 font-mono text-sm">{error}</div>
    </div>
  );

  if (!profile) return null;

  const successRate = profile.completed_missions ? Math.round((profile.completed_missions / TOTAL_MISSIONS) * 100) : 0;
  
  // Fake pipeline state logic just for visual consistency, using existing profile data if possible
  const hasActiveIncident = !!profile.continueMissionId;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-8 animate-in fade-in duration-500">
      
      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MISSIONS COMPLETED', value: profile.completed_missions || 0, sub: 'Total missions solved', icon: ClipboardList, color: 'text-red-500' },
          { label: 'SUCCESS RATE', value: `${successRate}%`, sub: 'Successful missions', icon: Activity, color: 'text-emerald-500' },
          { label: 'TOTAL XP', value: profile.total_xp || 0, sub: 'Experience points earned', icon: Trophy, color: 'text-purple-500' },
          { label: 'CURRENT STREAK', value: `${profile.streak || 0} days`, sub: 'Keep it up!', icon: Flame, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono">{stat.label}</div>
            <div className="text-3xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.sub}</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
              <stat.icon className={`w-12 h-12 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* LIVE DEVOPS OPERATIONS */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LIVE DEVOPS OPERATIONS</span>
          <span className="ml-auto text-[9px] text-slate-600 font-mono">Last updated: Just now <RotateCcw className="w-3 h-3 inline ml-1" /></span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="border border-white/5 rounded p-3 bg-[#111111] flex flex-col justify-center gap-1 col-span-2">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              <div className="text-[9px] text-slate-500 font-mono">CLUSTER STATUS</div>
            </div>
            <div className="text-emerald-400 font-bold text-sm tracking-widest mt-1">HEALTHY</div>
          </div>
          
          <div className="border border-white/5 rounded p-3 bg-[#111111] flex flex-col justify-center gap-1 col-span-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-yellow-500" />
              <div className="text-[9px] text-slate-500 font-mono">CI/CD PIPELINE</div>
            </div>
            <div className="text-yellow-500 font-bold text-sm tracking-widest mt-1">STANDBY</div>
          </div>

          <div className="border border-white/5 rounded p-3 bg-[#111111] flex flex-col justify-center gap-1">
            <div className="text-[9px] text-slate-500 font-mono">SERVICES</div>
            <div className="text-emerald-400 font-bold text-sm tracking-widest">HEALTHY</div>
          </div>

          <div className="border border-white/5 rounded p-3 bg-[#111111] flex flex-col justify-center gap-1 col-span-2">
            <div className="flex items-center gap-2">
              <Box className={`w-5 h-5 ${hasActiveIncident ? 'text-red-500' : 'text-slate-500'}`} />
              <div className="text-[9px] text-slate-500 font-mono">SANDBOX</div>
            </div>
            <div className={`font-bold text-sm tracking-widest mt-1 ${hasActiveIncident ? 'text-red-500' : 'text-slate-500'}`}>
              {hasActiveIncident ? '● ACTIVE' : '○ STANDBY'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* LIVE CI/CD PIPELINE */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LIVE CI/CD PIPELINE</span>
              </div>
              <div className="text-[9px] font-mono text-slate-600">STANDBY</div>
            </div>
            
            <div className="flex items-center justify-between px-4 py-8 relative">
              {/* Connecting Line */}
              <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
              
              {[
                { label: 'GITHUB', status: 'READY', icon: GitBranch, color: 'text-emerald-500' },
                { label: 'JENKINS', status: 'STANDBY', icon: PlayCircle, color: 'text-slate-500' },
                { label: 'DOCKER', status: 'STANDBY', icon: Box, color: 'text-slate-500' },
                { label: 'REGISTRY', status: 'STANDBY', icon: Cloud, color: 'text-slate-500' },
                { label: 'KUBERNETES', status: 'READY', icon: Server, color: 'text-emerald-500' },
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-3 bg-[#0a0a0a] px-2">
                  <div className={`w-12 h-12 rounded-lg border border-white/10 bg-[#111111] flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-300 font-mono mb-1">{step.label}</div>
                    <div className={`text-[9px] font-mono uppercase ${step.status === 'READY' ? 'text-emerald-500' : 'text-slate-600'}`}>{step.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRIORITY INCIDENT */}
          <div className="bg-[#0a0a0a] border border-red-500/20 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">PRIORITY INCIDENT</span>
            </div>
            
            {hasActiveIncident ? (
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white mb-2 uppercase">MISSION M-{(profile.continueMissionId || 0).toString().padStart(2, '0')}</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-lg">
                    KUBERNETES INCIDENT
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="px-2 py-1 rounded bg-[#111111] border border-white/10 text-[10px] font-mono text-slate-400">
                      Sandbox: <span className="text-white font-bold">ACTIVE</span>
                    </div>
                  </div>
                  <Link href={`/missions/${profile.continueMissionId}`} className="inline-flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">
                    INVESTIGATE INCIDENT <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
                <div className="hidden md:flex flex-col gap-4 min-w-[200px]">
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono mb-1">STATUS</div>
                    <div className="text-red-500 font-bold text-sm tracking-widest">INVESTIGATION REQUIRED</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-block px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 mb-4">
                  SANDBOX STANDBY
                </div>
                <p className="text-slate-400 text-sm">No active mission. Cluster is operating normally.</p>
              </div>
            )}
          </div>
          
          {/* OPERATIONAL SKILL MAP */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-6">
              <Map className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">OPERATIONAL SKILL MAP</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-between px-2 py-4 relative gap-y-6">
              <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden md:block"></div>
              
              {[
                { label: 'LINUX', status: 'COMPLETED', color: 'text-emerald-500', border: 'border-emerald-500/50' },
                { label: 'DOCKER', status: 'IN PROGRESS', color: 'text-yellow-500', border: 'border-yellow-500/50' },
                { label: 'KUBERNETES', status: 'IN PROGRESS', color: 'text-yellow-500', border: 'border-yellow-500/50' },
                { label: 'CI/CD', status: 'IN PROGRESS', color: 'text-yellow-500', border: 'border-yellow-500/50' },
                { label: 'DEVSECOPS', status: 'LOCKED', color: 'text-slate-600', border: 'border-white/10' },
              ].map((skill, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-3 bg-[#0a0a0a] px-2 md:px-4 w-1/3 md:w-auto">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border ${skill.border} bg-[#111111] flex items-center justify-center`}>
                    <img src={`/${skill.label.toLowerCase().replace('/','')}-logo.svg`} alt={skill.label} className="w-6 h-6 md:w-8 md:h-8 opacity-80" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-300 font-mono mb-1">{skill.label}</div>
                    <div className={`text-[8px] md:text-[9px] font-mono uppercase ${skill.color}`}>{skill.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* LIVE MONITORING */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LIVE MONITORING (CLUSTER)</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'CPU', icon: Cpu },
                { label: 'MEMORY', icon: HardDrive },
                { label: 'NETWORK', icon: Network },
              ].map((chart, i) => (
                <div key={i} className="bg-[#111111] border border-white/5 rounded p-4 h-24 flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] text-slate-500 font-mono flex items-center gap-2">
                      <chart.icon className="w-4 h-4 text-slate-600" /> {chart.label}
                    </div>
                    <div className="text-[9px] text-emerald-500 font-mono tracking-widest">
                      MONITORING READY
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OPERATOR LOGBOOK */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">OPERATOR LOGBOOK</span>
              </div>
              <Link href="/profile" className="text-[9px] text-blue-400 hover:text-blue-300 font-mono flex items-center">
                View all logs <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {profile.incidentFeed && profile.incidentFeed.length > 0 ? (
                profile.incidentFeed.map((log: any, i: number) => {
                  const isMission = log.type === 'mission';
                  const isSuccess = log.status === 'completed';
                  return (
                    <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isMission ? (isSuccess ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-300 mb-1 leading-snug">
                          {isMission ? `Mission "${log.title}" ${log.status}` : `Achievement Unlocked: ${log.title}`}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="uppercase">{log.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[10px] text-slate-600 font-mono text-center py-4">No recent activity</div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
