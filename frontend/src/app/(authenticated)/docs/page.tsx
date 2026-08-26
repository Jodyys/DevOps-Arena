"use client";

import React from 'react';
import { Map, BookOpen, FileText, ExternalLink, Terminal } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full font-sans text-slate-300">
      <header className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
          <Map className="w-8 h-8 text-red-500" />
          ARENA DOCUMENTATION
        </h1>
        <p className="text-slate-400">Official technical guides and command references.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500" /> Getting Started with Sandboxes
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-slate-400">
              <p>Welcome to DevOps Arena! This platform provisions real, isolated Kubernetes namespaces for every mission. You have full root access to your containerized environment.</p>
              <h3 className="text-slate-200 mt-6 mb-2 font-bold">Standard Workflow</h3>
              <ul className="list-disc pl-5 space-y-2 font-mono text-[11px]">
                <li>Select a mission from the Skill Map.</li>
                <li>Read the Incident Report.</li>
                <li>Click "Start Mission" to provision your K8s namespace.</li>
                <li>Open the integrated terminal or SSH into your pod.</li>
                <li>Fix the underlying infrastructure issue.</li>
                <li>Click "Verify" to run the automated tests.</li>
              </ul>
              
              <div className="mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="text-red-400 font-bold text-xs uppercase tracking-widest mb-2">Warning</div>
                <p className="text-xs">Do not attempt to break out of the sandbox. Malicious activity is logged and may result in an immediate operator ban.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2">QUICK LINKS</div>
          
          {[
            { title: "Docker Commands", icon: FileText },
            { title: "Kubernetes Cheatsheet", icon: FileText },
            { title: "Linux Networking", icon: BookOpen },
            { title: "CI/CD Pipeline Setup", icon: BookOpen },
          ].map((doc, i) => (
            <div key={i} className="bg-[#0a0a0a] hover:bg-[#111] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-4 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <doc.icon className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{doc.title}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
