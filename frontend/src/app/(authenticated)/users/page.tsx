"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Users, Search, Activity, Calendar, Zap, Award, ChevronLeft, ChevronRight, ShieldAlert, CircleDashed } from 'lucide-react';
import Link from 'next/link';

// Helper to match backend level logic
const getLevelFromXp = (xp: number) => {
  if (xp >= 40000) return 15;
  if (xp >= 35000) return 14;
  if (xp >= 30000) return 13;
  if (xp >= 25000) return 12;
  if (xp >= 20000) return 11;
  if (xp >= 15000) return 10;
  if (xp >= 10000) return 9;
  if (xp >= 7500) return 8;
  if (xp >= 5000) return 7;
  if (xp >= 3000) return 6;
  if (xp >= 1500) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, profileRes] = await Promise.all([
          fetchApi('/users'),
          fetchApi('/auth/me')
        ]);
        if (usersRes.data) setUsers(usersRes.data);
        if (profileRes.data) setProfile(profileRes.data);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Stats calculation
  const totalOperators = users.length;
  const now = new Date().getTime();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const activeThisMonth = users.filter(u => u.last_active_at && new Date(u.last_active_at).getTime() > thirtyDaysAgo).length;
  const totalXp = users.reduce((acc, u) => acc + (u.total_xp || 0), 0);
  const avgLevel = totalOperators > 0 ? (users.reduce((acc, u) => acc + getLevelFromXp(u.total_xp || 0), 0) / totalOperators).toFixed(1) : "0";
  const newThisMonth = users.filter(u => new Date(u.created_at).getTime() > thirtyDaysAgo).length;
  const activePct = totalOperators > 0 ? ((activeThisMonth / totalOperators) * 100).toFixed(1) : "0";

  // Status helper
  const getStatus = (lastActiveAt: string | null) => {
    if (!lastActiveAt) return { text: 'INACTIVE', color: 'text-red-500', icon: <ShieldAlert className="w-3 h-3" />, dot: 'bg-red-500' };
    const daysSinceActive = (now - new Date(lastActiveAt).getTime()) / (1000 * 3600 * 24);
    if (daysSinceActive < 2) return { text: 'ACTIVE', color: 'text-emerald-500', icon: <Activity className="w-3 h-3" />, dot: 'bg-emerald-500' };
    if (daysSinceActive < 7) return { text: 'IDLE', color: 'text-yellow-500', icon: <CircleDashed className="w-3 h-3" />, dot: 'bg-yellow-500' };
    return { text: 'INACTIVE', color: 'text-red-500', icon: <ShieldAlert className="w-3 h-3" />, dot: 'bg-red-500' };
  };

  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diffDays = Math.floor((now - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 0) return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen pb-16 font-sans text-slate-300 selection:bg-red-500/30 selection:text-red-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">User Management</h1>
            </div>
            <p className="text-slate-400 text-sm">Manage operators and view system activity.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search operators..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#111] border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>
            {/* Keeping visual button but it only works if backend has a route. Since it doesn't, we just visually show it as disabled/mock for the UI screenshot matching. */}
            <button className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              + Add Operator
            </button>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">TOTAL OPERATORS</div>
                <div className="text-2xl font-black text-white">{totalOperators}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">ACTIVE THIS MONTH</div>
                <div className="text-2xl font-black text-white">{activeThisMonth}</div>
              </div>
            </div>
            <div className="absolute bottom-3 right-4 text-[10px] text-slate-500 font-mono">{activePct}% of total</div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">TOTAL XP EARNED</div>
                <div className="text-2xl font-black text-white">{totalXp.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">AVG. LEVEL</div>
                <div className="text-2xl font-black text-white">{avgLevel}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">NEW THIS MONTH</div>
                <div className="text-2xl font-black text-white">{newThisMonth}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-6 border-b border-white/5 w-full md:w-auto px-2">
            <button className="pb-3 border-b-2 border-red-500 text-white text-[10px] font-bold tracking-widest uppercase">ALL</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-[10px] font-bold tracking-widest uppercase transition-colors">ACTIVE</button>
            <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-[10px] font-bold tracking-widest uppercase transition-colors">INACTIVE</button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-20 bg-[#0a0a0a] rounded-xl border border-white/5">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#111] border-b border-white/10 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                  <tr>
                    <th className="px-6 py-4">OPERATOR</th>
                    <th className="px-6 py-4">ROLE</th>
                    <th className="px-6 py-4">LEVEL</th>
                    <th className="px-6 py-4">TOTAL XP</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">JOINED DATE</th>
                    <th className="px-6 py-4">LAST ACTIVE</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedUsers.map((user) => {
                    const isCurrentUser = profile && profile.id === user.id;
                    const status = getStatus(user.last_active_at);
                    const lvl = getLevelFromXp(user.total_xp || 0);
                    const isSysAdmin = user.username === 'admin';
                    
                    return (
                      <tr 
                        key={user.id} 
                        className={`transition-colors group
                          ${isCurrentUser ? 'bg-red-500/5 hover:bg-red-500/10 relative' : 'hover:bg-[#111]'}
                        `}
                      >
                        {isCurrentUser && <td className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></td>}
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 border
                              ${isCurrentUser ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-[#151515] border-white/10 text-slate-400'}
                            `}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className={`font-bold ${isCurrentUser ? 'text-red-400' : 'text-slate-200'}`}>
                                  {user.username}
                                </div>
                                {isCurrentUser && (
                                  <span className="text-[8px] font-mono font-bold tracking-widest bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase">YOU</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded border
                            ${isSysAdmin ? 'bg-red-950 border-red-900 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-400'}
                          `}>
                            {isSysAdmin ? 'ADMIN' : 'OPERATOR'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded border border-white/10 bg-[#111] font-mono font-bold text-white text-xs">
                            {lvl}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="font-mono text-blue-400 font-bold">{user.total_xp?.toLocaleString() || 0} XP</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 text-xs font-bold tracking-wider ${status.color}`}>
                            <div className={`w-2 h-2 rounded-full ${status.dot} ${status.text === 'ACTIVE' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></div>
                            {status.text}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-400 font-mono">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`text-xs font-mono ${status.text === 'ACTIVE' ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                            {getRelativeTime(user.last_active_at)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors px-3 py-1.5 border border-white/5 hover:border-white/20 rounded bg-[#111] hover:bg-white/5">
                            VIEW LOG
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="bg-[#080808] border-t border-white/5 px-6 py-4 flex items-center justify-between text-xs font-mono text-slate-500">
                <div>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} operators
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({length: totalPages}).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 rounded flex items-center justify-center font-bold ${currentPage === i + 1 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'hover:bg-white/5'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                <Users className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-white font-bold mb-2">No operators found</h3>
                <p className="text-slate-500 text-sm">No one matches your search "{search}".</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
