"use client";

import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Bell, CheckCircle2, Trophy, Clock, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function Topbar({ profile }: { profile: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getBreadcrumb = () => {
    const path = pathname.split('/').filter(p => p);
    if (path.length === 0) return 'Dashboard';
    return path.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  const getNotifications = () => {
    const notifs = [];
    if (profile?.achievements) {
      const unlocked = profile.achievements.filter((a: any) => a.unlocked);
      unlocked.sort((a: any, b: any) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime());
      
      notifs.push(...unlocked.slice(0, 5).map((a: any) => ({
        id: `ach-${a.id}`,
        title: 'Achievement Unlocked!',
        message: a.name,
        icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        time: new Date(a.unlocked_at)
      })));
    }
    
    if (profile && notifs.length === 0) {
      notifs.push({
        id: 'welcome',
        title: 'System Online',
        message: 'Welcome to DevOps Arena. Ready for training.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        time: new Date()
      });
    }

    return notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center text-slate-400 text-sm font-mono uppercase tracking-wider">
        <span className="text-slate-500">Arena</span>
        <ChevronRight className="w-4 h-4 mx-2 text-slate-600" />
        <span className="text-red-500 font-bold">{getBreadcrumb()}</span>
      </div>

      <div className="flex items-center h-full">
        {profile && (
          <div className="hidden md:flex items-center h-full px-6 border-l border-white/5">
            <div className="text-right mr-4">
              <div className="text-xs font-bold text-slate-100 uppercase tracking-widest">Level {profile.level}</div>
              <div className="text-[10px] text-red-500 font-mono uppercase">{profile.title}</div>
            </div>
            <div className="w-32">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                <span>XP Progress</span>
                <span>{profile.total_xp || 0} / {profile.nextLevelXp || 200}</span>
              </div>
              <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-red-500 h-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  style={{ width: `${Math.min(100, ((profile.total_xp || 0) / (profile.nextLevelXp || 200)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center h-full px-4 border-l border-white/5 relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`text-slate-500 hover:text-slate-300 transition-colors relative ${showNotifications ? 'text-white' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-16 mt-2 w-80 bg-[#0a0a0a] border border-white/5 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#111111]">
                <span className="font-bold text-slate-200 text-xs tracking-widest uppercase">Notifications</span>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-[#111111] transition-colors flex items-start gap-3">
                      <div className="bg-[#1a1a1a] p-2 rounded-full shrink-0 border border-white/5">
                        {n.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{n.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{n.message}</div>
                        <div className="text-[10px] text-slate-500 mt-2 flex items-center">
                           <Clock className="w-3 h-3 mr-1" />
                           {n.time.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center h-full px-6 border-l border-white/5 gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-300 leading-tight">{profile?.username || 'admin'}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">OPERATOR</span>
            </div>
            <div className="w-8 h-8 border border-red-500/40 rounded bg-black shadow-[0_0_10px_rgba(239,68,68,0.3)] relative overflow-hidden">
               <img 
                 src="/hacker-avatar.jpg" 
                 className="w-full h-full object-cover object-top" 
                 alt="Avatar" 
                 style={{ 
                   filter: `hue-rotate(${
                     String(profile?.username || 'admin').split('').reduce((hash, char) => {
                       return char.charCodeAt(0) + ((hash << 5) - hash);
                     }, 0) % 360
                   }deg)` 
                 }}
               />
               <div className="absolute inset-0 ring-1 ring-inset ring-red-500/30 rounded pointer-events-none"></div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-slate-500 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
