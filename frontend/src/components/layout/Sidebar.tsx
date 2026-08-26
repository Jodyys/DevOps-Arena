"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Trophy, Server, Users, Medal } from 'lucide-react';

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname();

  const linksLearning = [
    { href: '/levels', label: 'Skill Map', icon: Map },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
  ];

  const linksCommunity = [
    { href: '/leaderboard', label: 'Leaderboard', icon: Medal },
    { href: '/users', label: 'User Management', icon: Users },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#050505]/95 backdrop-blur-md hidden md:flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="border border-red-500 px-1.5 py-0.5 bg-red-500/10 text-red-500 font-mono font-bold text-xs">{`>_`}</div>
          <span className="text-base font-bold tracking-widest text-white">
            DEVOPS <span className="text-red-500">ARENA</span>
          </span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        
        <div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
            Command Center
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center px-4 py-2.5 rounded-md transition-all duration-200 group ${
              pathname === '/dashboard' 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                : 'text-slate-400 hover:bg-[#111111] hover:text-slate-200 border border-transparent'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 mr-3 ${pathname === '/dashboard' ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
            <span className="font-mono text-sm tracking-wide">Dashboard</span>
          </Link>
        </div>

        <div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
            Learning
          </div>
          <div className="space-y-1">
            {linksLearning.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2.5 rounded-md transition-all duration-200 group ${
                    isActive 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : 'text-slate-400 hover:bg-[#111111] hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <span className="font-mono text-sm tracking-wide">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
            Community
          </div>
          <div className="space-y-1">
            {linksCommunity.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2.5 rounded-md transition-all duration-200 group ${
                    isActive 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : 'text-slate-400 hover:bg-[#111111] hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  <span className="font-mono text-sm tracking-wide">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
            System
          </div>
          <div className="space-y-1">
            <Link
              href="/settings"
              className={`flex items-center px-4 py-2.5 rounded-md transition-all duration-200 group text-slate-400 hover:bg-[#111111] hover:text-slate-200 border border-transparent`}
            >
              <Server className={`w-4 h-4 mr-3 text-slate-500 group-hover:text-slate-400`} />
              <span className="font-mono text-sm tracking-wide">Settings</span>
            </Link>
            <Link
              href="/docs"
              className={`flex items-center px-4 py-2.5 rounded-md transition-all duration-200 group text-slate-400 hover:bg-[#111111] hover:text-slate-200 border border-transparent`}
            >
              <Map className={`w-4 h-4 mr-3 text-slate-500 group-hover:text-slate-400`} />
              <span className="font-mono text-sm tracking-wide">Documentation</span>
            </Link>
          </div>
        </div>

      </nav>

      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/50">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
          Player Summary
        </div>
        <div className="px-2">
          {profile ? (
            <>
              <div className="font-bold text-slate-200 text-sm">Level {profile.level || 1}</div>
              <div className="text-red-500 text-xs font-mono mb-3">{profile.title || 'DevOps Rookie'}</div>
              <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden mb-1 border border-white/5">
                <div 
                  className="bg-red-500 h-full rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                  style={{ width: `${Math.min(100, ((profile.total_xp || 0) / (profile.nextLevelXp || 200)) * 100)}%` }}
                ></div>
              </div>
              <div className="text-[9px] text-slate-500 font-mono text-right mb-4">
                {profile.total_xp || 0} / {profile.nextLevelXp || 200} XP
              </div>
              <Link href="/profile" className="flex items-center justify-between px-3 py-2 border border-white/10 rounded bg-[#111111] hover:bg-slate-800 text-[10px] font-mono tracking-widest uppercase text-slate-300 transition-colors group">
                VIEW PROFILE
                <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </>
          ) : (
            <div className="text-xs text-slate-500 animate-pulse">Loading profile...</div>
          )}
        </div>
      </div>
    </aside>
  );
}
