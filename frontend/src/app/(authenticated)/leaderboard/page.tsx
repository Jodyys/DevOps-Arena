"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Trophy, Flame, Shield, Award, Users, Activity, Crown, Star } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lbRes, profileRes, usersRes] = await Promise.all([
          fetchApi('/users/leaderboard'),
          fetchApi('/auth/me'),
          fetchApi('/users') // used purely for global stats
        ]);
        
        if (lbRes.data) setLeaderboard(lbRes.data);
        if (profileRes.data) setProfile(profileRes.data);
        if (usersRes.data) {
          setTotalUsers(usersRes.data.length);
          const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
          setActiveUsers(usersRes.data.filter((u: any) => u.last_active_at && new Date(u.last_active_at).getTime() > thirtyDaysAgo).length);
        }
      } catch (error) {
        console.error("Failed to load leaderboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-300 selection:bg-red-500/30 selection:text-red-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* HERO HEADER */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch pt-6 mb-12">
          
          {/* Main Title Card */}
          <div className="flex-1 bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-8 relative overflow-hidden flex items-center justify-center lg:justify-start shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <Trophy className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500 hidden sm:block" />
                  ARENA LEADERBOARD
                  <Trophy className="w-6 h-6 text-yellow-500 hidden sm:block" />
                </h1>
                <p className="text-slate-400 mt-1">Top Operators in the DevOps Arena</p>
              </div>
            </div>
          </div>
          
          {/* Stats Box */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center gap-8 shadow-xl shrink-0">
            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2">TOTAL OPERATORS</div>
              <div className="flex justify-center items-center gap-3">
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-3xl font-black text-white">{totalUsers}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2">ACTIVE THIS MONTH</div>
              <div className="flex justify-center items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-3xl font-black text-white">{activeUsers}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
          <div className="flex gap-6 border-b border-white/5 px-2 w-full sm:w-auto">
            <button className="pb-3 border-b-2 border-red-500 text-white text-[11px] font-bold tracking-widest uppercase">ALL TIME</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 text-[11px] font-bold tracking-widest uppercase cursor-not-allowed">THIS MONTH</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 text-[11px] font-bold tracking-widest uppercase cursor-not-allowed">THIS WEEK</button>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <select className="bg-[#111] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest rounded px-4 py-2 outline-none focus:border-red-500">
              <option>ALL SKILLS</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* PODIUM */}
            {top3.length > 0 && (
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 mb-16 pt-8">
                
                {/* RANK 2 - SILVER */}
                {top3[1] && (
                  <div className="w-full md:w-72 order-2 md:order-1 relative group">
                    <div className="bg-gradient-to-b from-slate-300/10 to-[#0a0a0a] border border-slate-300/30 rounded-t-2xl p-6 text-center shadow-[0_0_30px_rgba(203,213,225,0.05)] relative z-10 transition-transform group-hover:-translate-y-2">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-200 text-slate-900 font-black text-xl flex items-center justify-center rounded-full border-4 border-[#050505] shadow-[0_0_15px_rgba(203,213,225,0.5)] z-20">
                        2
                      </div>
                      
                      <div className="w-20 h-20 mx-auto bg-[#111] border-2 border-slate-300/50 rounded-xl flex items-center justify-center text-3xl font-bold text-slate-300 mt-4 mb-4">
                        {top3[1].username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="font-bold text-xl text-white mb-1 flex items-center justify-center gap-2">
                        {top3[1].username}
                        {profile?.id === top3[1].id && <span className="text-[9px] font-mono bg-slate-300/20 text-slate-300 px-1.5 py-0.5 rounded uppercase">YOU</span>}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-6">{top3[1].title}</div>
                      
                      <div className="flex justify-between border-t border-slate-300/10 pt-4">
                        <div className="text-left">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">STREAK</div>
                          <div className="text-xs font-bold text-white flex items-center gap-1"><Flame className="w-3 h-3 text-slate-400" /> {top3[1].best_streak} Days</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">TOTAL XP</div>
                          <div className="text-sm font-black text-slate-300 flex items-center gap-1 justify-end"><Zap className="w-3 h-3" /> {top3[1].total_xp.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    {/* Podium base */}
                    <div className="h-4 bg-slate-300/20 rounded-b-xl border-x border-b border-slate-300/30"></div>
                  </div>
                )}
                
                {/* RANK 1 - GOLD */}
                {top3[0] && (
                  <div className="w-full md:w-80 order-1 md:order-2 relative z-20 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-yellow-500/50 to-transparent rounded-t-2xl blur-md opacity-50 pointer-events-none group-hover:opacity-80 transition-opacity"></div>
                    <div className="bg-gradient-to-b from-yellow-500/20 to-[#0a0a0a] border border-yellow-500/50 rounded-t-2xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.15)] relative z-10 transition-transform group-hover:-translate-y-2">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-yellow-400 text-yellow-950 font-black text-2xl flex items-center justify-center rounded-full border-4 border-[#050505] shadow-[0_0_20px_rgba(234,179,8,0.6)] z-20">
                        1
                      </div>
                      
                      <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2 opacity-80" />
                      
                      <div className="w-24 h-24 mx-auto bg-[#111] border-2 border-yellow-500/80 rounded-2xl flex items-center justify-center text-4xl font-bold text-yellow-500 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        {top3[0].username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="font-black text-2xl text-white mb-1 flex items-center justify-center gap-2">
                        {top3[0].username}
                        {profile?.id === top3[0].id && <span className="text-[9px] font-mono bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase">YOU</span>}
                      </div>
                      <div className="text-[10px] font-mono text-yellow-500/80 tracking-widest uppercase mb-8">{top3[0].title}</div>
                      
                      <div className="flex justify-between border-t border-yellow-500/20 pt-6">
                        <div className="text-left">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">STREAK</div>
                          <div className="text-sm font-bold text-white flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {top3[0].best_streak} Days</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">TOTAL XP</div>
                          <div className="text-lg font-black text-yellow-500 flex items-center gap-1 justify-end"><Zap className="w-4 h-4" /> {top3[0].total_xp.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    {/* Podium base */}
                    <div className="h-6 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-b-xl border-x border-b border-yellow-500 shadow-[0_10px_20px_rgba(234,179,8,0.2)]"></div>
                  </div>
                )}
                
                {/* RANK 3 - BRONZE */}
                {top3[2] && (
                  <div className="w-full md:w-72 order-3 md:order-3 relative group">
                    <div className="bg-gradient-to-b from-orange-700/20 to-[#0a0a0a] border border-orange-700/40 rounded-t-2xl p-6 text-center shadow-[0_0_30px_rgba(194,65,12,0.05)] relative z-10 transition-transform group-hover:-translate-y-2">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-600 text-orange-50 font-black text-xl flex items-center justify-center rounded-full border-4 border-[#050505] shadow-[0_0_15px_rgba(194,65,12,0.5)] z-20">
                        3
                      </div>
                      
                      <div className="w-20 h-20 mx-auto bg-[#111] border-2 border-orange-700/60 rounded-xl flex items-center justify-center text-3xl font-bold text-orange-500 mt-4 mb-4">
                        {top3[2].username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="font-bold text-xl text-white mb-1 flex items-center justify-center gap-2">
                        {top3[2].username}
                        {profile?.id === top3[2].id && <span className="text-[9px] font-mono bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded uppercase">YOU</span>}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-6">{top3[2].title}</div>
                      
                      <div className="flex justify-between border-t border-orange-700/20 pt-4">
                        <div className="text-left">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">STREAK</div>
                          <div className="text-xs font-bold text-white flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {top3[2].best_streak} Days</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">TOTAL XP</div>
                          <div className="text-sm font-black text-orange-500 flex items-center gap-1 justify-end"><Zap className="w-3 h-3" /> {top3[2].total_xp.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    {/* Podium base */}
                    <div className="h-3 bg-orange-700/30 rounded-b-xl border-x border-b border-orange-700/40"></div>
                  </div>
                )}
                
              </div>
            )}

            {/* RANKING TABLE */}
            {rest.length > 0 && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111] border-b border-white/5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                      <tr>
                        <th className="px-8 py-4 w-16">RANK</th>
                        <th className="px-6 py-4">OPERATOR</th>
                        <th className="px-6 py-4">TITLE</th>
                        <th className="px-6 py-4">LEVEL</th>
                        <th className="px-6 py-4">STREAK</th>
                        <th className="px-8 py-4 text-right">TOTAL XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rest.map((user, idx) => {
                        const globalRank = idx + 4;
                        const isCurrentUser = profile?.id === user.id;
                        
                        return (
                          <tr 
                            key={user.id} 
                            className={`transition-colors group
                              ${isCurrentUser ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-[#111]'}
                            `}
                          >
                            <td className="px-8 py-4 relative">
                              {isCurrentUser && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
                              <span className="font-mono font-bold text-slate-400 text-lg">{globalRank}</span>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded bg-[#111] border flex items-center justify-center font-bold text-sm shrink-0
                                  ${isCurrentUser ? 'border-red-500/40 text-red-500' : 'border-white/10 text-slate-400'}
                                `}>
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`font-bold ${isCurrentUser ? 'text-red-400' : 'text-slate-200'}`}>
                                    {isCurrentUser ? `YOU (${user.username})` : user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <span className={`text-[11px] font-mono ${isCurrentUser ? 'text-red-300' : 'text-blue-400'}`}>
                                {user.title}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center w-7 h-7 rounded border border-white/10 bg-[#111] font-mono font-bold text-white text-[11px]">
                                {user.level}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                {user.best_streak} Days
                              </div>
                            </td>
                            
                            <td className="px-8 py-4 text-right">
                              <span className="font-mono text-yellow-500 font-bold text-base flex justify-end items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" />
                                {user.total_xp.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* MOTIVATIONAL FOOTER */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-[#111] border border-white/5 p-6 rounded-xl">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <Crown className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Climb the ranks!</div>
                  <div className="text-xs text-slate-400">Complete missions and earn XP to become the ultimate DevOps Operator.</div>
                </div>
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
}
