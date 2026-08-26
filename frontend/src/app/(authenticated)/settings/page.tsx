"use client";

import React from 'react';
import { Server, Settings, ShieldAlert, Cpu, Terminal, Key } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full font-sans text-slate-300">
      <header className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
          <Server className="w-8 h-8 text-red-500" />
          SYSTEM CONFIGURATION
        </h1>
        <p className="text-slate-400">Manage Arena parameters and operator settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Settings Card 1 */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Environment</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#111] border border-white/5 rounded-lg">
              <div>
                <div className="text-sm font-bold text-slate-200">Sandbox Auto-Destroy</div>
                <div className="text-[10px] text-slate-500 font-mono">Clean up sandboxes after 2 hours</div>
              </div>
              <div className="w-10 h-5 bg-red-500 rounded-full relative shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-[#111] border border-white/5 rounded-lg">
              <div>
                <div className="text-sm font-bold text-slate-200">Debug Logging</div>
                <div className="text-[10px] text-slate-500 font-mono">Verbose terminal output</div>
              </div>
              <div className="w-10 h-5 bg-slate-800 rounded-full relative">
                <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Card 2 */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Security</h2>
          </div>
          
          <div className="space-y-4 text-center py-6">
             <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
             <div className="text-sm font-bold text-slate-300">Advanced settings restricted</div>
             <p className="text-xs text-slate-500 max-w-xs mx-auto">You need Arena Administrator privileges to modify security rules and API keys.</p>
          </div>
        </div>

      </div>
      
      <div className="mt-8 flex justify-end">
         <button className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest text-[11px] uppercase rounded-md shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-colors">
           Save Configuration
         </button>
      </div>
    </div>
  );
}
