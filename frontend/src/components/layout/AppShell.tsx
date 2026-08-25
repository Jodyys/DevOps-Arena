"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { fetchApi } from '@/lib/api';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchApi('/auth/me').then(res => {
      if (res.success) setProfile(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-slate-50 overflow-hidden font-sans">
      <Sidebar profile={profile} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
