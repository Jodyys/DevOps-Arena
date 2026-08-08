"use client";

import React, { useEffect, useState, useRef } from 'react';
import { LogOut, User, Bell, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function Topbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/auth/me');
        if (data.success) {
          setProfile(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    };
    fetchProfile();
  }, []);

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

  // Generate notifications from achievements and profile state
  const getNotifications = () => {
    const notifs = [];
    if (profile?.achievements) {
      const unlocked = profile.achievements.filter((a: any) => a.unlocked);
      unlocked.sort((a: any, b: any) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime());
      
      notifs.push(...unlocked.slice(0, 5).map((a: any) => ({
        id: `ach-${a.id}`,
        title: 'Achievement Unlocked!',
        message: a.name,
        icon: <Trophy className="w-5 h-5 text-yellow-400" />,
        time: new Date(a.unlocked_at)
      })));
    }
    
    // Add a welcome/status notification
    if (profile && notifs.length === 0) {
      notifs.push({
        id: 'welcome',
        title: 'System Online',
        message: 'Welcome to DevOps Arena. Ready for training.',
        icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        time: new Date()
      });
    }

    return notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center text-slate-300">
        {profile && (
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-slate-100">{profile.username}</span>
            <span className="text-xs text-blue-400 font-medium">Level {profile.level} • {profile.title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 relative">
        {profile && (
          <div className="flex items-center bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <span className="text-xs font-bold text-yellow-400 mr-2">XP</span>
            <span className="text-sm font-mono font-medium text-slate-200">
              {profile.total_xp.toLocaleString()} <span className="text-slate-500">/ {profile.nextLevelXp.toLocaleString()}</span>
            </span>
          </div>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`text-slate-400 hover:text-slate-200 transition-colors relative p-2 rounded-full ${showNotifications ? 'bg-slate-800 text-white' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <span className="font-bold text-slate-200 text-sm">NOTIFICATIONS</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors flex items-start gap-3">
                      <div className="bg-slate-900 p-2 rounded-full shrink-0">
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

        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
}
