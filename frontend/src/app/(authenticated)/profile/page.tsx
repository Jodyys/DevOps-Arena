"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { 
  User, Shield, ShieldAlert, Award, Zap, Activity, Flame, 
  Terminal, Trophy, Calendar, CheckCircle2, Star, Clock 
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetchApi('/auth/me');
        if (profileRes.success) {
          setProfile(profileRes.data);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const totalMissions = 23; // Assuming total missions in system
  const successRate = profile.completed_missions ? Math.round((profile.completed_missions / totalMissions) * 100) : 0;
  
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'OP';
  };

  const getRankColor = (level: number) => {
    if (level >= 15) return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
    if (level >= 10) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (level >= 5) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full font-sans text-slate-300 space-y-8 pb-20">
      
      {/* HEADER / DOSSIER */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#111] border-2 border-red-500/30 flex items-center justify-center font-black text-5xl md:text-6xl text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all">
              {getInitials(profile.username)}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              LEVEL {profile.level || 1}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <Shield className="w-5 h-5 text-slate-500" />
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">OPERATOR DOSSIER</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              {profile.username}
            </h1>
            <div className="text-sm text-slate-400 font-mono mb-6">{profile.email}</div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className={`px-4 py-2 rounded-lg border text-xs font-bold tracking-widest uppercase ${getRankColor(profile.level || 1)}`}>
                {profile.title || 'DevOps Rookie'}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] border border-white/5 text-xs font-mono text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-64 bg-[#111] border border-white/5 rounded-xl p-5 shrink-0 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">XP PROGRESS</div>
              <div className="text-[10px] font-mono text-slate-400">{profile.total_xp} / {profile.nextLevelXp} XP</div>
            </div>
            <div className="w-full bg-[#0a0a0a] h-2.5 rounded-full overflow-hidden border border-white/5 mb-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] relative" 
                style={{ width: `${Math.min(100, ((profile.total_xp || 0) / (profile.nextLevelXp || 200)) * 100)}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20"></div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono leading-relaxed text-center">
              Earn {profile.nextLevelXp - (profile.total_xp || 0)} more XP to reach Level {(profile.level || 1) + 1}.
            </div>
          </div>
          
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'MISSIONS COMPLETED', value: profile.completed_missions || 0, sub: 'Total missions solved', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'SUCCESS RATE', value: `${successRate}%`, sub: 'Overall performance', icon: Activity, color: 'text-blue-500' },
          { label: 'TOTAL XP', value: profile.total_xp?.toLocaleString() || 0, sub: 'Experience points', icon: Zap, color: 'text-yellow-500' },
          { label: 'BEST STREAK', value: `${profile.best_streak || profile.streak || 0} days`, sub: 'Maximum activity streak', icon: Flame, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:bg-[#0e0e0e] hover:border-white/10 transition-colors">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono">{stat.label}</div>
            <div className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.sub}</div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
              <stat.icon className={`w-32 h-32 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ACHIEVEMENTS SHOWCASE */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">Achievements Showcase</h2>
            </div>
            <Link href="/achievements" className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center">
              VIEW ALL <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.achievements && profile.achievements.filter((a: any) => a.unlocked).length > 0 ? (
              profile.achievements.filter((a: any) => a.unlocked).map((ach: any, i: number) => (
                <div key={i} className="bg-[#111] border border-yellow-500/20 rounded-xl p-4 flex gap-4 hover:bg-[#151515] transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 leading-tight">{ach.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-snug">{ach.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 text-center py-10 bg-[#111] rounded-xl border border-white/5">
                <Star className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <div className="text-xs text-slate-500 font-mono">No achievements unlocked yet.</div>
              </div>
            )}
          </div>
        </div>
        
        {/* RECENT ACTIVITY */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">Recent Activity</h2>
            </div>
            <Link href="/logs" className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center">
              LOGS <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-5 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {profile.incidentFeed && profile.incidentFeed.length > 0 ? (
              profile.incidentFeed.slice(0, 6).map((log: any, i: number) => {
                const isMission = log.type === 'mission';
                const isSuccess = log.status === 'completed';
                return (
                  <div key={i} className="flex gap-3 items-start border-l-2 border-white/10 pl-3 relative">
                    <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${isMission ? (isSuccess ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-blue-500'}`}></div>
                    <div>
                      <div className="text-xs text-slate-300 font-bold mb-1 leading-snug">
                        {isMission ? `Mission "${log.title}" ${log.status}` : `Achievement Unlocked: ${log.title}`}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-600 font-mono text-center py-10 border border-dashed border-white/10 rounded-xl">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
