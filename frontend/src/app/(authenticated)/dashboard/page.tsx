"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ShieldAlert, CheckCircle2, Flame, Activity, ArrowRight, Play, XCircle, RotateCcw, Crown } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

const TOTAL_MISSIONS = 23;

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetchApi('/auth/reset', { method: 'POST' });
      localStorage.removeItem('token');
      router.push('/login');
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

        const data = await fetchApi('/auth/me');
        if (data.success) {
          setProfile(data.data);
        } else {
          router.push('/login');
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
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex h-64 items-center justify-center">
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-6 rounded-lg text-center max-w-md">
         <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
         <h2 className="text-xl font-bold mb-2">Connection Error</h2>
         <p>{error}</p>
         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  if (!profile) return null;

  const xpPercentage = Math.min(100, Math.round((profile.total_xp / profile.nextLevelXp) * 100));
  const allMissionsDone = (profile.completed_missions || 0) >= TOTAL_MISSIONS;

  return (
    <div className="space-y-6">
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <div className="flex items-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                <RotateCcw className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Reset Game Progress</h2>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              This will reset <span className="text-red-400 font-bold">all your XP, completed missions, and achievements</span>. 
              Your account and profile will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                ) : (
                  <><RotateCcw className="w-4 h-4" /> Confirm Reset</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* All Missions Complete Banner */}
      {allMissionsDone && (
        <div className="bg-gradient-to-r from-yellow-900/60 via-yellow-800/40 to-yellow-900/60 border border-yellow-500/60 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-xl border border-yellow-500/40">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-300">🎉 All Missions Complete!</h2>
              <p className="text-yellow-200/70 text-sm">You've conquered the DevOps Arena. Ready to go again?</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome & XP Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert className="w-48 h-48 text-blue-500" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Welcome back, {profile.username}
          </h1>
          <p className="text-blue-400 font-medium mb-8 text-lg">
            Level {profile.level} — {profile.title}
          </p>

          <div className="max-w-2xl">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-300">XP Progress</span>
              <span className="text-blue-400">{profile.total_xp.toLocaleString()} / {profile.nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out relative"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjBMMjAgMEwyMCAyMEgwWiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+')] opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Summary */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center">
          <div className="bg-blue-500/20 p-4 rounded-lg mr-4 border border-blue-500/30">
            <CheckCircle2 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-100">{profile.completed_missions || 0}</div>
            <div className="text-sm font-medium text-slate-400">Missions Completed</div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center">
          <div className="bg-yellow-500/20 p-4 rounded-lg mr-4 border border-yellow-500/30">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-100">
              {profile.achievements?.filter((a: any) => a.unlocked).length || 0}
            </div>
            <div className="text-sm font-medium text-slate-400">Achievements Unlocked</div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center">
          <div className="bg-orange-500/20 p-4 rounded-lg mr-4 border border-orange-500/30">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-100">
              {profile.streak || 0} Day{profile.streak !== 1 ? 's' : ''}
            </div>
            <div className="text-sm font-medium text-slate-400">Current Streak</div>
          </div>
        </div>
        
        {/* CTA (Continue Learning) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          {profile.continueMissionId ? (
            <>
              <h3 className="text-xl font-bold text-white mb-2">Continue Learning</h3>
              <p className="text-blue-100 text-sm mb-4">You have unlocked a new mission in the Arena.</p>
              <Link href={`/missions/${profile.continueMissionId}`} className="px-6 py-2 bg-white text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors w-full flex items-center justify-center">
                <Play className="w-4 h-4 mr-2" fill="currentColor" /> Play Next
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-2">Ready for Action?</h3>
              <p className="text-blue-100 text-sm mb-4">Jump into the Arena and solve new challenges.</p>
              <Link href="/levels" className="px-6 py-2 bg-white text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors w-full">
                Enter Arena
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" /> 
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {(!profile.incidentFeed || profile.incidentFeed.length === 0) ? (
                <div className="text-center py-8 text-slate-500 italic">No recent activity yet.</div>
              ) : (
                profile.incidentFeed.map((item: any, i: number) => {
                  if (item.type === 'achievement') {
                    return (
                      <div key={`ach-${item.id}-${i}`} className="flex items-center p-4 bg-slate-900/50 border border-yellow-500/20 rounded-lg">
                        <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                          <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-yellow-400">Achievement unlocked</div>
                          <div className="text-slate-200">{item.title}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  } else {
                    const isSuccess = item.status === 'completed';
                    return (
                      <div key={`mis-${item.id}-${i}`} className={`flex items-center p-4 bg-slate-900/50 border rounded-lg ${isSuccess ? 'border-green-500/20' : 'border-red-500/20'}`}>
                        <div className={`p-2 rounded-lg mr-4 ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-200">{item.title} {isSuccess ? 'completed' : 'failed'}</div>
                            <div className={`text-sm font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                              {item.xp > 0 ? `+${item.xp}` : item.xp} XP
                            </div>
                          </div>
                          <div className="text-sm text-slate-400 mt-1 flex justify-between">
                            <span>Mission M-{item.mission_id}</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Detailed Stats */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">Player Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Best Streak</span>
                <span className="font-bold text-slate-200 flex items-center">
                  {profile.best_streak || 0} <Flame className="w-4 h-4 ml-1 text-orange-500" />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Achievements</span>
                <span className="font-bold text-slate-200">
                  {profile.achievements?.filter((a: any) => a.unlocked).length || 0} / {profile.achievements?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Missions Done</span>
                <span className="font-bold text-slate-200">
                  {profile.completed_missions || 0} / {TOTAL_MISSIONS}
                </span>
              </div>
            </div>

            {/* Reset button — always visible */}
            <button
              onClick={() => setShowResetModal(true)}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-500/60 text-slate-400 hover:text-red-400 text-sm font-medium rounded-lg transition-all group"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Reset Progress
            </button>
          </div>

          {/* Achievements Preview */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2 flex justify-between items-center">
              <span>Recent Unlocks</span>
              <Link href="/achievements" className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {profile.achievements?.filter((a: any) => a.unlocked).slice(0, 6).map((ach: any) => (
                <div key={ach.id} title={ach.name} className="bg-slate-900 border border-yellow-500/30 rounded-lg p-3 text-center shadow-[0_0_10px_rgba(250,204,21,0.1)]">
                  <div className="text-2xl">{ach.icon}</div>
                </div>
              ))}
              {profile.achievements?.filter((a: any) => a.unlocked).length === 0 && (
                <div className="col-span-3 text-center text-sm text-slate-500 py-4">No achievements yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
