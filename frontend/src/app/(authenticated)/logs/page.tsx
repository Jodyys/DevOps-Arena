"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LogsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await fetchApi('/auth/me');
        if (profileRes.success) {
          setProfile(profileRes.data);
        } else {
          router.push('/login');
        }
      } catch (err: any) {
        console.error(err);
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

  if (!profile) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full font-sans text-slate-300">
      
      <Link href="/dashboard" className="inline-flex items-center text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors mb-6 uppercase tracking-widest">
        <ArrowLeft className="w-3 h-3 mr-2" /> Back to Dashboard
      </Link>

      <header className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-red-500" />
          OPERATOR LOGBOOK
        </h1>
        <p className="text-slate-400">Complete history of your operations and achievements.</p>
      </header>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="space-y-6">
          {profile.incidentFeed && profile.incidentFeed.length > 0 ? (
            profile.incidentFeed.map((log: any, i: number) => {
              const isMission = log.type === 'mission';
              const isSuccess = log.status === 'completed';
              return (
                <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0 hover:bg-[#111] p-4 -mx-4 rounded-xl transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-[0_0_10px_currentColor] ${isMission ? (isSuccess ? 'bg-emerald-500 text-emerald-500' : 'bg-yellow-500 text-yellow-500') : 'bg-blue-500 text-blue-500'}`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-200 mb-1 leading-snug">
                      {isMission ? `Mission "${log.title}" ${log.status}` : `Achievement Unlocked: ${log.title}`}
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-4">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span className="uppercase px-2 py-0.5 bg-white/5 rounded border border-white/10">{log.type}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-600 font-mono text-center py-12">No historical activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
