"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Lock, ShieldAlert } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Achievements() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // We can re-use the /auth/me endpoint since it returns all achievements
        const data = await fetchApi('/auth/me');
        if (data.success && data.data.achievements) {
          setAchievements(data.data.achievements);
        } else {
          setError("Failed to load achievements");
        }
      } catch (err: any) {
        console.error("Achievements error", err);
        setError(err.message || "Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
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

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-2">
          <Trophy className="w-8 h-8 text-yellow-400 mr-4" />
          <h1 className="text-3xl font-bold text-slate-100">Achievements</h1>
        </div>
        <p className="text-slate-400">
          Unlock badges by completing missions, learning new skills, and proving your worth. 
          You have unlocked <span className="text-yellow-400 font-bold">{unlockedCount}</span> out of {achievements.length} achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`p-6 rounded-xl border relative overflow-hidden transition-all ${
              ach.unlocked 
                ? 'bg-slate-800 border-slate-600 shadow-[0_0_20px_rgba(250,204,21,0.05)]' 
                : 'bg-slate-900 border-slate-800 opacity-75'
            }`}
          >
            {/* Background glow for unlocked */}
            {ach.unlocked && (
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-[30px]"></div>
            )}
            
            <div className="flex items-start">
              <div className={`text-4xl mr-4 p-3 rounded-lg ${ach.unlocked ? 'bg-yellow-500/10' : 'bg-slate-800 grayscale'}`}>
                {ach.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${ach.unlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {ach.unlocked ? ach.name : '???'}
                </h3>
                <p className={`text-sm ${ach.unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {ach.description}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  {ach.unlocked ? (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> LOCKED
                    </span>
                  )}
                  
                  {ach.unlocked && ach.unlocked_at && (
                    <span className="text-xs text-slate-500">
                      {new Date(ach.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
