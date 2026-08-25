"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Trophy, Medal, Flame, Star, Shield, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await fetchApi('/users/leaderboard');
        if (res.data) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-yellow-500/10 border-yellow-500/50 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]";
      case 1: return "bg-slate-300/10 border-slate-300/50 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.1)]";
      case 2: return "bg-amber-700/10 border-amber-700/50 text-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.1)]";
      default: return "bg-[#111] border-white/5 text-slate-400";
    }
  };

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-slate-300" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="font-mono font-bold text-sm">#{index + 1}</span>;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          ARENA LEADERBOARD
          <Trophy className="w-8 h-8 text-yellow-500" />
        </h1>
        <p className="text-slate-400">Top Operators in the DevOps Arena</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, idx) => (
            <div 
              key={user.id} 
              className={`flex items-center p-4 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${getRankStyle(idx)}`}
            >
              <div className="w-12 flex justify-center">
                {getRankIcon(idx)}
              </div>
              
              <div className="flex-1 px-4">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg font-bold ${idx < 3 ? 'text-white' : 'text-slate-200'}`}>
                    {user.username}
                  </h3>
                  {idx === 0 && <Shield className="w-4 h-4 text-yellow-500" />}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest opacity-80 flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  {user.title} • Level {user.level}
                </div>
              </div>
              
              <div className="px-6 text-right border-l border-white/10 hidden md:block">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Highest Streak</div>
                <div className="font-mono font-bold text-orange-500 flex items-center justify-end gap-1">
                  <Flame className="w-4 h-4" />
                  {user.best_streak} Days
                </div>
              </div>
              
              <div className="px-6 text-right border-l border-white/10">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total XP</div>
                <div className={`font-mono font-black text-xl ${idx === 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {user.total_xp.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center p-12 border border-white/5 rounded-lg bg-[#111]">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Operators Yet</h3>
              <p className="text-slate-400">Be the first to score points in the Arena!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
